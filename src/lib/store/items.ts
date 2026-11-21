import 'server-only';
import type { PublicItemView } from '@buildbase/sdk';
import { logger } from '@/lib/logger';
import { STORE_ITEMS_TAG } from './item-tags';
import { toPublicItem } from './public-item';

export { STORE_ITEMS_TAG };

/**
 * The store's published items, read on the server so prices are in the HTML
 * of `/` and `/pricing` (crawlers and AI search see them, and the page can
 * emit `Offer` JSON-LD).
 *
 * Read with the org API token (BUILDBASE_API_TOKEN, whose API role needs
 * `marketplace_items` read beside content-reader) from the server commerce
 * API, cached in Next's data cache under STORE_ITEMS_TAG. The BuildBase
 * webhook route revalidates that tag on every `item.*` event, so a price
 * change or a newly published item shows on the next request.
 *
 * `source: 'unavailable'` (no token, the role lacks the permission, the API
 * is down) means "unknown", not "nothing on sale": the page then falls back
 * to the browser read it used before, so a missing token can never hide a
 * product that is on sale.
 */

export interface StoreItems {
  source: 'server' | 'unavailable';
  items: PublicItemView[];
}

const BASE = (process.env.NEXT_PUBLIC_BUILDBASE_SERVER_URL ?? '').replace(
  /\/$/,
  ''
);

export async function getStoreItems(): Promise<StoreItems> {
  const token = process.env.BUILDBASE_API_TOKEN;
  if (!token || !BASE) return { source: 'unavailable', items: [] };

  const url = new URL(`${BASE}/api/v1/server/commerce/items`);
  url.searchParams.set('sellerType', 'org');
  url.searchParams.set('status', 'published');
  url.searchParams.set('limit', '50');

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      // Literal on purpose: Next reads it statically. Matches
      // CONTENT_REVALIDATE_SECONDS; the webhook refreshes sooner.
      next: { tags: [STORE_ITEMS_TAG], revalidate: 3600 },
    });
    if (!res.ok) {
      logger.warn('Store items: server read refused', { status: res.status });
      return { source: 'unavailable', items: [] };
    }
    const body = (await res.json()) as { docs?: unknown[] } | null;
    const items = (body?.docs ?? [])
      .map(toPublicItem)
      .filter((item): item is PublicItemView => item !== null);
    return { source: 'server', items };
  } catch (error) {
    logger.warn('Store items: server read failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { source: 'unavailable', items: [] };
  }
}

/** True when at least one variant has a price a buyer can pay now. */
export function hasOffers(items: PublicItemView[]): boolean {
  return items.some((item) => item.variants.some((v) => v.prices.length > 0));
}

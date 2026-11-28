import 'server-only';
import { environmentId, type PublicItemView } from '@buildbase/sdk';
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
 * Without the token, or when that read fails, it reads the public guest API
 * instead (`/api/v1/guest/{org}/items`, no credentials): the same published
 * items a buyer's browser reads with `usePublishedItems`, so the prices are
 * in the HTML even then and the home page needs no BuildBase provider
 * (studio issue #79).
 *
 * `source: 'unavailable'` (both reads failed: the API is down) means
 * "unknown", not "nothing on sale": the page then falls back to the browser
 * read it used before, so a failed read can never hide a product that is on
 * sale.
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
  if (!BASE) return { source: 'unavailable', items: [] };
  return (await readWithToken()) ?? (await readAsGuest());
}

/** The org-token read, or null without a token or when it fails. */
async function readWithToken(): Promise<StoreItems | null> {
  const token = process.env.BUILDBASE_API_TOKEN;
  if (!token) return null;

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
      return null;
    }
    return { source: 'server', items: toItems(await res.json()) };
  } catch (error) {
    logger.warn('Store items: server read failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/** The public read a buyer's browser makes, from the server. */
async function readAsGuest(): Promise<StoreItems> {
  const orgId = process.env.NEXT_PUBLIC_BUILDBASE_ORG_ID;
  if (!orgId) return { source: 'unavailable', items: [] };
  try {
    const org = environmentId(
      orgId,
      process.env.NEXT_PUBLIC_BUILDBASE_ENVIRONMENT || undefined
    );
    const url = new URL(
      `${BASE}/api/v1/guest/${encodeURIComponent(org)}/items`
    );
    url.searchParams.set('sellerType', 'org');
    url.searchParams.set('page', '1');
    url.searchParams.set('limit', '50');
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { tags: [STORE_ITEMS_TAG], revalidate: 3600 },
    });
    if (!res.ok) {
      logger.warn('Store items: guest read refused', { status: res.status });
      return { source: 'unavailable', items: [] };
    }
    return { source: 'server', items: toItems(await res.json()) };
  } catch (error) {
    logger.warn('Store items: guest read failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { source: 'unavailable', items: [] };
  }
}

/** Either API's page of items, reduced to public fields (`toPublicItem`). */
function toItems(body: unknown): PublicItemView[] {
  const docs = (body as { docs?: unknown[] } | null)?.docs ?? [];
  return docs
    .map(toPublicItem)
    .filter((item): item is PublicItemView => item !== null);
}

type Price = PublicItemView['variants'][number]['prices'][number];

/** A free price: mode `free`, or a fixed price of zero. */
function costsNothing(price: Price): boolean {
  return price.mode === 'free' || (price.mode === 'fixed' && !price.amount);
}

/** A current price a buyer pays money for: not retired and not free. */
function isPaid(price: Price): boolean {
  return !price.retired && !costsNothing(price);
}

/** A current free price: the Personal key. */
function isFree(price: Price): boolean {
  return !price.retired && costsNothing(price);
}

/**
 * True when at least one variant has a price a buyer pays now. A free
 * variant doesn't count: publishing only the free Personal item must not
 * switch the site to "Buy RenderWeld" (studio issue #554).
 */
export function hasOffers(items: PublicItemView[]): boolean {
  return items.some((item) => item.variants.some((v) => v.prices.some(isPaid)));
}

/** True when a free key (the Personal licence) can be claimed now. */
export function hasFreeKey(items: PublicItemView[]): boolean {
  return items.some((item) => item.variants.some((v) => v.prices.some(isFree)));
}

/**
 * Whether the store is on sale, from a read: undefined when the read failed
 * (`unavailable`, so "unknown"). Only paid prices count (`hasOffers`). The
 * home page's buttons and the header's primary action (`HeaderCta`) both
 * decide from this.
 */
export function onSaleFrom(store: StoreItems): boolean | undefined {
  return store.source === 'server' ? hasOffers(store.items) : undefined;
}

/**
 * Whether a free key can be claimed, from a read: its own state beside
 * `onSaleFrom`, so the buttons can say "Get the free Personal licence"
 * while nothing is for sale yet. Undefined when the read failed.
 */
export function freeKeyFrom(store: StoreItems): boolean | undefined {
  return store.source === 'server' ? hasFreeKey(store.items) : undefined;
}

import {
  isContentWebhookEvent,
  tagsForContentEvent,
} from '@buildbase/sdk/server';
import { locales } from '@/i18n/config';
import { STORE_ITEMS_TAG } from '@/lib/store/item-tags';

/**
 * The cache tags a BuildBase webhook event makes stale:
 *
 * - `item.*` (an item published, updated, unlisted, archived, ...): the
 *   store's items read (`getStoreItems`), so `/` and `/pricing` rebuild
 *   with the new prices and Offer JSON-LD;
 * - content events (`faq.updated`, `rich_content.updated`, `doc.*`, ...):
 *   the SDK's `buildbase:*` tags the content reads carry, so `/help` and
 *   the FAQ and block sections rebuild.
 *
 * Everything else (orders, users, ...) changes no cached page.
 */
export function tagsForWebhookEvent(
  event: string,
  data: Record<string, unknown> | undefined
): string[] {
  if (event.startsWith('item.')) return [STORE_ITEMS_TAG];
  if (isContentWebhookEvent(event)) {
    return tagsForContentEvent(event, data ?? {});
  }
  return [];
}

/**
 * The ISR pages the same event makes stale, as internal (locale-prefixed)
 * paths for `revalidatePath`. Belt and braces beside the tags: a page
 * prerendered at build time without a server token made no tagged read, so
 * only its path reaches it. A `doc.*` event also names /docs, the page it
 * carries (`data.path`), and the sitemap.
 */
export function pathsForWebhookEvent(
  event: string,
  data?: Record<string, unknown>
): string[] {
  const pages = event.startsWith('item.')
    ? ['/', '/pricing']
    : isContentWebhookEvent(event)
      ? ['/', '/pricing', '/help']
      : [];
  if (event.startsWith('doc.')) {
    pages.push('/docs');
    const path =
      typeof data?.path === 'string' ? data.path.replace(/^\/+|\/+$/g, '') : '';
    if (/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(path)) pages.push(`/docs/${path}`);
  }
  const localized = locales.flatMap((locale) =>
    pages.map((page) => `/${locale}${page === '/' ? '' : page}`)
  );
  return event.startsWith('doc.') ? [...localized, '/sitemap.xml'] : localized;
}

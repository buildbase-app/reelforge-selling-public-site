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
 * - content events (`faq.updated`, `rich_content.updated`, `doc.*`,
 *   `blog.*`, ...): the SDK's `buildbase:*` tags the content reads carry, so
 *   `/help`, the FAQ and block sections, the blog and the changelog rebuild.
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
 * only its path reaches it.
 */
export function pathsForWebhookEvent(
  event: string,
  data?: Record<string, unknown>
): string[] {
  if (event.startsWith('blog.')) return blogPathsForWebhookEvent(data);
  const pages = event.startsWith('item.')
    ? ['/', '/pricing']
    : isContentWebhookEvent(event)
      ? ['/', '/pricing', '/help']
      : [];
  return locales.flatMap((locale) =>
    pages.map((page) => `/${locale}${page === '/' ? '' : page}`)
  );
}

/**
 * A `blog.*` event (a post published, edited, unpublished or deleted in the
 * console): the blog and changelog lists, their feeds, the post's own page
 * when the event names its slug, and the sitemap. Tag and author pages are
 * only rendered at runtime, so the `buildbase:blog` tag reaches them.
 */
function blogPathsForWebhookEvent(data?: Record<string, unknown>): string[] {
  const slug = typeof data?.slug === 'string' ? data.slug : '';
  const pages = [
    '/blog',
    '/blog/feed.xml',
    '/changelog',
    '/changelog/feed.xml',
    ...(/^[a-z0-9-]+$/.test(slug)
      ? [`/blog/${slug}`, `/changelog/${slug}`]
      : []),
  ];
  return [
    ...locales.flatMap((locale) => pages.map((page) => `/${locale}${page}`)),
    '/sitemap.xml',
  ];
}

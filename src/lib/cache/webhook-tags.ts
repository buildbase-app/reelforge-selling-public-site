import {
  isContentWebhookEvent,
  tagsForContentEvent,
} from '@buildbase/sdk/server';
import { locales } from '@/i18n/config';
import { STORE_ITEMS_TAG } from '@/lib/store/item-tags';
import { CHANGELOG_COLLECTION } from '@/lib/blog/changelog';

/**
 * The cache tags a BuildBase webhook event makes stale:
 *
 * - `item.*` (an item published, updated, unlisted, archived, ...): the
 *   store's items read (`getStoreItems`), so `/` and `/pricing` rebuild
 *   with the new prices and Offer JSON-LD;
 * - content events (`faq.updated`, `rich_content.updated`, `doc.*`,
 *   `blog.*`, `collection.*`, ...): the SDK's `buildbase:*` tags the content
 *   reads carry, so `/help`, the FAQ and block sections, the blog and the
 *   changelog (collection `changelog`) rebuild.
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
  if (event.startsWith('blog.')) return blogPathsForWebhookEvent(data);
  if (isChangelogEvent(event, data)) return changelogPaths();
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

/**
 * A record of the `changelog` collection created, edited or deleted, or a new
 * version of it published. The payload names the collection (its slug, or the
 * `buildbase:collection:changelog` tag), not the record's own slug, so every
 * release note page is left to the tag; these are the pages a prerendered
 * copy could hold: the list, its feed and the sitemap.
 */
function isChangelogEvent(
  event: string,
  data?: Record<string, unknown>
): boolean {
  if (!event.startsWith('collection.')) return false;
  const tags = Array.isArray(data?.tags) ? data.tags : [];
  return (
    data?.slug === CHANGELOG_COLLECTION ||
    tags.includes(`buildbase:collection:${CHANGELOG_COLLECTION}`)
  );
}

function changelogPaths(): string[] {
  const pages = ['/changelog', '/changelog/feed.xml'];
  return [
    ...locales.flatMap((locale) => pages.map((page) => `/${locale}${page}`)),
    '/sitemap.xml',
  ];
}

/**
 * A `blog.*` event (a post published, edited, unpublished or deleted in the
 * console): the blog list, its feed, the post's own page
 * when the event names its slug, and the sitemap. Tag and author pages are
 * only rendered at runtime, so the `buildbase:blog` tag reaches them.
 */
function blogPathsForWebhookEvent(data?: Record<string, unknown>): string[] {
  const slug = typeof data?.slug === 'string' ? data.slug : '';
  const pages = [
    '/blog',
    '/blog/feed.xml',
    ...(/^[a-z0-9-]+$/.test(slug) ? [`/blog/${slug}`] : []),
  ];
  return [
    ...locales.flatMap((locale) => pages.map((page) => `/${locale}${page}`)),
    '/sitemap.xml',
  ];
}

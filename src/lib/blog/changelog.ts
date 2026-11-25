import { countWords, isPlaceholderImage, versionFromSlug } from './posts';
import type { BlogPost } from './posts';

/**
 * The changelog is the BuildBase collection `changelog` (console: Content,
 * Collections), one record per release note. Its fields:
 *
 * | Field         | Type      | Use                                          |
 * | ------------- | --------- | -------------------------------------------- |
 * | `title`       | text      | the page's h1                                |
 * | `slug`        | text      | `/changelog/<slug>`                          |
 * | `date`        | date      | release date; the list is newest first       |
 * | `version`     | text      | optional semver, shown as `v1.2.0`           |
 * | `description` | text      | meta description, feed summary, standfirst   |
 * | `content`     | rich-text | the body, Markdown with optional raw HTML    |
 * | `image`       | link      | optional https Open Graph image              |
 * | `published`   | bool      | only `true` is shown anywhere                |
 *
 * This module only maps records into the `BlogPost` shape the blog's pages,
 * feed and sitemap already use; it reads nothing (see `./source.ts`).
 */

export const CHANGELOG_COLLECTION = 'changelog';

export interface ChangelogRecord {
  _id?: string;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  data?: Record<string, unknown> | null;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER = /^v?(\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?)$/i;
const DAY = 24 * 60 * 60 * 1000;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isoDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const time = new Date(value.trim()).getTime();
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

/**
 * BuildBase cleans a rich-text value when it is written: it removes scripts,
 * event handlers and `javascript:` URLs, and stores `<`, `>` and `&` outside
 * the tags it keeps as `&lt;`, `&gt;` and `&amp;` (seen on the development
 * environment, 2026-11-25: a `> quote` line came back as `&gt; quote`).
 * Markdown needs the characters back, so they are decoded once here; the
 * site's own sanitiser (src/lib/content/rich-text.ts) still runs on the
 * result, so nothing decoded here can reach the page as markup it does not
 * allow.
 */
export function decodeRichText(value: string): string {
  return value.replace(
    /&(lt|gt|quot|#39|#x27|amp);/g,
    (_, name: string) =>
      ({ lt: '<', gt: '>', quot: '"', '#39': "'", '#x27': "'", amp: '&' })[
        name
      ] ?? _
  );
}

/** BuildBase stores `true`; a value typed as text reads as "true". */
function isPublished(value: unknown): boolean {
  return value === true || value === 'true';
}

/**
 * One record as a release note, or null when it must not be shown: archived,
 * not published, or missing a valid slug, title or date.
 */
export function toChangelogPost(record: ChangelogRecord): BlogPost | null {
  if (!record || record.archived) return null;
  const data = record.data ?? {};
  if (!isPublished(data.published)) return null;

  const slug = text(data.slug).toLowerCase();
  const title = text(data.title);
  const date = isoDate(data.date);
  if (!SLUG.test(slug) || !title || !date) return null;

  // A record edited on a later day than its release date says so.
  const edited = isoDate(record.updatedAt);
  const updated =
    edited && new Date(edited).getTime() - new Date(date).getTime() >= DAY
      ? edited
      : undefined;

  const markdown =
    typeof data.content === 'string' ? decodeRichText(data.content) : '';
  const wordCount = countWords(markdown);
  const version =
    SEMVER.exec(text(data.version))?.[1] ?? versionFromSlug(slug) ?? undefined;
  const image = text(data.image);

  return {
    id: record._id ?? slug,
    kind: 'changelog',
    slug,
    title,
    description: text(data.description),
    date,
    ...(updated && { updated }),
    wordCount,
    readingTime: `${Math.max(1, Math.round(wordCount / 200))} min read`,
    authors: [],
    tags: [],
    ...(/^https:\/\//i.test(image) && !isPlaceholderImage(image) && { image }),
    markdown,
    ...(version && { version }),
  };
}

/** Records to release notes, newest first; the first record of a slug wins. */
export function toChangelogPosts(
  records: readonly ChangelogRecord[]
): BlogPost[] {
  const seen = new Set<string>();
  return records
    .map(toChangelogPost)
    .filter((p): p is BlogPost => p !== null)
    .filter((p) => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

import type {
  BlogPost as BuildBaseBlogPost,
  ContentAsset,
  ContentAuthor,
  ContentFolder,
  ContentTag,
} from '@buildbase/sdk/server';

/**
 * The blog and the changelog are BuildBase Blogs posts (console: Content,
 * Blogs), in two folders: `blog` and `changelog`. A post's URL on this site
 * is `/blog/<slug>` or `/changelog/<slug>`. A changelog post named
 * `v<major>-<minor>-<patch>` (e.g. `v0-1-0`) shows that version.
 *
 * This module only maps what the API returns into what the pages use; it
 * reads nothing (see `./source.ts`), so it is unit tested on its own.
 */

export type BlogKind = 'blog' | 'changelog';

export const BLOG_KINDS: readonly BlogKind[] = ['blog', 'changelog'];

export interface BlogAuthor {
  /** The author's username in the console; also their URL slug. */
  username: string;
  name: string;
  image?: string;
  links: { website?: string; twitter?: string; linkedin?: string };
}

export interface BlogTag {
  slug: string;
  title: string;
}

export interface BlogPost {
  id: string;
  kind: BlogKind;
  slug: string;
  title: string;
  description: string;
  /** ISO date the post was published. */
  date: string;
  /** ISO date of the last edit, only when it came after publishing. */
  updated?: string;
  wordCount: number;
  readingTime: string;
  authors: BlogAuthor[];
  tags: BlogTag[];
  /** Absolute cover image URL, when one was set. */
  image?: string;
  /** The body, Markdown, as written in the console. */
  markdown: string;
  /** Changelog only: `0.1.0` for a post named `v0-1-0`. */
  version?: string;
}

/**
 * BuildBase fills a new post's image with a placeholder; that is "no cover",
 * not a picture to put in Open Graph tags or the feed.
 */
export function isPlaceholderImage(url: string): boolean {
  try {
    return new URL(url).hostname === 'placehold.co';
  } catch {
    return true;
  }
}

/** `v0-1-0` -> `0.1.0`; undefined for any other slug. */
export function versionFromSlug(slug: string): string | undefined {
  const m = /^v(\d+)-(\d+)-(\d+)$/.exec(slug);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : undefined;
}

export function countWords(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`[\]()|-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function isObject<T>(value: unknown): value is T {
  return typeof value === 'object' && value !== null;
}

function folderSlug(folder: BuildBaseBlogPost['folder']): string | null {
  return isObject<ContentFolder>(folder) && typeof folder.slug === 'string'
    ? folder.slug
    : null;
}

function toIso(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

function coverImage(raw: BuildBaseBlogPost): string | undefined {
  const asset = raw.assetFile;
  if (isObject<ContentAsset>(asset) && asset.bucket?.url) {
    return asset.bucket.url;
  }
  const image = typeof raw.image === 'string' ? raw.image.trim() : '';
  return /^https:\/\//i.test(image) && !isPlaceholderImage(image)
    ? image
    : undefined;
}

function toAuthor(raw: unknown): BlogAuthor | null {
  if (!isObject<ContentAuthor>(raw) || raw.archived) return null;
  if (typeof raw.username !== 'string' || !raw.username) return null;
  const links: BlogAuthor['links'] = {};
  for (const key of ['website', 'twitter', 'linkedin'] as const) {
    const value = raw.links?.[key];
    if (typeof value === 'string' && value.trim()) links[key] = value.trim();
  }
  const image = typeof raw.image === 'string' ? raw.image.trim() : '';
  return {
    username: raw.username,
    name: raw.name?.trim() || raw.username,
    ...(/^https:\/\//i.test(image) && { image }),
    links,
  };
}

function toTag(raw: unknown): BlogTag | null {
  if (!isObject<ContentTag>(raw) || raw.archived || raw.public === false) {
    return null;
  }
  if (typeof raw.slug !== 'string' || !raw.slug) return null;
  return { slug: raw.slug, title: raw.title?.trim() || raw.slug };
}

/**
 * One API post as a page's post, or null when it is not on this site: a
 * draft, a post outside the `blog` and `changelog` folders, or one without a
 * slug or title.
 */
export function toBlogPost(raw: BuildBaseBlogPost): BlogPost | null {
  if (!raw || raw.published !== true) return null;
  const kind = folderSlug(raw.folder);
  if (kind !== 'blog' && kind !== 'changelog') return null;
  const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!slug || !title) return null;

  const date = toIso(raw.publishedAt) ?? toIso(raw.createdAt);
  if (!date) return null;
  const edited = toIso(raw.updatedAt);
  // Publishing itself bumps updatedAt; only a later edit counts.
  const updated =
    edited && new Date(edited).getTime() - new Date(date).getTime() > 60_000
      ? edited
      : undefined;

  const markdown = typeof raw.content === 'string' ? raw.content : '';
  const wordCount = countWords(markdown);
  const description =
    (typeof raw.description === 'string' && raw.description.trim()) ||
    (typeof raw.seo?.description === 'string' && raw.seo.description.trim()) ||
    '';

  const authors = (Array.isArray(raw.authors) ? raw.authors : [])
    .map(toAuthor)
    .filter((a): a is BlogAuthor => a !== null);
  const tags = (Array.isArray(raw.tags) ? raw.tags : [])
    .map(toTag)
    .filter((t): t is BlogTag => t !== null)
    .sort((a, b) => a.title.localeCompare(b.title));

  const image = coverImage(raw);
  const version = kind === 'changelog' ? versionFromSlug(slug) : undefined;

  return {
    id: raw._id,
    kind,
    slug,
    title,
    description,
    date,
    ...(updated && { updated }),
    wordCount,
    readingTime: `${Math.max(1, Math.round(wordCount / 200))} min read`,
    authors,
    tags,
    ...(image && { image }),
    markdown,
    ...(version && { version }),
  };
}

/** API posts to page posts, newest first; one per kind and slug. */
export function toBlogPosts(raw: readonly BuildBaseBlogPost[]): BlogPost[] {
  const seen = new Set<string>();
  return raw
    .map(toBlogPost)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((p) => {
      const key = `${p.kind}/${p.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Every tag used by these posts, by title. */
export function tagsOf(posts: readonly BlogPost[]): BlogTag[] {
  const bySlug = new Map<string, BlogTag>();
  for (const post of posts) {
    for (const tag of post.tags) bySlug.set(tag.slug, tag);
  }
  return [...bySlug.values()].sort((a, b) => a.title.localeCompare(b.title));
}

/** Every author of these posts, by name. */
export function authorsOf(posts: readonly BlogPost[]): BlogAuthor[] {
  const byUsername = new Map<string, BlogAuthor>();
  for (const post of posts) {
    for (const author of post.authors) byUsername.set(author.username, author);
  }
  return [...byUsername.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Up to `limit` other posts, ranked by shared tags, newest first on ties. */
export function relatedPosts(
  post: BlogPost,
  posts: readonly BlogPost[],
  limit = 3
): BlogPost[] {
  const mine = new Set(post.tags.map((t) => t.slug));
  return posts
    .filter((p) => p.kind === post.kind && p.slug !== post.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => mine.has(t.slug)).length }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, limit)
    .map((s) => s.p);
}

/**
 * A post's date as people read it, one format on every blog and changelog
 * page: `November 21, 2026` (in UTC, so the server and the browser agree).
 */
export function formatPostDate(iso: string, locale = 'en'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

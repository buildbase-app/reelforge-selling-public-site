import type { MetadataRoute } from 'next';
import { siteUrl } from '@/env';
import { defaultLocale } from '@/i18n/config';
import { localeUrl } from '@/lib/i18n-url';
import { getPosts } from '@/lib/blog/source';
import { licence } from '@/content/pages/licence';
import { privacy } from '@/content/pages/privacy';
import { refund } from '@/content/pages/refund';
import { terms } from '@/content/pages/terms';

/**
 * /sitemap.xml, built from the routes and the content this site serves
 * (replaces next-sitemap). Posts and release notes come from BuildBase Blogs
 * (src/lib/blog/source.ts), so a post published in the console is listed
 * once the `blog.*` webhook revalidates its `buildbase:blog` tag and this
 * path. English only for now, so there are no hreflang
 * alternates. `lastModified` is set only where a real date exists (a post's
 * date, a legal page's "last updated"); routes without one omit it rather
 * than claim a date. Never listed: /api, /dashboard, /order (per buyer),
 * drafts, feeds.
 */

/** ISR: rebuilt when a `blog.*` webhook revalidates it; hourly otherwise. */
export const revalidate = 3600;

const toIso = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const url = (path: string) => localeUrl(siteUrl, defaultLocale, path);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, entries, ...legal] = await Promise.all([
    getPosts('blog'),
    getPosts('changelog'),
    licence.get(defaultLocale),
    refund.get(defaultLocale),
    privacy.get(defaultLocale),
    terms.get(defaultLocale),
  ]);

  const pages: MetadataRoute.Sitemap = [
    { url: url('/'), changeFrequency: 'weekly', priority: 1 },
    { url: url('/pricing'), changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/agents'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/help'), changeFrequency: 'weekly', priority: 0.7 },
    {
      url: url('/blog'),
      lastModified: toIso(posts[0]?.updated ?? posts[0]?.date),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: url('/changelog'),
      lastModified: toIso(entries[0]?.updated ?? entries[0]?.date),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    { url: url('/waitlist'), changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/contact'), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const legalPaths = ['/licence', '/refund', '/privacy', '/terms'];
  const legalPages: MetadataRoute.Sitemap = legalPaths.map((path, i) => ({
    url: url(path),
    lastModified: toIso(legal[i]?.lastUpdated),
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: url(`/blog/${post.slug}`),
    lastModified: toIso(post.updated ?? post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const entryPages: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: url(`/changelog/${entry.slug}`),
    lastModified: toIso(entry.updated ?? entry.date),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...pages, ...postPages, ...entryPages, ...legalPages].map((entry) =>
    entry.lastModified ? entry : omitUndefined(entry)
  );
}

function omitUndefined<T extends object>(entry: T): T {
  return Object.fromEntries(
    Object.entries(entry).filter(([, v]) => v !== undefined)
  ) as T;
}

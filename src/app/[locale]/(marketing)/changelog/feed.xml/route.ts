import { defaultLocale, type Locale } from '@/i18n/config';
import { siteUrl } from '@/env';
import { seoConfig } from '@/config/seo';
import { localeUrl } from '@/lib/i18n-url';
import { buildFeed, FEED_HEADERS } from '@/lib/blog/feed';
import { getPosts } from '@/lib/blog/source';

/**
 * RSS for the changelog, from BuildBase Blogs (folder `changelog`).
 * Revalidated like the blog feed.
 */
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ locale: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { locale } = await ctx.params;
  const loc = (locale ?? defaultLocale) as Locale;
  const xml = buildFeed(await getPosts('changelog'), {
    title: `${seoConfig.brand.name} Changelog`,
    description: `Latest updates and releases from ${seoConfig.brand.name}.`,
    siteUrl: localeUrl(siteUrl, loc, '/changelog'),
    feedUrl: localeUrl(siteUrl, loc, '/changelog/feed.xml'),
    postUrl: (slug) => localeUrl(siteUrl, loc, `/changelog/${slug}`),
    imageUrl: `${siteUrl}${seoConfig.brand.logo}`,
    language: loc,
  });
  return new Response(xml, { headers: FEED_HEADERS });
}

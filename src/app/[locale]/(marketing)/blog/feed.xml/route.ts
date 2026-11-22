import { defaultLocale, type Locale } from '@/i18n/config';
import { siteUrl } from '@/env';
import { seoConfig } from '@/config/seo';
import { localeUrl } from '@/lib/i18n-url';
import { buildFeed, FEED_HEADERS } from '@/lib/blog/feed';
import { getPosts } from '@/lib/blog/source';

/**
 * RSS for the blog, from BuildBase Blogs (folder `blog`). Built per request
 * from the read cached under `buildbase:blog`, which the `blog.*` webhook
 * revalidates (the build has no API token, so a prerendered feed would be
 * empty); the response is cached for five minutes.
 */
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ locale: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { locale } = await ctx.params;
  const loc = (locale ?? defaultLocale) as Locale;
  const xml = buildFeed(await getPosts('blog'), {
    title: `${seoConfig.brand.name} Blog`,
    description: seoConfig.brand.description,
    siteUrl: localeUrl(siteUrl, loc, '/blog'),
    feedUrl: localeUrl(siteUrl, loc, '/blog/feed.xml'),
    postUrl: (slug) => localeUrl(siteUrl, loc, `/blog/${slug}`),
    imageUrl: `${siteUrl}${seoConfig.brand.logo}`,
    language: loc,
  });
  return new Response(xml, { headers: FEED_HEADERS });
}

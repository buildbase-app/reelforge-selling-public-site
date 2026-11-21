import { defaultLocale, type Locale } from '@/i18n/config';
import { siteUrl } from '@/env';
import { seoConfig } from '@/config/seo';
import { localeUrl } from '@/lib/i18n-url';
import { buildFeed, FEED_HEADERS } from '@/lib/blog/feed';
import { getPosts } from '@/lib/blog/source';

/**
 * RSS for the blog, from BuildBase Blogs (folder `blog`). Static and
 * revalidated with the posts' `buildbase:blog` tag by the `blog.*` webhook;
 * the hour is the safety net.
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

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

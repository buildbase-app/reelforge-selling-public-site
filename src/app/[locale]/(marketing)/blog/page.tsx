import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BlogJsonLd } from '@/components/seo/json-ld';
import { PostList } from '@/components/marketing/post-list';
import { TagLinks } from '@/components/marketing/post-meta';
import { RssButton } from '@/components/marketing/rss-button';
import type { Locale } from '@/i18n/config';
import { postAuthorJsonLd } from '@/lib/blog/authors';
import { tagsOf } from '@/lib/blog/posts';
import { getPosts } from '@/lib/blog/source';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

/**
 * ISR, like the store's other BuildBase pages: posts come from BuildBase
 * Blogs (folder `blog`) through a read tagged `buildbase:blog`, which the
 * `blog.*` webhook revalidates; this hour is only the safety net.
 */
export const revalidate = 3600;

interface BlogIndexPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: BlogIndexPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return buildMarketingMetadata({
    path: '/blog',
    locale: locale as Locale,
    title: t('meta.title'),
    description: t('meta.description'),
    alternatesTypes: { 'application/rss+xml': '/blog/feed.xml' },
  });
}

export default async function BlogIndexPage({ params }: BlogIndexPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blog' });
  const posts = await getPosts('blog');
  const tags = tagsOf(posts);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <BlogJsonLd
        posts={posts.map((p) => ({
          slug: p.slug,
          title: p.title,
          description: p.description,
          datePublished: p.date,
          dateModified: p.updated,
          author: postAuthorJsonLd(p),
          image: p.image,
        }))}
      />

      <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-prose">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
            {t('heading')}
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed md:text-lg">
            {t('description')}
          </p>
        </div>
        <div className="shrink-0">
          <RssButton href="/blog/feed.xml" label={t('rssLabel')} />
        </div>
      </header>

      {tags.length > 0 ? (
        <nav aria-label={t('label')} className="mb-8">
          <TagLinks tags={tags} />
        </nav>
      ) : null}

      {posts.length === 0 ? (
        <p className="text-muted-foreground border-border border-y py-12 text-base">
          {t('noPosts')}
        </p>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { BlogJsonLd } from '@/components/seo/json-ld';
import { PostList } from '@/components/marketing/post-list';
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
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
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

      <header className="mb-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-primary font-mono text-xs tracking-wider uppercase">
              {t('label')}
            </p>
            <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight md:text-5xl">
              {t('heading')}
            </h1>
            <p className="text-muted-foreground mt-4 text-base md:text-lg">
              {t('description')}
            </p>
          </div>
          <div className="mt-2 shrink-0">
            <RssButton href="/blog/feed.xml" label={t('rssLabel')} />
          </div>
        </div>
      </header>

      {tags.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/blog/tag/${tag.slug}`}
              className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full px-3 py-1 text-sm transition-colors"
            >
              #{tag.title}
            </Link>
          ))}
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="border-border bg-muted rounded-lg border p-12 text-center">
          <p className="text-muted-foreground text-sm">{t('noPosts')}</p>
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
}

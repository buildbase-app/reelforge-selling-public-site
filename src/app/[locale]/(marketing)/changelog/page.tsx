import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { ArticleHtml } from '@/components/content/article-html';
import { ItemListJsonLd } from '@/components/seo/json-ld';
import { RssButton } from '@/components/marketing/rss-button';
import { PostMeta } from '@/components/marketing/post-meta';
import type { Locale } from '@/i18n/config';
import { getPosts } from '@/lib/blog/source';
import { renderMarkdown } from '@/lib/platform/markdown';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

/**
 * Release notes: BuildBase Blogs posts in the `changelog` folder, newest
 * first. ISR, revalidated by the `blog.*` webhook like /blog.
 */
export const revalidate = 3600;

interface ChangelogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ChangelogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'changelog' });
  return buildMarketingMetadata({
    path: '/changelog',
    locale: locale as Locale,
    title: t('meta.title'),
    description: t('meta.description'),
    alternatesTypes: { 'application/rss+xml': '/changelog/feed.xml' },
  });
}

export default async function ChangelogPage({ params }: ChangelogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tBlog, entries] = await Promise.all([
    getTranslations({ locale, namespace: 'changelog' }),
    getTranslations({ locale, namespace: 'blog' }),
    getPosts('changelog'),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <ItemListJsonLd
        name="Changelog"
        url="/changelog"
        items={entries.map((e) => ({
          name: e.title,
          url: `/changelog/${e.slug}`,
          description: e.description,
        }))}
      />
      <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-prose">
          <h1 className="text-foreground text-3xl font-medium tracking-tight md:text-4xl">
            {t('heading')}
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed md:text-lg">
            {t('description')}
          </p>
        </div>
        <div className="shrink-0">
          <RssButton href="/changelog/feed.xml" label={t('rssLabel')} />
        </div>
      </header>

      {entries.length === 0 ? (
        <p className="text-muted-foreground border-border border-y py-12 text-base">
          {tBlog('noPosts')}
        </p>
      ) : (
        <ol className="border-border divide-border divide-y border-y">
          {entries.map((entry, i) => (
            <li key={entry.slug} className="py-12 first:pt-10">
              <article className="flex flex-col gap-4">
                <PostMeta post={entry} locale={locale} latest={i === 0} />
                <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                  <Link
                    href={`/changelog/${entry.slug}`}
                    className="decoration-foreground/30 underline-offset-4 hover:underline"
                  >
                    {entry.title}
                  </Link>
                </h2>
                {entry.description ? (
                  <p className="text-muted-foreground max-w-prose text-lg leading-relaxed">
                    {entry.description}
                  </p>
                ) : null}
                <ArticleHtml
                  html={renderMarkdown(entry.markdown).html}
                  className="mt-2 [&_h2]:mt-8 [&_h2]:text-lg md:[&_h2]:text-xl"
                />
                <Link
                  href={`/changelog/${entry.slug}`}
                  className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-sm transition-colors"
                >
                  {t('permalink')}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ArticleHtml } from '@/components/content/article-html';
import { ItemListJsonLd } from '@/components/seo/json-ld';
import { RssButton } from '@/components/marketing/rss-button';
import { ChangelogMeta } from '@/components/marketing/changelog-meta';
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
            <RssButton href="/changelog/feed.xml" label={t('rssLabel')} />
          </div>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="border-border bg-muted rounded-lg border p-12 text-center">
          <p className="text-muted-foreground text-sm">{tBlog('noPosts')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          {entries.map((entry, i) => (
            <article key={entry.slug} className="flex flex-col gap-5">
              <ChangelogMeta entry={entry} locale={locale} latest={i === 0} />
              <h2>
                <Link
                  href={`/changelog/${entry.slug}`}
                  className="text-foreground hover:text-primary text-2xl font-bold tracking-tight transition-colors md:text-3xl"
                >
                  {entry.title}
                </Link>
              </h2>
              {entry.description ? (
                <p className="text-muted-foreground text-base leading-relaxed">
                  {entry.description}
                </p>
              ) : null}
              <ArticleHtml
                html={renderMarkdown(entry.markdown).html}
                className="border-border bg-card rounded-lg border p-5 md:p-6 [&_h2]:mt-8 [&_h2]:text-lg md:[&_h2]:text-xl"
              />
              <Link
                href={`/changelog/${entry.slug}`}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
              >
                {t('permalink')}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

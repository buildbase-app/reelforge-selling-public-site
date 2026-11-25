import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { ItemListJsonLd } from '@/components/seo/json-ld';
import { RssButton } from '@/components/marketing/rss-button';
import { PostMeta } from '@/components/marketing/post-meta';
import type { Locale } from '@/i18n/config';
import { getPosts } from '@/lib/blog/source';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

/**
 * Release notes: the BuildBase collection `changelog`, newest first, each
 * with its summary and a link to the full note (one h1 on the page, and no
 * heading ids repeated from note to note). ISR, revalidated by the
 * `collection.*` webhooks (src/lib/cache/webhook-tags.ts).
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
  const [t, entries] = await Promise.all([
    getTranslations({ locale, namespace: 'changelog' }),
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
          {t('empty')}
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
                  <p className="text-muted-foreground max-w-measure text-lg leading-relaxed text-pretty">
                    {entry.description}
                  </p>
                ) : null}
                <Link
                  href={`/changelog/${entry.slug}`}
                  className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-sm transition-colors"
                >
                  {t('permalink')}
                  <span className="sr-only">: {entry.title}</span>
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

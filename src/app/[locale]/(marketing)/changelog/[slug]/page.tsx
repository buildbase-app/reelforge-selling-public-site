import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleHtml } from '@/components/content/article-html';
import { PostMeta } from '@/components/marketing/post-meta';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { type Locale } from '@/i18n/config';
import { siteUrl } from '@/env';
import { Link } from '@/i18n/routing';
import { postAuthorJsonLd } from '@/lib/blog/authors';
import { getPost, getPosts } from '@/lib/blog/source';
import { localePath, localeUrl } from '@/lib/i18n-url';
import { renderMarkdown } from '@/lib/platform/markdown';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

/** One release note (folder `changelog`). ISR, as /blog/[slug]. */
export const revalidate = 3600;

interface ChangelogEntryPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: ChangelogEntryPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const entry = await getPost('changelog', slug);
  if (!entry) return {};
  return buildMarketingMetadata({
    path: `/changelog/${slug}`,
    locale: locale as Locale,
    title: entry.title,
    description: entry.description,
    type: 'article',
    image: entry.image,
    publishedTime: entry.date,
    modifiedTime: entry.updated,
  });
}

export default async function ChangelogEntryPage({
  params,
}: ChangelogEntryPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const localeTyped = locale as Locale;
  const [entry, entries, t] = await Promise.all([
    getPost('changelog', slug),
    getPosts('changelog'),
    getTranslations({ locale, namespace: 'changelog' }),
  ]);
  if (!entry) notFound();

  const path = `/changelog/${slug}`;
  const { html } = renderMarkdown(entry.markdown);

  return (
    <>
      <ArticleJsonLd
        title={entry.title}
        description={entry.description}
        url={localeUrl(siteUrl, localeTyped, path)}
        image={entry.image}
        datePublished={entry.date}
        dateModified={entry.updated}
        author={postAuthorJsonLd(entry)}
        wordCount={entry.wordCount}
        inLanguage={localeTyped}
        articleSection={t('label')}
      />
      <BreadcrumbJsonLd
        items={[
          { name: t('label'), url: localePath(localeTyped, '/changelog') },
          { name: entry.title, url: localePath(localeTyped, path) },
        ]}
      />

      <article className="mx-auto max-w-3xl px-6 pt-16 pb-16 md:pt-24">
        <nav className="text-muted-foreground mb-8 text-sm">
          <Link
            href="/changelog"
            className="hover:text-foreground transition-colors"
          >
            {t('label')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{entry.title}</span>
        </nav>

        <PostMeta
          post={entry}
          locale={localeTyped}
          latest={entries[0]?.slug === entry.slug}
        />

        <h1 className="text-foreground mt-4 text-3xl font-medium tracking-tight text-balance md:text-4xl">
          {entry.title}
        </h1>
        {entry.description ? (
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            {entry.description}
          </p>
        ) : null}

        <ArticleHtml html={html} className="mt-10" />
      </article>
    </>
  );
}

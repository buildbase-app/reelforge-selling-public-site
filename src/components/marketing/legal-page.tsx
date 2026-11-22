import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleHtml } from '@/components/content/article-html';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import type {
  LegalPageContent,
  PageContentLoader,
} from '@/content/pages/page-loader';
import type { Locale } from '@/i18n/config';
import { renderMarkdown } from '@/lib/platform/markdown';

/** A legal page: header, draft note when pending review, Markdown body. */
export async function LegalPage<T extends LegalPageContent>({
  locale,
  path,
  loader,
}: {
  locale: string;
  path: string;
  loader: PageContentLoader<T>;
}) {
  setRequestLocale(locale);
  const [content, t] = await Promise.all([
    loader.get(locale as Locale),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  if (!content) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      <BreadcrumbJsonLd items={[{ name: content.heroTitle, url: path }]} />
      {content.pendingReview && (
        <DraftNotice date={content.lastUpdated} label={t('pages.draft')} />
      )}
      <header className="mb-12">
        <p className="text-primary font-mono text-xs tracking-wider uppercase">
          {content.heroEyebrow}
        </p>
        <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight md:text-5xl">
          {content.heroTitle}
        </h1>
        <p className="text-muted-foreground mt-4 text-base md:text-lg">
          {content.heroDescription}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {t('pages.lastUpdated')} {content.lastUpdated}
        </p>
      </header>

      <ArticleHtml html={renderMarkdown(content.body).html} />
    </div>
  );
}

/** The small "Draft – pending review" note on legal pages not yet reviewed. */
export function DraftNotice({ date, label }: { date: string; label: string }) {
  return (
    <p
      role="note"
      className="mb-8 inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300"
    >
      {label} · {date}
    </p>
  );
}

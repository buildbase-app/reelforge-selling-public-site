import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MdxRenderer } from '@/components/marketing/mdx/mdx-renderer';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import type { PageContentLoader } from '@/content/pages/page-loader';
import type { Locale } from '@/i18n/config';

interface LegalDoc {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  lastUpdated: string;
  pendingReview?: boolean;
  body: { code: string };
  bodyHtml: string;
}

/** A legal page from MDX: header, draft note when pending review, body. */
export async function LegalPage<T extends LegalDoc>({
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

      <div>
        <MdxRenderer code={content.body.code} html={content.bodyHtml} />
      </div>
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

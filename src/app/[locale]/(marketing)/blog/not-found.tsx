import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';

/** Translated on the server: the public pages have no intl provider. */
export default async function BlogNotFound() {
  const t = await getTranslations('errors');

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center">
      <p className="text-muted-foreground font-mono text-sm tabular-nums">
        404
      </p>
      <h1 className="text-foreground mt-3 text-3xl font-medium tracking-tight md:text-4xl">
        {t('blogNotFound.title')}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-base md:text-lg">
        {t('blogNotFound.description')}
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/blog"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2.5 text-sm font-medium transition-colors"
        >
          {t('blogNotFound.browseAll')}
        </Link>
        <Link
          href="/"
          className="border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 rounded-md border px-5 py-2.5 text-sm transition-colors"
        >
          {t('generic.goHome')}
        </Link>
      </div>
    </div>
  );
}

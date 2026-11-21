import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PricingCatalog } from '@/components/store/pricing-catalog';
import { RemotionNotice } from '@/components/remotion-notice';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

interface PricingPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PricingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return buildMarketingMetadata({
    path: '/pricing',
    locale: locale as Locale,
    title: t('title'),
    description: t('subtitle'),
  });
}

/**
 * What can be bought, from the store's published BuildBase items (prices
 * are never written here). Before anything is published it says ReelForge
 * is not on sale yet and links to the waitlist.
 */
export default async function PricingPageRoute({ params }: PricingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return (
    <div className="flex-1 px-6 py-12 md:py-16">
      <BreadcrumbJsonLd items={[{ name: t('title'), url: '/pricing' }]} />
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-lg">
            {t('subtitle')}
          </p>
        </div>
        <PricingCatalog />
        <RemotionNotice className="mx-auto mt-10 max-w-3xl" />
        <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-center text-sm">
          {t.rich('legal', {
            licence: (chunks) => (
              <Link href="/licence" className="underline underline-offset-2">
                {chunks}
              </Link>
            ),
            refund: (chunks) => (
              <Link href="/refund" className="underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </div>
  );
}

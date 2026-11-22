import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PricingCatalog } from '@/components/store/pricing-catalog';
import { RemotionNotice } from '@/components/remotion-notice';
import { LicenceGuide } from '@/components/store/licence-guide';
import { LaunchPriceNote } from '@/components/content/launch-price-note';
import { FaqSection } from '@/components/help/faq-section';
import {
  BreadcrumbJsonLd,
  FAQJsonLd,
  SoftwareApplicationJsonLd,
} from '@/components/seo/json-ld';
import { absoluteUrl } from '@/config/seo';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';
import { getFaqSection } from '@/lib/platform/faqs';
import { buildOffers } from '@/lib/store/offers';
import { getStoreItems } from '@/lib/store/items';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

interface PricingPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * ISR: rebuilt when the store's items change (`store:items`, revalidated by
 * the `item.*` webhook) or the console content it shows; the hour is the
 * safety net.
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PricingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return buildMarketingMetadata({
    path: '/pricing',
    locale: locale as Locale,
    title: t('title'),
    description: t('meta.description'),
  });
}

/**
 * What can be bought, from the store's published BuildBase items (prices
 * are never written here), read on the server so they are in the HTML.
 * Before anything is published it says ReelForge is not on sale yet and
 * links to the waitlist, and emits no Offer JSON-LD.
 */
export default async function PricingPageRoute({ params }: PricingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, store, faq] = await Promise.all([
    getTranslations({ locale, namespace: 'pricing' }),
    getStoreItems(),
    getFaqSection('pricing'),
  ]);
  // null = the server could not read the store; the browser reads it then.
  const serverItems = store.source === 'server' ? store.items : null;
  const offers = serverItems
    ? buildOffers(serverItems, absoluteUrl('/pricing'))
    : [];

  return (
    <div className="flex-1 px-4 py-16 md:px-6 md:py-24">
      <BreadcrumbJsonLd items={[{ name: t('title'), url: '/pricing' }]} />
      <SoftwareApplicationJsonLd offers={offers} />
      <FAQJsonLd
        items={faq.items.map((item) => ({
          question: item.question,
          answer: item.text,
        }))}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-medium tracking-tight text-balance md:text-5xl">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-lg">
            {t('subtitle')}
          </p>
        </div>
        <PricingCatalog serverItems={serverItems} />
        <LaunchPriceNote className="mt-6" />
        <LicenceGuide className="mx-auto mt-10 max-w-4xl" />
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
        <section
          id="faq"
          className="mx-auto mt-16 max-w-3xl scroll-mt-20"
          aria-labelledby="pricing-faq-title"
        >
          <h2
            id="pricing-faq-title"
            className="text-center text-2xl font-medium tracking-tight"
          >
            Pricing questions
          </h2>
          <FaqSection items={faq.items} />
        </section>
      </div>
    </div>
  );
}

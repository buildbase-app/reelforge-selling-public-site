import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/marketing/hero-section';
import { PricingCatalog } from '@/components/store/pricing-catalog';
import { RemotionNotice } from '@/components/remotion-notice';
import { CtaBanner } from '@/components/marketing/cta-banner';
import { AnnouncementBar } from '@/components/content/announcement-bar';
import { LaunchPriceNote } from '@/components/content/launch-price-note';
import { FaqSection } from '@/components/help/faq-section';
import { FAQJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/json-ld';
import { absoluteUrl } from '@/config/seo';
import type { Locale } from '@/i18n/config';
import { getFaqSection } from '@/lib/platform/faqs';
import { buildOffers } from '@/lib/store/offers';
import { getStoreItems, hasOffers } from '@/lib/store/items';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

/**
 * ISR: rebuilt when the store's items (`store:items`, revalidated by the
 * `item.*` webhook) or the console content it shows change; the hour is the
 * safety net.
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return buildMarketingMetadata({
    path: '/',
    locale: locale as Locale,
    title: t('meta.title'),
    description: t('meta.description'),
    titleAbsolute: true,
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tPricing, store, faq] = await Promise.all([
    getTranslations({ locale, namespace: 'pricing' }),
    getStoreItems(),
    getFaqSection('home'),
  ]);
  // null = the server could not read the store; the browser reads it then.
  const serverItems = store.source === 'server' ? store.items : null;
  const offers = serverItems
    ? buildOffers(serverItems, absoluteUrl('/pricing'))
    : [];
  const onSale = serverItems ? hasOffers(serverItems) : undefined;

  return (
    <div className="flex flex-1 flex-col items-center">
      <SoftwareApplicationJsonLd offers={offers} />
      <FAQJsonLd
        items={faq.items.map((item) => ({
          question: item.question,
          answer: item.text,
        }))}
      />
      <AnnouncementBar />
      <HeroSection onSale={onSale} />
      <div className="w-full max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {tPricing('title')}
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl">
            {tPricing('subtitle')}
          </p>
        </div>
        <PricingCatalog serverItems={serverItems} />
        <LaunchPriceNote className="mt-6" />
        <RemotionNotice className="mx-auto mt-10 max-w-3xl" />
      </div>
      <section
        id="faq"
        className="w-full max-w-3xl scroll-mt-20 px-6 pb-20"
        aria-labelledby="home-faq-title"
      >
        <h2
          id="home-faq-title"
          className="text-center text-3xl font-bold tracking-tight"
        >
          Questions
        </h2>
        <FaqSection items={faq.items} />
      </section>
      <CtaBanner onSale={onSale} />
    </div>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LitePricingCatalog } from '@/components/store/pricing-catalog-lite';
import { StoreCtas } from '@/components/store/store-ctas';
import { RemotionNotice } from '@/components/remotion-notice';
import { AnnouncementBar } from '@/components/content/announcement-bar';
import { LaunchPriceNote } from '@/components/content/launch-price-note';
import { FaqSection } from '@/components/help/faq-section';
import { FAQJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/json-ld';
import { AgentTabs } from '@/components/product/agent-tabs';
import {
  AgentTranscript,
  ConnectAgent,
  Engines,
  EnterpriseStrip,
  FinalCta,
  Footnotes,
  Hero,
  HowItWorks,
  LocalNav,
  NumbersBand,
  Privacy,
  ReelGallery,
} from '@/components/product/home-sections';
import { Link } from '@/i18n/routing';
import { absoluteUrl } from '@/config/seo';
import type { Locale } from '@/i18n/config';
import { AGENT_CLIENTS } from '@/lib/agents/snippets';
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

/**
 * The product page (studio issue #44): an Apple-style story told in
 * sections, with real reels rendered by ReelForge. Prices stay server-read
 * (`getStoreItems`) so they and the `SoftwareApplication` offers are in the
 * HTML; the FAQ is the BuildBase `home-faq` collection (local fallback).
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tPricing, store, faq] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'pricing' }),
    getStoreItems(),
    getFaqSection('home'),
  ]);
  // null = the server could not read the store; the browser reads it then
  // (LitePricingCatalog loads the provider-backed catalog for that).
  const serverItems = store.source === 'server' ? store.items : null;
  const offers = serverItems
    ? buildOffers(serverItems, absoluteUrl('/pricing'))
    : [];
  const onSale = serverItems ? hasOffers(serverItems) : undefined;

  const ctaLabels = {
    waitlist: t('hero.waitlist'),
    pricing: t('hero.pricing'),
    buy: t('hero.buy'),
    faq: t('hero.faq'),
  };

  return (
    <div className="rf-product flex flex-1 flex-col items-center">
      <SoftwareApplicationJsonLd offers={offers} />
      <FAQJsonLd
        items={faq.items.map((item) => ({
          question: item.question,
          answer: item.text,
        }))}
      />
      <AnnouncementBar />
      <LocalNav onSale={onSale} />
      <Hero
        heading={t.rich('hero.heading', {
          highlight: (chunks) => <span className="rf-quiet">{chunks}</span>,
        })}
        ctas={
          <StoreCtas labels={ctaLabels} onSale={onSale} goalSection="hero" />
        }
      />
      <AgentTranscript />
      <HowItWorks />
      <ConnectAgent tabs={<AgentTabs clients={AGENT_CLIENTS} />} />
      <Engines />
      <ReelGallery />
      <NumbersBand />
      <Privacy />
      <EnterpriseStrip />
      <section
        id="pricing"
        aria-labelledby="pricing-title"
        className="w-full max-w-6xl scroll-mt-28 px-4 py-24 md:px-6 md:py-32"
      >
        <div className="mb-12 text-center">
          <p className="rf-eyebrow">Pricing</p>
          <h2 id="pricing-title" className="rf-headline mt-3">
            {tPricing('title')}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            {tPricing('subtitle')}
          </p>
        </div>
        <LitePricingCatalog serverItems={serverItems} />
        <LaunchPriceNote className="mt-6" />
        <RemotionNotice className="mx-auto mt-10 max-w-3xl" />
        <p className="mt-8 text-center text-sm">
          <Link href="/pricing" className="rf-link underline">
            Which licence do I need? See every licence and what it includes
          </Link>
        </p>
      </section>
      <section
        id="faq"
        className="w-full max-w-3xl scroll-mt-28 px-4 pb-24 md:px-6"
        aria-labelledby="home-faq-title"
      >
        <h2 id="home-faq-title" className="rf-headline text-center">
          Questions
        </h2>
        <FaqSection items={faq.items} />
      </section>
      <FinalCta
        ctas={
          <StoreCtas labels={ctaLabels} onSale={onSale} goalSection="final" />
        }
      />
      <Footnotes />
    </div>
  );
}

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/marketing/hero-section';
import { PricingCatalog } from '@/components/store/pricing-catalog';
import { RemotionNotice } from '@/components/remotion-notice';
import { CtaBanner } from '@/components/marketing/cta-banner';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');

  return {
    title: {
      absolute: t('meta.title'),
    },
    description: t('meta.description'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
    },
  };
}

export default async function HomePage() {
  const tPricing = await getTranslations('pricing');

  return (
    <div className="flex flex-1 flex-col items-center">
      <HeroSection />
      <div className="w-full max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {tPricing('title')}
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl">
            {tPricing('subtitle')}
          </p>
        </div>
        <PricingCatalog />
        <RemotionNotice className="mx-auto mt-10 max-w-3xl" />
      </div>
      <CtaBanner />
    </div>
  );
}

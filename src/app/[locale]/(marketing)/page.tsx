import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/marketing/hero-section';
import { PricingSection } from '@/components/pricing-section';
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
        <PricingSection
          title={tPricing('title')}
          description={tPricing('subtitle')}
        />
      </div>
      <CtaBanner />
    </div>
  );
}

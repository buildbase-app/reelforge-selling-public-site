'use client';

import { useTranslations } from 'next-intl';
import { StoreCtas } from '@/components/store/store-ctas';

/** `onSale` as for HeroSection: from the page's server read, if it had one. */
export function CtaBanner({ onSale }: { onSale?: boolean }) {
  const t = useTranslations('home');

  return (
    <section className="w-full px-6 py-20">
      <div className="from-primary/10 via-primary/5 border-primary/20 mx-auto max-w-4xl rounded-2xl border bg-gradient-to-br to-transparent px-8 py-16 text-center">
        <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
          {t('cta.heading')}
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
          {t('cta.description')}
        </p>
        <div className="mt-8">
          <StoreCtas
            labels={{
              waitlist: t('hero.waitlist'),
              pricing: t('hero.pricing'),
              buy: t('hero.buy'),
              faq: t('hero.faq'),
            }}
            onSale={onSale}
          />
        </div>
      </div>
    </section>
  );
}

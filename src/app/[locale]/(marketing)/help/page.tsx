import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HelpCenter } from '@/components/help/help-center';
import { FAQJsonLd } from '@/components/seo/json-ld';
import {
  getDocs,
  getRichContent,
  getTestimonials,
  hasContentApi,
} from '@/lib/platform/content';
import { getFaqSection } from '@/lib/platform/faqs';
import type { Locale } from '@/i18n/config';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';

interface HelpPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * ISR: the page is cached and rebuilt when the content it read changes. Its
 * BuildBase reads carry the SDK's `buildbase:*` tags, and the webhook routes
 * revalidate exactly the tags an edit names; this hour is only the safety
 * net (matches CONTENT_REVALIDATE_SECONDS, which Next needs as a literal).
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: HelpPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help' });
  return buildMarketingMetadata({
    path: '/help',
    locale: locale as Locale,
    title: t('title'),
    description: t('description'),
  });
}

/**
 * The FAQ collections `store-faq` and `agents-faq`, the `refund-policy`
 * content block, docs and testimonials, all written in the console. A
 * missing FAQ collection falls back to the local defaults in
 * src/lib/platform/faqs.ts. The FAQPage JSON-LD is built from the same
 * answers the page shows.
 */
export default async function HelpPage({ params }: HelpPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'help' });
  const configured = hasContentApi();
  const [storeFaq, agentsFaq, policy, docs, testimonials] = await Promise.all([
    getFaqSection('store'),
    getFaqSection('agents'),
    configured ? getRichContent() : null,
    configured ? getDocs() : { folders: [], posts: [] },
    configured ? getTestimonials() : [],
  ]);

  return (
    <div className="flex-1 px-6 py-12">
      <FAQJsonLd
        items={[...storeFaq.items, ...agentsFaq.items].map((item) => ({
          question: item.question,
          answer: item.text,
        }))}
      />
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-medium tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground max-w-measure mt-2">
          {t('description')}
        </p>
        <HelpCenter
          configured={configured}
          storeFaq={storeFaq}
          agentsFaq={agentsFaq}
          policy={policy}
          docs={docs}
          testimonials={testimonials}
        />
      </div>
    </div>
  );
}

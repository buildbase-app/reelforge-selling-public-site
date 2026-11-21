import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';
import { refund } from '@/content/pages/refund';
import { buildPageMetadata } from '@/content/pages/page-metadata';
import type { Locale } from '@/i18n/config';

interface RefundPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RefundPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    path: '/refund',
    locale: locale as Locale,
    loader: refund,
  });
}

export default async function RefundPage({ params }: RefundPageProps) {
  const { locale } = await params;
  return <LegalPage locale={locale} path="/refund" loader={refund} />;
}

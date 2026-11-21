import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';
import { licence } from '@/content/pages/licence';
import { buildPageMetadata } from '@/content/pages/page-metadata';
import type { Locale } from '@/i18n/config';

interface LicencePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LicencePageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    path: '/licence',
    locale: locale as Locale,
    loader: licence,
  });
}

export default async function LicencePage({ params }: LicencePageProps) {
  const { locale } = await params;
  return <LegalPage locale={locale} path="/licence" loader={licence} />;
}

import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';
import { terms } from '@/content/pages/terms';
import { buildPageMetadata } from '@/content/pages/page-metadata';
import type { Locale } from '@/i18n/config';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    path: '/terms',
    locale: locale as Locale,
    loader: terms,
  });
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  return <LegalPage locale={locale} path="/terms" loader={terms} />;
}

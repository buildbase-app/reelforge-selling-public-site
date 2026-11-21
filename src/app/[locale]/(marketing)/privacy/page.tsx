import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';
import { privacy } from '@/content/pages/privacy';
import { buildPageMetadata } from '@/content/pages/page-metadata';
import type { Locale } from '@/i18n/config';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    path: '/privacy',
    locale: locale as Locale,
    loader: privacy,
  });
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  return <LegalPage locale={locale} path="/privacy" loader={privacy} />;
}

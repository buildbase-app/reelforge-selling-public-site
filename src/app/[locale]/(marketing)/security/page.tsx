import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';
import { security } from '@/content/pages/security';
import { buildPageMetadata } from '@/content/pages/page-metadata';
import type { Locale } from '@/i18n/config';

interface SecurityPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: SecurityPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    path: '/security',
    locale: locale as Locale,
    loader: security,
  });
}

export default async function SecurityPage({ params }: SecurityPageProps) {
  const { locale } = await params;
  return <LegalPage locale={locale} path="/security" loader={security} />;
}

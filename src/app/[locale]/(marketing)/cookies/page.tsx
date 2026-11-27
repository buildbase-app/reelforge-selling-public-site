import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';
import { cookies } from '@/content/pages/cookies';
import { buildPageMetadata } from '@/content/pages/page-metadata';
import type { Locale } from '@/i18n/config';

interface CookiesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CookiesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    path: '/cookies',
    locale: locale as Locale,
    loader: cookies,
  });
}

export default async function CookiesPage({ params }: CookiesPageProps) {
  const { locale } = await params;
  return <LegalPage locale={locale} path="/cookies" loader={cookies} />;
}

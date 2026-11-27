import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';
import { about } from '@/content/pages/about';
import { buildPageMetadata } from '@/content/pages/page-metadata';
import type { Locale } from '@/i18n/config';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    path: '/about',
    locale: locale as Locale,
    loader: about,
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  return <LegalPage locale={locale} path="/about" loader={about} />;
}

import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/legal-page';
import { methods } from '@/content/pages/methods';
import { buildPageMetadata } from '@/content/pages/page-metadata';
import type { Locale } from '@/i18n/config';

interface MethodsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: MethodsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    path: '/methods',
    locale: locale as Locale,
    loader: methods,
  });
}

export default async function MethodsPage({ params }: MethodsPageProps) {
  const { locale } = await params;
  return <LegalPage locale={locale} path="/methods" loader={methods} />;
}

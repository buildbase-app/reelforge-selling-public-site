import { getTranslations } from 'next-intl/server';
import { HomeHeader } from '@/components/home-header';
import { SiteFooter } from '@/components/site-footer';

/** The public site's frame: header, the page as `<main>`, footer. */
export async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('home');
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <HomeHeader title={t('title')} />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter title={t('title')} />
    </div>
  );
}

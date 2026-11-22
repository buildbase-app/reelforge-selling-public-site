import { getTranslations } from 'next-intl/server';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Link } from '@/i18n/link';

const NAV_HREFS = [
  '/gallery',
  '/agents',
  '/docs',
  '/pricing',
  '/help',
  '/blog',
  '/changelog',
] as const;

type NavHref = (typeof NAV_HREFS)[number];

interface HomeHeaderProps {
  title: string;
  /**
   * The sign-in / dashboard button: `LiteAuthButton` on provider-free pages,
   * `ProviderAuthButton` inside `SaaSProvider` (see MarketingShell).
   */
  auth: React.ReactNode;
}

/** A server component: only its buttons are client code (studio issue #79). */
export async function HomeHeader({ title, auth }: HomeHeaderProps) {
  const t = await getTranslations('common');

  const NAV_LINK_KEYS: Record<NavHref, string> = {
    // English only for now (src/i18n/config.ts): no message key yet.
    '/gallery': 'Gallery',
    '/agents': 'Agents',
    '/pricing': t('footer.links.pricing'),
    '/docs': t('footer.links.docs'),
    '/help': t('footer.links.help'),
    '/blog': t('footer.links.blog'),
    '/changelog': t('footer.links.changelog'),
  };

  return (
    <header className="bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50 flex items-center justify-between border-b px-4 py-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-foreground text-lg font-semibold tracking-tight"
        >
          {title}
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_HREFS.map((href) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {NAV_LINK_KEYS[href]}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher label={t('language.select')} />
        <ThemeToggle
          labels={{
            toggle: t('theme.toggle'),
            light: t('theme.light'),
            dark: t('theme.dark'),
            system: t('theme.system'),
          }}
        />
        {auth}
      </div>
    </header>
  );
}

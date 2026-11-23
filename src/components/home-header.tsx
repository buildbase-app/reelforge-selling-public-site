import { getTranslations } from 'next-intl/server';
import { ChevronRight, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { SiteMenu } from '@/components/site-menu';
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

/** Where "Connect your agent" goes: the home page's section of that name. */
const CONNECT_HREF = '/#connect';

/**
 * Shown only when the header holds a primary action (`[data-header-cta]`,
 * which only the home page passes): "Connect your agent" belongs to that
 * page. `:has()` decides, so the header needs no script and no path.
 */
const HOME_ONLY = 'hidden group-has-[[data-header-cta]]/header:flex';

interface HomeHeaderProps {
  title: string;
  /**
   * The sign-in / dashboard button: `LiteAuthButton` on provider-free pages,
   * `ProviderAuthButton` inside `SaaSProvider` (see MarketingShell).
   */
  auth: React.ReactNode;
  /**
   * The page's one primary action, at the right end of the header. Only the
   * home page has one (`HeaderCta`, from the `@headerAction` slot); it marks
   * its link `data-header-cta`.
   */
  action?: React.ReactNode;
}

/**
 * The one header on every public page (studio issues #79 and #215): sticky,
 * on the solid page background, `--header-h` tall (globals.css), which is
 * also the in-page anchors' `scroll-margin-top`. A server component: only
 * its buttons and the menu's close-on-click are client code.
 */
export async function HomeHeader({ title, auth, action }: HomeHeaderProps) {
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
    <header className="group/header bg-background sticky top-0 z-50 flex h-(--header-h) items-center justify-between gap-4 border-b px-4 md:px-6">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-foreground text-base font-semibold tracking-tight sm:text-lg"
        >
          {title}
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
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
      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href={CONNECT_HREF}
          className={`${HOME_ONLY} text-foreground mr-2 items-center gap-0.5 text-sm font-medium underline-offset-4 hover:underline max-xl:hidden!`}
        >
          Connect your agent
          <ChevronRight className="size-4" aria-hidden />
        </Link>
        <LanguageSwitcher label={t('language.select')} />
        {/* On a phone the home header needs the room for its action; the
            footer has the same toggle. */}
        <div className="flex max-sm:group-has-[[data-header-cta]]/header:hidden">
          <ThemeToggle
            labels={{
              toggle: t('theme.toggle'),
              light: t('theme.light'),
              dark: t('theme.dark'),
              system: t('theme.system'),
            }}
          />
        </div>
        {/* Tighter on a phone, so the home page's action fits at 360 px. */}
        <div className="flex max-sm:[&>[data-slot=button]]:px-2.5">{auth}</div>
        {action}
        <SiteMenu
          label={t('nav.menu')}
          icon={<Menu className="size-5" aria-hidden />}
        >
          <nav className="mx-auto flex max-w-[1200px] flex-col px-4 py-2 md:px-6">
            <Link
              href={CONNECT_HREF}
              className={`${HOME_ONLY} text-foreground h-11 items-center justify-between border-b text-base font-medium`}
            >
              Connect your agent
              <ChevronRight
                className="text-muted-foreground size-4"
                aria-hidden
              />
            </Link>
            {NAV_HREFS.map((href) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground hover:text-foreground flex h-11 items-center text-base font-medium transition-colors"
              >
                {NAV_LINK_KEYS[href]}
              </Link>
            ))}
          </nav>
        </SiteMenu>
      </div>
    </header>
  );
}

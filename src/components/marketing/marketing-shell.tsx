import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { HomeHeader } from '@/components/home-header';
import { SiteFooter } from '@/components/site-footer';
import { LiteAuthButton } from '@/components/auth/lite-auth-button';
import { AuthIslandHost } from '@/components/auth/auth-island';
import { SessionHintProvider } from '@/components/auth/session-hint';
import { SiteTracking } from '@/components/tracking/site-tracking';
import { SESSION_COOKIE_NAME } from '@/lib/buildbase';

/**
 * The public site's frame: header, the page as `<main>`, footer.
 *
 * Without `auth` it is provider-free (studio issue #79): the header's
 * button is `LiteAuthButton`, `AuthIslandHost` loads sign-in on demand, and
 * `SiteTracking` adds BuildBase tracking and the cookie banner. The two are
 * separate so a tracking blocker never stops sign-in (studio issue #596). The `(store)` group renders it
 * inside `SaaSProvider` and passes `ProviderAuthButton`; the provider then
 * does the tracking.
 */
export async function MarketingShell({
  children,
  auth,
  headerAction,
}: {
  children: React.ReactNode;
  auth?: React.ReactNode;
  /** The page's primary action in the header (home only: `HeaderCta`). */
  headerAction?: React.ReactNode;
}) {
  const [t, tc, jar] = await Promise.all([
    getTranslations('home'),
    getTranslations('common'),
    cookies(),
  ]);
  const hasSession = Boolean(jar.get(SESSION_COOKIE_NAME)?.value);
  return (
    <SessionHintProvider hasSession={hasSession}>
      <div className="bg-background flex min-h-screen flex-col">
        <HomeHeader
          title={t('title')}
          action={headerAction}
          auth={
            auth ?? (
              <LiteAuthButton
                labels={{
                  signIn: tc('buttons.signIn'),
                  dashboard: tc('nav.dashboard'),
                  loading: tc('buttons.loading'),
                }}
              />
            )
          }
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex flex-1 scroll-mt-(--header-h) flex-col outline-none"
        >
          {children}
        </main>
        <SiteFooter title={t('title')} />
      </div>
      {auth === undefined && (
        <>
          <AuthIslandHost />
          <SiteTracking />
        </>
      )}
    </SessionHintProvider>
  );
}

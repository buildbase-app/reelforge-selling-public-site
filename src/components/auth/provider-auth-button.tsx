'use client';

import '@/lib/zod-jitless';
import { useTranslations } from 'next-intl';
import {
  useSaaSAuth,
  WhenAuthenticated,
  WhenUnauthenticated,
} from '@buildbase/sdk/react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useHasSession } from './session-hint';

/**
 * The header's auth button on pages inside `SaaSProvider` (the `(store)`
 * group). Ghost, like `LiteAuthButton`: the header's one filled button is
 * the page's primary action (studio issue #215).
 */
export function ProviderAuthButton() {
  const { signIn, isLoading, status } = useSaaSAuth();
  const t = useTranslations('common');
  const hasSession = useHasSession();

  // While the SDK checks the session, the words it will most likely show
  // (from the server's session hint), disabled: a "Loading..." label of
  // another width moved the header's other buttons on every load of
  // /pricing (a layout shift; studio issue #215).
  if (status === 'loading' || status === 'authenticating' || isLoading) {
    return (
      <Button variant="ghost" disabled aria-busy>
        {hasSession ? t('nav.dashboard') : t('buttons.signIn')}
      </Button>
    );
  }

  return (
    <>
      <WhenUnauthenticated>
        <Button variant="ghost" onClick={() => signIn()}>
          {t('buttons.signIn')}
        </Button>
      </WhenUnauthenticated>
      <WhenAuthenticated>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">{t('nav.dashboard')}</Link>
        </Button>
      </WhenAuthenticated>
    </>
  );
}

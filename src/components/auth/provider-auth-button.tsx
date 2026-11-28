'use client';

import '@/lib/zod-jitless';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSaaSAuth, WhenAuthenticated } from '@buildbase/sdk/react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import {
  reportSignInFailure,
  SIGN_IN_TIMEOUT_MS,
  type SignInFailure,
} from './auth-island';
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
  const [failed, setFailed] = useState(false);
  // Each press is one attempt; a late answer from an earlier one is ignored.
  const attempt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      attempt.current += 1;
      window.clearTimeout(timer.current);
    },
    []
  );

  // A sign-in that neither leaves the page nor fails within 10 seconds
  // counts as failed, like `SignInButton` (studio issue #595).
  const start = () => {
    const id = ++attempt.current;
    const fail = (kind: SignInFailure, error?: unknown) => {
      if (attempt.current !== id) return;
      attempt.current += 1;
      window.clearTimeout(timer.current);
      reportSignInFailure(kind, error);
      setFailed(true);
    };
    setFailed(false);
    timer.current = window.setTimeout(
      () => fail('timeout'),
      SIGN_IN_TIMEOUT_MS
    );
    Promise.resolve()
      .then(() => signIn())
      .catch((error: unknown) => fail('error', error));
  };

  // While the SDK checks the session, the words it will most likely show
  // (from the server's session hint), disabled: a "Loading..." label of
  // another width moved the header's other buttons on every load of
  // /pricing (a layout shift; studio issue #215).
  if (
    !failed &&
    (status === 'loading' || status === 'authenticating' || isLoading)
  ) {
    return (
      <Button variant="ghost" disabled aria-busy>
        {hasSession ? t('nav.dashboard') : t('buttons.signIn')}
      </Button>
    );
  }

  // Signed out, or a start that failed while the SDK still says it is
  // signing in: the button again, with the message under it.
  if (status === 'unauthenticated' || (failed && status !== 'authenticated')) {
    return (
      <span className="relative inline-flex">
        <Button variant="ghost" onClick={start}>
          {t('buttons.signIn')}
        </Button>
        {failed ? (
          <span
            role="alert"
            className="bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-2 w-64 rounded-md border p-3 text-sm whitespace-normal shadow-md"
          >
            {t('auth.signInFailed')}{' '}
            <Link href="/contact" className="underline underline-offset-4">
              {t('auth.contactSupport')}
            </Link>
            .
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <WhenAuthenticated>
      <Button variant="ghost" asChild>
        <Link href="/dashboard">{t('nav.dashboard')}</Link>
      </Button>
    </WhenAuthenticated>
  );
}

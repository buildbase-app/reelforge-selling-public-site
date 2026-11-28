'use client';

import '@/lib/zod-jitless';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { safeReturnTo } from '@buildbase/sdk';
import { useSaaSAuth } from '@buildbase/sdk/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import {
  reportSignInFailure,
  SIGN_IN_TIMEOUT_MS,
  type SignInFailure,
} from './auth-island';

/** Where to go after signing in when `?next=` is missing or not ours. */
export const DEFAULT_NEXT = '/dashboard';

/**
 * The path to come back to: `?next=` when it is a path on this site
 * (`/…`, never `//host` or a scheme), else the dashboard.
 */
export function signInNext(raw: string | null): string {
  return (raw && safeReturnTo(raw)) || DEFAULT_NEXT;
}

/**
 * Starts the hosted sign-in once the SDK knows the visitor is signed out,
 * and shows a "Continue to sign in" button in case it doesn't leave the
 * page. A start that fails, or doesn't leave within 10 seconds, shows the
 * sign-in error with the button to try again (studio issues #595, #597).
 * Someone already signed in goes straight on to `next`.
 */
export function SignInPage() {
  const { status, signIn } = useSaaSAuth();
  const t = useTranslations('common');
  const router = useRouter();
  const next = signInNext(useSearchParams().get('next'));
  // Pending from the start: the page signs in on its own once the SDK knows
  // the visitor is signed out.
  const [state, setState] = useState<'pending' | 'failed'>('pending');
  const attempt = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const autoStarted = useRef(false);

  useEffect(
    () => () => {
      attempt.current += 1;
      window.clearTimeout(timer.current);
    },
    []
  );

  const start = () => {
    const id = ++attempt.current;
    const fail = (kind: SignInFailure, error?: unknown) => {
      if (attempt.current !== id) return;
      attempt.current += 1;
      window.clearTimeout(timer.current);
      reportSignInFailure(kind, error);
      setState('failed');
    };
    setState('pending');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => fail('timeout'),
      SIGN_IN_TIMEOUT_MS
    );
    const returnUrl = new URL(next, window.location.origin).href;
    Promise.resolve()
      .then(() => signIn(returnUrl))
      .catch((error: unknown) => fail('error', error));
  };

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(next);
      return;
    }
    if (status === 'unauthenticated' && !autoStarted.current) {
      autoStarted.current = true;
      // After this render, not inside the effect itself.
      window.setTimeout(start, 0);
    }
    // `start` reads the latest `next`; run only when the status settles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-medium tracking-tight">
        {t('buttons.signIn')}
      </h1>
      {state === 'failed' ? (
        <p role="alert" className="text-sm">
          {t('auth.signInFailed')}{' '}
          <Link href="/contact" className="underline underline-offset-4">
            {t('auth.contactSupport')}
          </Link>
          .
        </p>
      ) : (
        <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Taking you to sign in…
        </p>
      )}
      <Button onClick={start} disabled={status === 'authenticated'}>
        Continue to sign in
      </Button>
    </div>
  );
}

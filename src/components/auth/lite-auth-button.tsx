'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from '@/components/icons/lite';
import { buttonClass } from '@/components/ui/button-classes';
import { Link } from '@/i18n/link';
import {
  preloadAuth,
  reportSignInFailure,
  requestSignIn,
  SIGN_IN_TIMEOUT_MS,
  type SignInFailure,
} from './auth-island';
import { useHasSession } from './session-hint';

/**
 * The header's "Sign in" / "Dashboard" button on pages without the
 * BuildBase provider (studio issue #79). The session hint comes from the
 * server, so the right button shows at once; the SDK loads only on hover,
 * focus or press, and then starts the hosted sign-in. It loads with every
 * public page, so it draws `Button`'s markup with `buttonClass` instead of
 * importing `Button` and its class tooling. Ghost: the header's one filled
 * button is the page's primary action, when it has one (studio issue #215).
 */
export function LiteAuthButton({
  labels,
}: {
  /** Translated on the server: no message formatting in the browser. */
  labels: {
    signIn: string;
    dashboard: string;
    loading: string;
    signInFailed?: string;
    contactSupport?: string;
  };
}) {
  const hasSession = useHasSession();

  if (hasSession) {
    return (
      <Link
        href="/dashboard"
        data-slot="button"
        data-variant="ghost"
        data-size="default"
        className={buttonClass('ghost')}
      >
        {labels.dashboard}
      </Link>
    );
  }
  return (
    <SignInButton
      loadingLabel={labels.loading}
      failedLabel={labels.signInFailed}
      contactLabel={labels.contactSupport}
      variant="ghost"
    >
      {labels.signIn}
    </SignInButton>
  );
}

/**
 * A button that starts BuildBase's hosted sign-in without the provider on
 * the page: it shows `loadingLabel` while the SDK loads, which then takes
 * over with its own "Redirecting…" screen. `returnTo` is the path to come
 * back to (default: this page). If the sign-in neither leaves the page nor
 * fails within 10 seconds, or fails, the button comes back with a message
 * and can be pressed again (studio issue #595).
 */
export function SignInButton({
  children,
  returnTo,
  loadingLabel = 'Loading...',
  failedLabel = "Sign-in didn't start. Try again, or",
  contactLabel = 'contact support',
  variant = 'default',
}: {
  children: React.ReactNode;
  returnTo?: string;
  loadingLabel?: string;
  /** The message after a failed start; `contactLabel` links to /contact. */
  failedLabel?: string;
  contactLabel?: string;
  /**
   * `ghost` in the site header, where the page's one primary action (if
   * any) is the filled button (studio issue #215). `outline` under a
   * card's "Buy now" (studio issue #257).
   */
  variant?: 'default' | 'ghost' | 'outline';
}) {
  const [state, setState] = useState<'idle' | 'pending' | 'failed'>('idle');
  // Each press is one attempt; a late answer from an earlier one is ignored.
  const attempt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      // Unmounted: stop the timer and drop any answer still on its way.
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
    timer.current = window.setTimeout(
      () => fail('timeout'),
      SIGN_IN_TIMEOUT_MS
    );
    requestSignIn(
      returnTo ? new URL(returnTo, window.location.origin).href : undefined
    ).catch((error: unknown) => fail('error', error));
  };

  if (state === 'pending') {
    const pendingVariant = variant === 'ghost' ? 'ghost' : 'outline';
    return (
      <button
        data-slot="button"
        data-variant={pendingVariant}
        data-size="default"
        className={buttonClass(pendingVariant)}
        disabled
        aria-busy
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingLabel}
      </button>
    );
  }
  return (
    <span className="relative inline-flex">
      <button
        data-slot="button"
        data-variant={variant}
        data-size="default"
        className={buttonClass(variant)}
        onPointerEnter={preloadAuth}
        onFocus={preloadAuth}
        onClick={start}
      >
        {children}
      </button>
      {state === 'failed' ? (
        <span
          role="alert"
          className="bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-2 w-64 rounded-md border p-3 text-sm whitespace-normal shadow-md"
        >
          {failedLabel}{' '}
          <Link href="/contact" className="underline underline-offset-4">
            {contactLabel}
          </Link>
          .
        </span>
      ) : null}
    </span>
  );
}

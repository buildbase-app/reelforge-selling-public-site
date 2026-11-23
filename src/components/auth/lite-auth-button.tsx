'use client';

import { useState } from 'react';
import { Loader2 } from '@/components/icons/lite';
import { buttonClass } from '@/components/ui/button-classes';
import { Link } from '@/i18n/link';
import { preloadAuth, requestSignIn } from './auth-island';
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
  labels: { signIn: string; dashboard: string; loading: string };
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
    <SignInButton loadingLabel={labels.loading} variant="ghost">
      {labels.signIn}
    </SignInButton>
  );
}

/**
 * A button that starts BuildBase's hosted sign-in without the provider on
 * the page: it shows `loadingLabel` while the SDK loads, which then takes
 * over with its own "Redirecting…" screen. `returnTo` is the path to come
 * back to (default: this page).
 */
export function SignInButton({
  children,
  returnTo,
  loadingLabel = 'Loading...',
  variant = 'default',
}: {
  children: React.ReactNode;
  returnTo?: string;
  loadingLabel?: string;
  /**
   * `ghost` in the site header, where the page's one primary action (if
   * any) is the filled button (studio issue #215). `outline` under a
   * card's "Buy now" (studio issue #257).
   */
  variant?: 'default' | 'ghost' | 'outline';
}) {
  const [pending, setPending] = useState(false);

  if (pending) {
    const pendingVariant = variant === 'ghost' ? 'ghost' : 'outline';
    return (
      <button
        data-slot="button"
        data-variant={pendingVariant}
        data-size="default"
        className={buttonClass(pendingVariant)}
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingLabel}
      </button>
    );
  }
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size="default"
      className={buttonClass(variant)}
      onPointerEnter={preloadAuth}
      onFocus={preloadAuth}
      onClick={() => {
        setPending(true);
        requestSignIn(
          returnTo ? new URL(returnTo, window.location.origin).href : undefined
        );
      }}
    >
      {children}
    </button>
  );
}

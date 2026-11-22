'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { preloadAuth, requestSignIn } from './auth-island';
import { useHasSession } from './session-hint';

/**
 * The header's "Sign in" / "Dashboard" button on pages without the
 * BuildBase provider (studio issue #79). The session hint comes from the
 * server, so the right button shows at once; the SDK loads only on hover,
 * focus or press, and then starts the hosted sign-in.
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
      <Button asChild>
        <Link href="/dashboard">{labels.dashboard}</Link>
      </Button>
    );
  }
  return (
    <SignInButton loadingLabel={labels.loading}>{labels.signIn}</SignInButton>
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
}: {
  children: React.ReactNode;
  returnTo?: string;
  loadingLabel?: string;
}) {
  const [pending, setPending] = useState(false);

  if (pending) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingLabel}
      </Button>
    );
  }
  return (
    <Button
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
    </Button>
  );
}

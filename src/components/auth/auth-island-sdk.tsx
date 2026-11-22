'use client';

import '@/lib/zod-jitless';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSaaSAuth } from '@buildbase/sdk/react';
import { SaaSProvider } from '@/components/saas-provider';

export type AuthRequest =
  | { kind: 'signIn'; returnUrl?: string }
  | { kind: 'callback' };

/**
 * Loaded on demand by `AuthIslandHost` (./auth-island.tsx). The provider
 * finishes a sign-in return on its own; for a sign-in request it waits until
 * the SDK knows the session, then starts the hosted sign-in. Its tracking
 * is off: the page's `BuildBaseTracking` (an ancestor) receives the SDK's
 * sign-in events instead.
 */
export default function AuthIslandSdk({ request }: { request: AuthRequest }) {
  return (
    <SaaSProvider tracking={false}>
      <AuthRunner request={request} />
    </SaaSProvider>
  );
}

function AuthRunner({ request }: { request: AuthRequest }) {
  const { status, signIn } = useSaaSAuth();
  const router = useRouter();
  const started = useRef<AuthRequest | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' && status !== 'unauthenticated') return;
    if (request.kind === 'callback') {
      // Signed in on this page: render the header and prices again with
      // the new session cookie.
      if (status === 'authenticated' && started.current !== request) {
        started.current = request;
        router.refresh();
      }
      return;
    }
    if (started.current === request) return;
    started.current = request;
    if (status === 'authenticated') router.push('/dashboard');
    else void signIn(request.returnUrl);
  }, [status, request, signIn, router]);

  return null;
}

'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { clientOnly } from '@/components/client-only';
import { isAuthCallback } from '@/lib/auth-callback';
import type { AuthRequest } from './auth-island-sdk';

/**
 * Sign-in for pages rendered without the BuildBase provider (studio issue
 * #79). The SDK (about 580 KB gzip) loads only when it is needed: when the
 * visitor presses a sign-in button, or when the page is a return from the
 * hosted sign-in page that the SDK has to finish. `AuthIslandHost` then
 * mounts `SaaSProvider` for that one job.
 */
let current: AuthRequest | null = null;
const listeners = new Set<() => void>();

function setRequest(next: AuthRequest) {
  current = next;
  for (const listener of listeners) listener();
}

/** Start BuildBase's hosted sign-in; back to `returnUrl` (default: this page). */
export function requestSignIn(returnUrl?: string) {
  setRequest({ kind: 'signIn', returnUrl });
}

/** Fetch the SDK early, on hover or focus of a sign-in button. */
export function preloadAuth() {
  void loadIsland();
}

// The `typeof window` test is inlined at build time, so the server bundle
// drops this import (and a copy of the SDK) instead of tracing it.
const loadIsland = () =>
  typeof window === 'undefined'
    ? new Promise<never>(() => {})
    : import('./auth-island-sdk');

const AuthIslandSdk = clientOnly(loadIsland);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function AuthIslandHost() {
  const request = useSyncExternalStore(
    subscribe,
    () => current,
    () => null
  );
  useEffect(() => {
    if (!current && isAuthCallback(window.location.search)) {
      setRequest({ kind: 'callback' });
    }
  }, []);
  return request ? <AuthIslandSdk request={request} /> : null;
}

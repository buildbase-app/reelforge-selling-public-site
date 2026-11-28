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

/**
 * Start BuildBase's hosted sign-in; back to `returnUrl` (default: this
 * page). On success the page leaves for the sign-in page, so the promise
 * never settles; it rejects when the SDK fails to load or `signIn` throws
 * (studio issue #595).
 */
export function requestSignIn(returnUrl?: string): Promise<never> {
  return new Promise<never>((_, reject) => {
    setRequest({ kind: 'signIn', returnUrl, onError: reject });
    loadIsland().catch(reject);
  });
}

/** How long a sign-in may take to leave the page before it counts as failed. */
export const SIGN_IN_TIMEOUT_MS = 10_000;

/** Names a sign-in failure is reported under; nothing else is sent. */
export type SignInFailure = 'timeout' | 'error';

/**
 * Tell the server a sign-in did not start, so failures show up in its
 * logs. Only the kind of failure and the error's name are sent: no URL,
 * message or user data. Best effort: a failed report is dropped.
 */
export function reportSignInFailure(kind: SignInFailure, error?: unknown) {
  const errorName =
    error instanceof Error ? error.name.slice(0, 64) : undefined;
  try {
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'client:sign-in-failed',
        data: { kind, errorName },
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // fetch itself is unavailable: nothing to report with.
  }
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

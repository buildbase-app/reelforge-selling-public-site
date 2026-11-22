/**
 * Client-side app token, held in memory only.
 *
 * Hardening from a private security review (SEC-13): the token used to be
 * kept in localStorage for 7 days. It now lives in this module for the life
 * of the page, is short-lived (see `createAuthToken`), and is minted again
 * by /api/auth/workspace-token whenever the active workspace changes. A
 * reload starts without one.
 */
let appToken: string | null = null;

/** Tokens earlier versions left in localStorage. */
const LEGACY_STORAGE_KEY = 'auth_token';

export function getClientAuthToken(): string | null {
  return appToken;
}

export function setClientAuthToken(token: string | null): void {
  appToken = token;
}

/** Drop a long-lived token an earlier version stored, if any. */
export function clearLegacyAuthToken(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage blocked: nothing was stored either.
  }
}

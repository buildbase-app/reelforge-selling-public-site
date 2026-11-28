'use client';

/**
 * The browser side of finishing a sign-in (studio issue #600). A code
 * exchange that fails throws, so the SDK doesn't treat it as signed in
 * with no session, and the page says "Sign-in didn't finish"; a session
 * read that gets an error page instead of JSON counts as signed out.
 */

export class SignInExchangeError extends Error {
  constructor(readonly status: number) {
    super(`Sign-in exchange failed (${status})`);
    this.name = 'SignInExchangeError';
  }
}

const UNFINISHED_EVENT = 'renderweld:sign-in-unfinished';
let unfinished = false;

/** Shows the "Sign-in didn't finish" notice on this page. */
export function markSignInUnfinished(): void {
  unfinished = true;
  window.dispatchEvent(new Event(UNFINISHED_EVENT));
}

/** Hides it again (the visitor closed it). */
export function clearSignInUnfinished(): void {
  unfinished = false;
  window.dispatchEvent(new Event(UNFINISHED_EVENT));
}

export function isSignInUnfinished(): boolean {
  return unfinished;
}

export function onSignInUnfinishedChange(listener: () => void): () => void {
  window.addEventListener(UNFINISHED_EVENT, listener);
  return () => window.removeEventListener(UNFINISHED_EVENT, listener);
}

async function json(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const data: unknown = await res.json();
    return data && typeof data === 'object'
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Trades the hosted sign-in page's code for a session id. Throws when the
 * store refuses it or answers without one, after showing the notice.
 */
export async function exchangeSignInCode(
  code: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ sessionId: string }> {
  let status = 0;
  try {
    const res = await fetchImpl('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    status = res.status;
    const data = res.ok ? await json(res) : null;
    const sessionId = data?.sessionId;
    if (typeof sessionId === 'string' && sessionId) return { sessionId };
  } catch {
    /* network failure: status 0 */
  }
  markSignInUnfinished();
  throw new SignInExchangeError(status);
}

/**
 * The session id the httpOnly cookie holds, or null: also null when the
 * answer is an error or not JSON (a proxy's error page, say).
 */
export async function readSessionId(
  fetchImpl: typeof fetch = fetch
): Promise<string | null> {
  try {
    const res = await fetchImpl('/api/auth/session');
    if (!res.ok) return null;
    const sessionId = (await json(res))?.sessionId;
    return typeof sessionId === 'string' && sessionId ? sessionId : null;
  } catch {
    return null;
  }
}

'use client';

import { useSyncExternalStore } from 'react';
import {
  clearSignInUnfinished,
  isSignInUnfinished,
  onSignInUnfinishedChange,
} from './token-exchange';

export const SIGN_IN_UNFINISHED = "Sign-in didn't finish. Please try again.";

/**
 * The notice a failed code exchange shows (studio issue #600), with a link
 * to /signin. Plain words and a plain link: the sign-in island mounts this
 * on public pages, which have no intl provider.
 */
export function SignInUnfinished() {
  const show = useSyncExternalStore(
    onSignInUnfinishedChange,
    isSignInUnfinished,
    () => false
  );
  if (!show) return null;
  return (
    <div
      role="alert"
      className="bg-background fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-center gap-3 border-b px-4 py-3 text-sm shadow-sm"
    >
      <span>{SIGN_IN_UNFINISHED}</span>
      <a href="/signin" className="font-medium underline underline-offset-4">
        Sign in again
      </a>
      <button
        type="button"
        onClick={clearSignInUnfinished}
        className="text-muted-foreground underline underline-offset-4"
      >
        Close
      </button>
    </div>
  );
}

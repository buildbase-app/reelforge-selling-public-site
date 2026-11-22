'use client';

import { createContext, useContext } from 'react';

/**
 * Whether the visitor has a session cookie, read on the server
 * (`MarketingShell`), for pages that render without the BuildBase provider:
 * the header shows "Dashboard" or "Sign in" at once, without loading the SDK
 * to ask (studio issue #79). A hint only: the dashboard still checks the
 * session with BuildBase.
 */
const SessionHintContext = createContext(false);

export function SessionHintProvider({
  hasSession,
  children,
}: {
  hasSession: boolean;
  children: React.ReactNode;
}) {
  return (
    <SessionHintContext.Provider value={hasSession}>
      {children}
    </SessionHintContext.Provider>
  );
}

export function useHasSession(): boolean {
  return useContext(SessionHintContext);
}

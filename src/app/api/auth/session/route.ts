/**
 * Session endpoint: reads the httpOnly cookie and returns the session id.
 * Called by the SDK's getSession callback on page refresh.
 *
 * The BuildBase SDK (1.8) calls the platform from the browser with this id,
 * so the page needs it. Hardening (private security review SEC-13): only a
 * same-origin request gets it, the answer is never cached, and the strict
 * CSP (src/lib/security/csp.ts) limits where a page can send data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/buildbase';

export async function GET(request: NextRequest) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') {
    return NextResponse.json(
      { sessionId: null },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  return NextResponse.json(
    { sessionId },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

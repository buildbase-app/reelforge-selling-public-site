/**
 * Session endpoint: reads the httpOnly cookie and returns the session id.
 * Called by the SDK's getSession callback on page refresh.
 *
 * The BuildBase SDK (1.8) calls the platform from the browser with this id,
 * so the page needs it. Hardening (private security review SEC-13): only a
 * same-origin request gets it, the answer is never cached, and the strict
 * CSP (src/lib/security/csp.ts) limits where a page can send data.
 *
 * A session BuildBase says is over is answered as signed out and its
 * cookie cleared, so the site header stops saying "Dashboard" for it
 * (studio issue #602).
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/buildbase';
import { isSessionDead } from '@/lib/session-check';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(request: NextRequest) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') {
    return NextResponse.json(
      { sessionId: null },
      { status: 403, headers: NO_STORE }
    );
  }
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
  if (sessionId && (await isSessionDead(sessionId))) {
    const response = NextResponse.json(
      { sessionId: null },
      { headers: NO_STORE }
    );
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  }
  return NextResponse.json({ sessionId }, { headers: NO_STORE });
}

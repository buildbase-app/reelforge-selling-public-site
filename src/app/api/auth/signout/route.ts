import { NextRequest, NextResponse } from 'next/server';
import { refuseCrossSiteAuthPost } from '@buildbase/sdk';
import { SESSION_COOKIE_NAME } from '@/lib/buildbase';

/**
 * Clears this app's session cookie. It does not revoke the platform session,
 * on purpose: the SDK's `signOut()` calls this route first (its `onSignOut`
 * callback) and then revokes the session itself - just this one, or every
 * session the user has with `signOut({ everywhere: true })`. Revoking here
 * first would leave the SDK's revoke holding a dead id, and "sign out
 * everywhere" would end only this browser's session.
 *
 * Studio issue #604 asked for a server-side revoke here. Checked against
 * @buildbase/sdk 1.8: `signOut()` runs `onSignOut`, then revokes the session
 * at BuildBase, then clears its own state, so every sign-out on this site
 * (all of them go through `signOut()`) already revokes. Revisit if a
 * sign-out path appears that doesn't use the SDK.
 */
export async function POST(request: NextRequest) {
  // Same-origin JSON only: another site cannot sign a visitor out.
  const refused = refuseCrossSiteAuthPost(request);
  if (refused) return refused;

  const response = NextResponse.json({ success: true });

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma, setAuditContext } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/buildbase';
import { authCodeSchema } from '@/lib/validation/schemas';
import { validateBody, isValidationError } from '@/lib/validation/api';
import { environmentId, refuseCrossSiteAuthPost } from '@buildbase/sdk';
import { buildbaseEnvironment, env } from '@/env';
import { logger } from '@/lib/logger';
import { clientIp } from '@/lib/security/client-ip';

/**
 * Trades the hosted sign-in page's code for a session and keeps it in an
 * httpOnly cookie.
 *
 * Login CSRF (private security review SEC-14): only a same-origin JSON POST
 * gets this far (the SDK's `refuseCrossSiteAuthPost`, also applied by the
 * proxy), so only this site's own page can send a code here, and the SDK on
 * that page exchanges a code only when its `state` matches the one this
 * browser's `signIn()` stored (`OAUTH_STATE_INVALID` otherwise). BuildBase's
 * code exchange takes no PKCE verifier for an app client.
 *
 * The answer carries the session id because the SDK (1.8) calls BuildBase
 * from the browser with it; nothing else (no user record, no app token).
 */
export async function POST(request: NextRequest) {
  const refused = refuseCrossSiteAuthPost(request);
  if (refused) return refused;

  // Validate request body with Zod
  const validationResult = await validateBody(request, authCodeSchema);
  if (isValidationError(validationResult)) {
    return validationResult;
  }

  const { code } = validationResult;

  try {
    const authResponse = await fetch(
      `${env.NEXT_PUBLIC_BUILDBASE_SERVER_URL}/api/v1/auth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          clientId: env.NEXT_PUBLIC_BUILDBASE_CLIENT_ID,
          clientSecret: env.BUILDBASE_CLIENT_SECRET,
          // <orgId>-<key> in a development or staging environment; the bare
          // org id in production.
          orgId: environmentId(
            env.NEXT_PUBLIC_BUILDBASE_ORG_ID,
            buildbaseEnvironment
          ),
        }),
      }
    );

    if (!authResponse.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to verify token' },
        { status: 401 }
      );
    }

    const responseData = await authResponse.json();
    const responseResult = responseData.data;
    const sessionId = responseResult.sessionId;
    const userData = responseResult.user;
    // Create or update user in database
    const userId = userData.id || userData._id;
    setAuditContext({
      userId,
      ipAddress: clientIp(request.headers),
      userAgent: request.headers.get('user-agent') || undefined,
      source: 'api',
    });
    // DB write is a local mirror — don't block auth if it fails
    await prisma.user
      .upsert({
        where: { email: userData.email },
        update: {
          id: userId,
          name: userData.name,
          image: userData.image || null,
          role: userData.role || 'user',
          emailVerified: userData.emailVerified || false,
          timezone: userData.timezone || null,
          language: userData.language || null,
          country: userData.country || null,
          currency: userData.currency || null,
        },
        create: {
          id: userId,
          email: userData.email,
          name: userData.name,
          image: userData.image || null,
          role: userData.role || 'user',
          emailVerified: userData.emailVerified || false,
          timezone: userData.timezone || null,
          language: userData.language || null,
          country: userData.country || null,
          currency: userData.currency || null,
        },
      })
      .catch((err: unknown) => {
        logger.error('Failed to upsert user — auth continues', {
          error: err instanceof Error ? err.message : String(err),
          userId,
        });
      });

    // Set httpOnly cookie so getSession() can restore the session on page refresh
    const response = NextResponse.json(
      {
        success: true,
        message: 'Token verified successfully',
        sessionId,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );

    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    logger.error('Auth token exchange failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

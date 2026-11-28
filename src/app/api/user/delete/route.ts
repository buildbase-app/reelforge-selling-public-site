import { NextRequest, NextResponse } from 'next/server';
import { prisma, setAuditContext } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { logger } from '@/lib/logger';
import { eraseLocalUser, KEPT_AFTER_DELETE } from '@/lib/account-erase';
import { clientIp } from '@/lib/security/client-ip';

/**
 * Erase this store's own copy of the signed-in person (studio issue #603).
 *
 * This is not the account deletion: the account, its sign-in and its
 * sessions are BuildBase's, and the person deletes them from Settings,
 * Delete my account, which opens BuildBase's own flow. When BuildBase deletes
 * the account it sends `user.deleted`, and the webhook runs the same erase.
 * The answer says exactly that, rather than claiming everything is gone.
 */
export async function DELETE(request: NextRequest) {
  // Identity comes from the session, NOT from a bearer token.
  //
  // A signed token is only as trustworthy as whatever issued it, and this
  // route is irreversible: it erases a user. Reading the id from the session
  // means the only account that can be deleted is the one actually signed in,
  // regardless of what any token claims.
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { userId } = session;

  setAuditContext({
    userId,
    ipAddress: clientIp(request.headers),
    userAgent: request.headers.get('user-agent') || undefined,
    source: 'api',
  });

  try {
    const found = await eraseLocalUser(userId);
    if (!found) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Log the deletion event (with anonymized record since user is now gone)
    await prisma.auditLog.create({
      data: {
        action: 'gdpr_delete',
        model: 'User',
        recordId: userId,
        userId: null,
        ipAddress: clientIp(request.headers) ?? null,
        source: 'api',
      },
    });

    logger.info('GDPR data deletion completed', { userId });

    return NextResponse.json({
      success: true,
      message:
        "This store's copy of your profile was removed. Your BuildBase account and its sign-in stay until you delete the account in Settings. " +
        KEPT_AFTER_DELETE,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('GDPR data deletion failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { success: false, message: 'Failed to delete data' },
      { status: 500 }
    );
  }
}

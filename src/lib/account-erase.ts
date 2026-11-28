import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';

/**
 * What this store keeps about a person whose account is gone (studio issue
 * #603). The store holds only a copy of their profile, their workspace
 * memberships, the SDK events their browser sent, and audit rows. Orders,
 * invoices and licence keys live at BuildBase, which keeps the records tax
 * law requires; nothing here holds them.
 */
export const KEPT_AFTER_DELETE =
  'Order, invoice and licence records are kept by BuildBase for as long as tax law requires.';

/**
 * Erase the store's own copy of one person. Their profile row, memberships
 * and browser events go; audit rows stay with every personal field cleared,
 * so the history of changes survives without saying whose they were.
 *
 * Safe to run twice: every step matches by id, and a person already gone
 * leaves nothing to match. Answers whether a profile row was there.
 */
export async function eraseLocalUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  await prisma.$transaction([
    prisma.userWorkspace.deleteMany({ where: { userId } }),
    prisma.appEvent.deleteMany({ where: { userId } }),
    prisma.auditLog.updateMany({
      where: { userId },
      data: {
        userId: null,
        ipAddress: null,
        userAgent: null,
        before: Prisma.DbNull,
        after: Prisma.DbNull,
      },
    }),
    prisma.user.deleteMany({ where: { id: userId } }),
  ]);
  return user !== null;
}

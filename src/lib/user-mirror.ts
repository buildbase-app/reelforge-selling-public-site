import 'server-only';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/** The profile fields the store keeps of a BuildBase user. */
export interface MirroredUser {
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  emailVerified?: boolean;
  timezone?: string | null;
  language?: string | null;
  country?: string | null;
  currency?: string | null;
}

/**
 * An address no one receives mail at, kept unique per row, for a row whose
 * email now belongs to another BuildBase account.
 */
export function releasedEmail(id: string): string {
  return `released+${id}@user.invalid`;
}

/**
 * Writes the store's copy of a BuildBase user, keyed by the BuildBase user
 * id, never by email (studio issue #601): a row is never given another
 * account's id. When another row still holds this email (that account
 * changed its address, or was deleted and the address reused), that row's
 * email is released first, and the clash is logged by id. Throws when a
 * write fails, so the caller can fail the sign-in.
 */
export async function mirrorUser(
  id: string,
  user: MirroredUser
): Promise<void> {
  const fields = {
    email: user.email,
    name: user.name ?? null,
    image: user.image || null,
    role: user.role || 'user',
    ...(user.emailVerified === undefined
      ? {}
      : { emailVerified: user.emailVerified }),
    timezone: user.timezone || null,
    language: user.language || null,
    country: user.country || null,
    currency: user.currency || null,
  };
  const holder = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true },
  });
  if (holder && holder.id !== id) {
    logger.warn('User email moved to another account; released the old row', {
      userId: id,
      previousHolder: holder.id,
    });
    await prisma.user.update({
      where: { id: holder.id },
      data: { email: releasedEmail(holder.id) },
    });
  }
  await prisma.user.upsert({
    where: { id },
    update: fields,
    create: { id, ...fields },
  });
}

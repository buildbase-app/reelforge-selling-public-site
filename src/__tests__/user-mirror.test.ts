// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The store's copy of a user is keyed by BuildBase user id, an email that
 * another row still holds is released from that row first, and a failed
 * write throws (studio issue #601).
 */

const user = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn<(args: unknown) => Promise<object>>(async () => ({})),
  upsert: vi.fn<(args: unknown) => Promise<object>>(async () => ({})),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/db', () => ({ prisma: { user } }));

import { mirrorUser, releasedEmail } from '@/lib/user-mirror';

beforeEach(() => {
  user.findUnique.mockReset();
  user.update.mockClear();
  user.upsert.mockReset();
  user.upsert.mockImplementation(async () => ({}));
});

describe('mirrorUser', () => {
  it('upserts by BuildBase user id, never by email', async () => {
    user.findUnique.mockResolvedValue(null);
    await mirrorUser('u1', { email: 'a@example.com', name: 'A' });
    expect(user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        update: expect.objectContaining({ email: 'a@example.com' }),
        create: expect.objectContaining({ id: 'u1', email: 'a@example.com' }),
      })
    );
    expect(user.update).not.toHaveBeenCalled();
  });

  it('keeps the row it already has for this id', async () => {
    user.findUnique.mockResolvedValue({ id: 'u1' });
    await mirrorUser('u1', { email: 'a@example.com' });
    expect(user.update).not.toHaveBeenCalled();
    expect(user.upsert).toHaveBeenCalledOnce();
  });

  it("releases the email from another account's row first, and never changes that row's id", async () => {
    user.findUnique.mockResolvedValue({ id: 'old' });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mirrorUser('u1', { email: 'a@example.com' });
    expect(user.update).toHaveBeenCalledWith({
      where: { id: 'old' },
      data: { email: releasedEmail('old') },
    });
    expect(user.update.mock.invocationCallOrder[0]).toBeLessThan(
      user.upsert.mock.invocationCallOrder[0]
    );
    // Logged by id only.
    expect(warn.mock.calls.flat().join(' ')).not.toContain('a@example.com');
    warn.mockRestore();
  });

  it('throws when the write fails', async () => {
    user.findUnique.mockResolvedValue(null);
    user.upsert.mockRejectedValue(new Error('D1 down'));
    await expect(mirrorUser('u1', { email: 'a@example.com' })).rejects.toThrow(
      'D1 down'
    );
  });

  it('gives each released row its own address that receives no mail', () => {
    expect(releasedEmail('old')).toBe('released+old@user.invalid');
    expect(releasedEmail('a')).not.toBe(releasedEmail('b'));
  });
});

// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Account delete and export (studio issue #603): one erase of the store's
 * copy, run by the delete route and by BuildBase's `user.deleted` webhook,
 * and a delete answer that says what is kept.
 */

const db = vi.hoisted(() => ({
  findUnique: vi.fn(async (): Promise<unknown> => ({ id: 'u1' })),
  transaction: vi.fn(async (ops: unknown[]) => ops),
  calls: [] as string[],
  auditCreate: vi.fn(async () => ({})),
  upsert: vi.fn(async () => ({ id: 'row' })),
  session: { userId: 'u1' } as { userId: string } | null,
  event: null as null | { event: string; timestamp: number; data: object },
}));

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ getSessionUser: async () => db.session }));
vi.mock('@buildbase/sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@buildbase/sdk')>()),
  parseWebhookEvent: () => db.event,
}));
vi.mock('@/lib/db', () => {
  const step = (name: string) => (args: unknown) => {
    db.calls.push(name);
    return { name, args };
  };
  return {
    prisma: {
      user: { findUnique: db.findUnique, deleteMany: step('user.deleteMany') },
      userWorkspace: { deleteMany: step('userWorkspace.deleteMany') },
      appEvent: { deleteMany: step('appEvent.deleteMany') },
      auditLog: {
        updateMany: step('auditLog.updateMany'),
        create: db.auditCreate,
      },
      webhookEvent: { upsert: db.upsert },
      $transaction: db.transaction,
    },
    setAuditContext: vi.fn(),
  };
});

afterEach(() => {
  db.calls.length = 0;
  db.transaction.mockClear();
  db.findUnique.mockImplementation(async () => ({ id: 'u1' }));
  db.session = { userId: 'u1' };
  db.event = null;
  delete process.env.BUILDBASE_WEBHOOK_SECRET;
});

describe('eraseLocalUser', () => {
  it('removes the profile, memberships and events and clears audit rows', async () => {
    const { eraseLocalUser } = await import('@/lib/account-erase');
    await expect(eraseLocalUser('u1')).resolves.toBe(true);
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(db.calls).toEqual([
      'userWorkspace.deleteMany',
      'appEvent.deleteMany',
      'auditLog.updateMany',
      'user.deleteMany',
    ]);
  });

  it('runs again without failing when the person is already gone', async () => {
    db.findUnique.mockImplementation(async () => null);
    const { eraseLocalUser } = await import('@/lib/account-erase');
    await expect(eraseLocalUser('u1')).resolves.toBe(false);
  });
});

describe('DELETE /api/user/delete', () => {
  const del = () =>
    new NextRequest('https://renderweld.test/api/user/delete', {
      method: 'DELETE',
    });

  it('says the account stays and what is kept, not that everything is gone', async () => {
    const { DELETE } = await import('@/app/api/user/delete/route');
    const res = await DELETE(del());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { message: string };
    expect(body.message).not.toMatch(/all personal data/i);
    expect(body.message).toMatch(/BuildBase account/);
    expect(body.message).toMatch(/tax law/);
  });

  it('answers 404 when the store holds no copy', async () => {
    db.findUnique.mockImplementation(async () => null);
    const { DELETE } = await import('@/app/api/user/delete/route');
    expect((await DELETE(del())).status).toBe(404);
  });
});

describe('BuildBase user.deleted webhook', () => {
  const delivery = () =>
    new NextRequest('https://renderweld.test/api/webhooks/buildbase', {
      method: 'POST',
      body: JSON.stringify({ any: 'body' }),
    });

  it('erases the store copy of the deleted person', async () => {
    process.env.BUILDBASE_WEBHOOK_SECRET = 'test-only';
    db.event = {
      event: 'user.deleted',
      timestamp: Date.now(),
      data: { userId: 'u1' },
    };
    const { POST } = await import('@/app/api/webhooks/buildbase/route');
    const res = await POST(delivery());
    expect(res.status).toBe(200);
    expect(db.calls).toContain('user.deleteMany');
  });

  it('answers 500 so BuildBase retries when the erase fails', async () => {
    process.env.BUILDBASE_WEBHOOK_SECRET = 'test-only';
    db.event = {
      event: 'user.deleted',
      timestamp: Date.now(),
      data: { userId: 'u1' },
    };
    db.transaction.mockImplementationOnce(async () => {
      throw new Error('d1 down');
    });
    const { POST } = await import('@/app/api/webhooks/buildbase/route');
    expect((await POST(delivery())).status).toBe(500);
  });

  it('leaves other events alone', async () => {
    process.env.BUILDBASE_WEBHOOK_SECRET = 'test-only';
    db.event = {
      event: 'user.updated',
      timestamp: Date.now(),
      data: { userId: 'u1' },
    };
    const { POST } = await import('@/app/api/webhooks/buildbase/route');
    await POST(delivery());
    expect(db.calls).toEqual([]);
  });
});

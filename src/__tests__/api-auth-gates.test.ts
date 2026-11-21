// @vitest-environment node
import { existsSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Every /api route that acts for a person must refuse a caller with no
 * session cookie and no bearer token, before it touches the database or
 * the platform. `next/headers` is replaced with an empty request (no
 * cookies, no headers), the database with one that fails the test if it is
 * reached, and `fetch` with one that fails the test if the route calls out.
 */

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => undefined,
    getAll: () => [],
    has: () => false,
  }),
  headers: async () => new Headers(),
}));
vi.mock('@/lib/db', () => {
  const fail = () => {
    throw new Error('database reached without a session');
  };
  return {
    prisma: new Proxy({}, { get: fail }),
    setAuditContext: () => {},
  };
});

const BASE = 'http://localhost:3000';

function request(
  pathname: string,
  init?: { method?: string; body?: unknown }
): NextRequest {
  return new NextRequest(new URL(pathname, BASE), {
    method: init?.method ?? 'GET',
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
}

beforeAll(() => {
  process.env.SKIP_ENV_VALIDATION = 'true';
  process.env.SYSTEM_SECRET = 'test-only-not-a-secret-0123456789abcdef';
  process.env.NEXT_PUBLIC_BUILDBASE_SERVER_URL = 'https://api.example.test';
  process.env.NEXT_PUBLIC_BUILDBASE_ORG_ID = '000000000000000000000000';
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: unknown) => {
      throw new Error(`unexpected network call to ${String(input)}`);
    })
  );
});

describe('API routes refuse callers without a session', () => {
  it('POST /api/auth/workspace-token', async () => {
    const { POST } = await import('@/app/api/auth/workspace-token/route');
    const res = await POST(
      request('/api/auth/workspace-token', {
        method: 'POST',
        body: { workspaceId: 'ws_1' },
      })
    );
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/oauth2-profile', async () => {
    const { GET } = await import('@/app/api/auth/oauth2-profile/route');
    const res = await GET(request('/api/auth/oauth2-profile'));
    expect(res.status).toBe(401);
  });

  it('GET /api/notifications/preferences', async () => {
    const { GET } = await import('@/app/api/notifications/preferences/route');
    const res = await GET(
      request('/api/notifications/preferences?workspaceId=ws_1')
    );
    expect(res.status).toBe(401);
  });

  it('PATCH /api/notifications/preferences', async () => {
    const { PATCH } = await import('@/app/api/notifications/preferences/route');
    const res = await PATCH(
      request('/api/notifications/preferences', {
        method: 'PATCH',
        body: { workspaceId: 'ws_1', preferences: { x: { email: false } } },
      })
    );
    expect(res.status).toBe(401);
  });

  it('GET /api/user/export', async () => {
    const { GET } = await import('@/app/api/user/export/route');
    const res = await GET(request('/api/user/export'));
    expect(res.status).toBe(401);
  });

  it('DELETE /api/user/delete', async () => {
    const { DELETE } = await import('@/app/api/user/delete/route');
    const res = await DELETE(
      request('/api/user/delete', {
        method: 'DELETE',
        body: { confirmation: 'DELETE' },
      })
    );
    expect(res.status).toBe(401);
  });

  it('POST /api/events', async () => {
    const { POST } = await import('@/app/api/events/route');
    const res = await POST(
      request('/api/events', {
        method: 'POST',
        body: { eventType: 'user:updated', data: {} },
      })
    );
    expect(res.status).toBe(401);
  });
});

describe('removed org-token demo routes stay removed', () => {
  // These acted with the organization API token for any signed-in person
  // (buildbase-app/reelforge-studio#4). Bringing one back needs an
  // org-admin check on the server first.
  const removed = [
    'src/app/api/assets',
    'src/app/api/forms',
    'src/app/api/audience',
    'src/app/api/notifications/test',
    'src/app/api/webhooks/list',
    'src/app/api/modules-shared.ts',
  ];
  it.each(removed)('%s does not exist', (p) => {
    expect(existsSync(path.resolve(__dirname, '../..', p))).toBe(false);
  });
});

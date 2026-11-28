// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * A signed-out browser reports a sign-in that did not start; the events
 * route logs the failure kind and error name only, without a session and
 * without touching the database (studio issue #595).
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
    throw new Error('database reached for a sign-in failure report');
  };
  return {
    prisma: new Proxy({}, { get: fail }),
    setAuditContext: () => {},
  };
});
const warn = vi.fn();
vi.mock('@/lib/logger', () => ({
  logger: { warn, info: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

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

async function post(data: unknown) {
  const { POST } = await import('@/app/api/events/route');
  return POST(
    new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventType: 'client:sign-in-failed', data }),
    })
  );
}

describe('POST /api/events client:sign-in-failed', () => {
  it('logs the kind and error name without a session', async () => {
    warn.mockClear();
    const res = await post({ kind: 'error', errorName: 'TypeError' });
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledWith('Sign-in did not start', {
      kind: 'error',
      errorName: 'TypeError',
    });
  });

  it('keeps free text out of the logs', async () => {
    warn.mockClear();
    const res = await post({
      kind: 'anything <script>',
      errorName: 'a name with spaces and a\nnewline',
      email: 'someone@example.test',
    });
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledWith('Sign-in did not start', {
      kind: 'unknown',
      errorName: undefined,
    });
  });
});

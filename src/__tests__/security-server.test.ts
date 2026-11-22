// @vitest-environment node
import { createHmac } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { clientIp } from '@/lib/security/client-ip';

/**
 * Provisioning hook secret and replay window, token audience, audit IP, and
 * the sign-in routes (private security review SEC-13, SEC-14, SEC-16,
 * SEC-19).
 */

const SITE = 'https://reelforge.example';
const SYSTEM_SECRET = 'test-only-not-a-secret-0123456789abcdef';
const PROVISION_SECRET = 'provision-test-secret-0123456789abcdefghij';
const WEBHOOK_SECRET = 'webhook-test-secret-0123456789abcdefghijkl';

const upsert = vi.fn(async () => ({ id: 'row' }));

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined }),
  headers: async () => new Headers(),
}));
vi.mock('@/lib/db', () => ({
  prisma: {
    webhookEvent: { upsert },
    user: { upsert: async () => ({}) },
  },
  setAuditContext: vi.fn(),
}));

beforeAll(() => {
  process.env.SKIP_ENV_VALIDATION = 'true';
  process.env.SYSTEM_SECRET = SYSTEM_SECRET;
  process.env.SITE_URL = SITE;
  process.env.BUILDBASE_CLIENT_SECRET = 'client-secret-for-tests';
  process.env.NEXT_PUBLIC_BUILDBASE_SERVER_URL = 'https://api.example.test';
  process.env.NEXT_PUBLIC_BUILDBASE_ORG_ID = '000000000000000000000000';
  process.env.NEXT_PUBLIC_BUILDBASE_CLIENT_ID = 'client-id';
  process.env.BUILDBASE_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

afterEach(() => {
  vi.unstubAllGlobals();
  upsert.mockClear();
});

describe('clientIp', () => {
  it('trusts only CF-Connecting-IP', () => {
    expect(
      clientIp(
        new Headers({
          'cf-connecting-ip': '203.0.113.7',
          'x-forwarded-for': '198.51.100.1',
        })
      )
    ).toBe('203.0.113.7');
    expect(
      clientIp(
        new Headers({
          'x-forwarded-for': '198.51.100.1',
          'x-real-ip': '198.51.100.2',
        })
      )
    ).toBeUndefined();
  });
});

describe('/api/buildbase/provision', () => {
  const body = JSON.stringify({ userId: 'u1', workspaceId: 'w1' });

  function call(headers: Record<string, string>) {
    return new NextRequest(new URL('/api/buildbase/provision', SITE), {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body,
    });
  }

  function sign(ts: number, secret = PROVISION_SECRET, payload = body) {
    return (
      'sha256=' +
      createHmac('sha256', secret).update(`${ts}.${payload}`).digest('hex')
    );
  }

  async function post(headers: Record<string, string>) {
    const { POST } = await import('@/app/api/buildbase/provision/route');
    return POST(call(headers));
  }

  it('answers 503 until its own secret is set', async () => {
    delete process.env.BUILDBASE_PROVISION_SECRET;
    const res = await post({ 'x-provision-secret': PROVISION_SECRET });
    expect(res.status).toBe(503);
    expect(upsert).not.toHaveBeenCalled();
  });

  describe('with BUILDBASE_PROVISION_SECRET', () => {
    beforeAll(() => {
      process.env.BUILDBASE_PROVISION_SECRET = PROVISION_SECRET;
    });

    it('accepts the secret header', async () => {
      const res = await post({ 'x-provision-secret': PROVISION_SECRET });
      expect(res.status).toBe(200);
      expect(upsert).toHaveBeenCalledOnce();
    });

    it('refuses the webhook signing key, a wrong or missing secret', async () => {
      for (const headers of <Record<string, string>[]>[
        { 'x-provision-secret': WEBHOOK_SECRET },
        { 'x-webhook-secret': WEBHOOK_SECRET },
        { 'x-provision-secret': PROVISION_SECRET.slice(0, -1) },
        {},
      ]) {
        const res = await post(headers);
        expect(res.status).toBe(401);
      }
      expect(upsert).not.toHaveBeenCalled();
    });

    it('accepts a fresh signature', async () => {
      const ts = Math.floor(Date.now() / 1000);
      const res = await post({
        'x-provision-timestamp': String(ts),
        'x-provision-signature': sign(ts),
      });
      expect(res.status).toBe(200);
    });

    it('refuses an old, wrong or other-body signature', async () => {
      const now = Math.floor(Date.now() / 1000);
      const old = now - 600;
      for (const headers of <Record<string, string>[]>[
        // Replayed after the five-minute window.
        {
          'x-provision-timestamp': String(old),
          'x-provision-signature': sign(old),
        },
        // Signed with the webhook key.
        {
          'x-provision-timestamp': String(now),
          'x-provision-signature': sign(now, WEBHOOK_SECRET),
        },
        // Signature of another body.
        {
          'x-provision-timestamp': String(now),
          'x-provision-signature': sign(now, PROVISION_SECRET, '{}'),
        },
        // A signature does not fall back to the header secret.
        {
          'x-provision-timestamp': String(old),
          'x-provision-signature': sign(old),
          'x-provision-secret': PROVISION_SECRET,
        },
      ]) {
        const res = await post(headers);
        expect(res.status).toBe(401);
      }
      expect(upsert).not.toHaveBeenCalled();
    });
  });
});

describe('token audience', () => {
  function mint(claims: Record<string, unknown>) {
    return jwt.sign({ userId: 'u1', ...claims }, SYSTEM_SECRET, {
      algorithm: 'HS256',
      expiresIn: 600,
    });
  }

  it('accepts agent tokens for this site only, and web tokens nowhere', async () => {
    const { AGENT_TOKEN_AUDIENCES, createAuthToken, verifyAuthToken } =
      await import('@/lib/auth');
    expect(
      verifyAuthToken(mint({ aud: `${SITE}/mcp` }), AGENT_TOKEN_AUDIENCES)
    ).not.toBeNull();
    expect(
      verifyAuthToken(mint({ aud: `${SITE}/api/mcp` }), AGENT_TOKEN_AUDIENCES)
    ).not.toBeNull();
    // Wrong audience, no audience, the web audience.
    for (const token of [
      mint({ aud: 'https://other.example/mcp' }),
      mint({}),
      createAuthToken({ userId: 'u1' }),
    ]) {
      expect(verifyAuthToken(token, AGENT_TOKEN_AUDIENCES)).toBeNull();
    }
  });

  it('web tokens are short-lived and audience-bound', async () => {
    const { WEB_TOKEN_AUDIENCE, createAuthToken, verifyAuthToken } =
      await import('@/lib/auth');
    const token = createAuthToken({ userId: 'u1' });
    const verified = verifyAuthToken(token, [WEB_TOKEN_AUDIENCE]);
    expect(verified?.aud).toBe(WEB_TOKEN_AUDIENCE);
    expect(verified!.exp - verified!.iat).toBeLessThanOrEqual(15 * 60);
  });

  it('oauth2-profile refuses a token minted for another audience', async () => {
    const { GET } = await import('@/app/api/auth/oauth2-profile/route');
    const res = await GET(
      new NextRequest(new URL('/api/auth/oauth2-profile', SITE), {
        headers: {
          authorization: `Bearer ${mint({ aud: 'https://other.example/mcp' })}`,
        },
      })
    );
    expect(res.status).toBe(401);
  });
});

describe('/api/auth/token', () => {
  function signIn(
    headers: Record<string, string>,
    body = '{"code":"AAAAAAAAAAAAAAAAAAAAAAAA"}'
  ) {
    return new NextRequest(new URL('/api/auth/token', SITE), {
      method: 'POST',
      headers,
      body,
    });
  }

  it('refuses a cross-site or non-JSON POST before calling BuildBase', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const { POST } = await import('@/app/api/auth/token/route');
    const plain = await POST(
      signIn({ 'content-type': 'text/plain', origin: SITE })
    );
    expect(plain.status).toBe(415);
    const foreign = await POST(
      signIn({
        'content-type': 'application/json',
        origin: 'https://other.example',
      })
    );
    expect(foreign.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('answers only what the SDK needs: no app token, no user record', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          data: {
            sessionId: 'sess-1',
            user: { id: 'u1', email: 'a@example.com', name: 'A' },
          },
        })
      )
    );
    const { POST } = await import('@/app/api/auth/token/route');
    const res = await POST(
      signIn({ 'content-type': 'application/json', origin: SITE })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Object.keys(data).sort()).toEqual([
      'message',
      'sessionId',
      'success',
    ]);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const cookie = res.headers.get('set-cookie') ?? '';
    expect(cookie).toContain('bb-session-id=sess-1');
    expect(cookie.toLowerCase()).toContain('httponly');
  });
});

describe('/api/auth/session and /api/auth/signout', () => {
  it('session: same-origin only, never cached', async () => {
    const { GET } = await import('@/app/api/auth/session/route');
    const cross = await GET(
      new NextRequest(new URL('/api/auth/session', SITE), {
        headers: { 'sec-fetch-site': 'cross-site', cookie: 'bb-session-id=s' },
      })
    );
    expect(cross.status).toBe(403);
    expect(await cross.json()).toEqual({ sessionId: null });
    const same = await GET(
      new NextRequest(new URL('/api/auth/session', SITE), {
        headers: { 'sec-fetch-site': 'same-origin', cookie: 'bb-session-id=s' },
      })
    );
    expect(await same.json()).toEqual({ sessionId: 's' });
    expect(same.headers.get('cache-control')).toBe('no-store');
  });

  it('signout refuses a cross-site POST', async () => {
    const { POST } = await import('@/app/api/auth/signout/route');
    const res = await POST(
      new NextRequest(new URL('/api/auth/signout', SITE), {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: '{}',
      })
    );
    expect(res.status).toBe(415);
    const ok = await POST(
      new NextRequest(new URL('/api/auth/signout', SITE), {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: SITE },
        body: '{}',
      })
    );
    expect(ok.status).toBe(200);
  });
});

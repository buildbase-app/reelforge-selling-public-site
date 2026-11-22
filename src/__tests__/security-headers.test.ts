// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import {
  API_CSP,
  apiSecurityHeaders,
  createNonce,
  mediaOrigin,
  pageCsp,
  pageScope,
} from '@/lib/security/csp';
import { refuseCrossSiteRequest } from '@/lib/security/request-guard';
import { proxy } from '@/proxy';

/**
 * Content Security Policy, security headers and the same-origin guard
 * (private security review SEC-12, SEC-14, SEC-15).
 */

const SITE = 'https://reelforge.example';
const BB = 'https://api.example.test';

function directive(csp: string, name: string): string {
  return (
    csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d === name || d.startsWith(`${name} `)) ?? ''
  );
}

describe('pageScope', () => {
  it.each([
    ['/', 'public'],
    ['/pricing', 'public'],
    ['/docs/install', 'public'],
    ['/licence', 'public'],
    ['/order', 'private'],
    ['/order/', 'private'],
    ['/en/order', 'private'],
    ['/dashboard', 'private'],
    ['/dashboard/licences', 'private'],
    ['/de/dashboard/licences', 'private'],
    ['/orders-faq', 'public'],
    ['/dashboards', 'public'],
  ])('%s is %s', (path, scope) => {
    expect(pageScope(path)).toBe(scope);
  });
});

describe('createNonce', () => {
  it('is unique and 128 bits of base64', () => {
    const nonces = new Set(Array.from({ length: 1000 }, () => createNonce()));
    expect(nonces.size).toBe(1000);
    for (const n of nonces) expect(n).toMatch(/^[A-Za-z0-9+/]{22}==$/);
  });
});

describe('pageCsp (production)', () => {
  const nonce = 'TESTNONCE0000000000000==';
  const pub = pageCsp({ nonce, scope: 'public', buildbaseServerUrl: BB });
  const priv = pageCsp({ nonce, scope: 'private', buildbaseServerUrl: BB });

  it('allows scripts by nonce only, with strict-dynamic', () => {
    for (const csp of [pub, priv]) {
      const scripts = directive(csp, 'script-src');
      expect(scripts).toContain(`'nonce-${nonce}'`);
      expect(scripts).toContain("'strict-dynamic'");
      expect(scripts).not.toContain('unsafe-inline');
      expect(scripts).not.toContain('unsafe-eval');
    }
  });

  it('keeps third-party scripts and their hosts off private pages', () => {
    expect(directive(pub, 'script-src')).toContain(
      'https://www.ship-or-die.com'
    );
    expect(priv).not.toContain('ship-or-die');
    expect(priv).not.toContain('cloudflareinsights');
  });

  it('lists exact origins in connect-src', () => {
    for (const csp of [pub, priv]) {
      const connect = directive(csp, 'connect-src').split(' ');
      expect(connect).toContain("'self'");
      expect(connect).toContain(BB);
      expect(connect).toContain('wss://api.example.test');
      expect(connect).not.toContain('https:');
    }
    expect(directive(priv, 'connect-src')).toBe(
      `connect-src 'self' ${BB} wss://api.example.test`
    );
  });

  it('sets the locked-down directives', () => {
    for (const csp of [pub, priv]) {
      expect(directive(csp, 'object-src')).toBe("object-src 'none'");
      expect(directive(csp, 'base-uri')).toBe("base-uri 'self'");
      expect(directive(csp, 'frame-ancestors')).toBe("frame-ancestors 'none'");
      expect(directive(csp, 'form-action')).toBe("form-action 'self'");
      expect(directive(csp, 'frame-src')).toBe("frame-src 'self'");
      expect(directive(csp, 'media-src')).toContain(
        'https://media.reelforge.buildbase.app'
      );
      expect(directive(csp, 'img-src')).not.toBe('');
      expect(directive(csp, 'upgrade-insecure-requests')).not.toBe('');
    }
  });

  it('development adds eval for React tooling and no https upgrade', () => {
    const dev = pageCsp({ nonce, scope: 'public', dev: true });
    expect(directive(dev, 'script-src')).toContain("'unsafe-eval'");
    expect(directive(dev, 'script-src')).not.toContain('unsafe-inline');
    expect(dev).not.toContain('upgrade-insecure-requests');
  });
});

describe('gallery media origin', () => {
  it('uses the R2 custom domain by default', () => {
    expect(mediaOrigin(undefined)).toBe(
      'https://media.reelforge.buildbase.app'
    );
  });

  it("uses only GALLERY_MEDIA_URL's origin", () => {
    expect(mediaOrigin('https://cdn.example.com/reels/x.json?y=1')).toBe(
      'https://cdn.example.com'
    );
  });

  it('falls back for invalid or non-http values', () => {
    expect(mediaOrigin('not a url')).toBe(
      'https://media.reelforge.buildbase.app'
    );
    expect(mediaOrigin('javascript:alert(1)')).toBe(
      'https://media.reelforge.buildbase.app'
    );
    expect(mediaOrigin('https://a.example.com; script-src *')).not.toContain(
      ';'
    );
  });

  it('puts the configured origin in media-src', () => {
    const csp = pageCsp({
      nonce: 'N',
      scope: 'public',
      galleryMediaUrl: 'http://localhost:9000/gallery',
    });
    expect(directive(csp, 'media-src')).toBe(
      "media-src 'self' blob: http://localhost:9000"
    );
  });
});

describe('apiSecurityHeaders', () => {
  it('locks API responses down and never caches personal data', () => {
    const h = apiSecurityHeaders('/api/auth/session');
    expect(h['Content-Security-Policy']).toBe(API_CSP);
    expect(h['X-Content-Type-Options']).toBe('nosniff');
    expect(h['Referrer-Policy']).toBe('no-referrer');
    expect(h['Strict-Transport-Security']).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
    expect(h['Cache-Control']).toBe('no-store');
    expect(apiSecurityHeaders('/api/health')['Cache-Control']).toBeUndefined();
  });
});

function req(
  path: string,
  init: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): NextRequest {
  return new NextRequest(new URL(path, SITE), {
    method: init.method ?? 'GET',
    headers: init.headers,
    body: init.body,
  });
}

describe('refuseCrossSiteRequest', () => {
  const json = { 'content-type': 'application/json' };

  it('lets safe methods through', () => {
    expect(refuseCrossSiteRequest(req('/api/auth/session'))).toBeNull();
  });

  it('refuses a form-shaped text/plain POST', () => {
    const res = refuseCrossSiteRequest(
      req('/api/auth/token', {
        method: 'POST',
        headers: { 'content-type': 'text/plain', origin: SITE },
        body: '{}',
      })
    );
    expect(res?.status).toBe(415);
  });

  it('refuses a POST from another origin', () => {
    const res = refuseCrossSiteRequest(
      req('/api/auth/token', {
        method: 'POST',
        headers: { ...json, origin: 'https://other.example' },
        body: '{}',
      })
    );
    expect(res?.status).toBe(403);
  });

  it('refuses a sibling subdomain (same-site, not same-origin)', () => {
    const res = refuseCrossSiteRequest(
      req('/api/events', {
        method: 'POST',
        headers: { ...json, 'sec-fetch-site': 'same-site' },
        body: '{}',
      })
    );
    expect(res?.status).toBe(403);
  });

  it('refuses an opaque origin and a cross-site DELETE', () => {
    expect(
      refuseCrossSiteRequest(
        req('/api/auth/signout', {
          method: 'POST',
          headers: { ...json, origin: 'null' },
          body: '{}',
        })
      )?.status
    ).toBe(403);
    expect(
      refuseCrossSiteRequest(
        req('/api/user/delete', {
          method: 'DELETE',
          headers: { origin: 'https://other.example' },
        })
      )?.status
    ).toBe(403);
  });

  it('lets a same-origin JSON request through', () => {
    expect(
      refuseCrossSiteRequest(
        req('/api/notifications/preferences', {
          method: 'PATCH',
          headers: { ...json, origin: SITE, 'sec-fetch-site': 'same-origin' },
          body: '{}',
        })
      )
    ).toBeNull();
  });

  it('leaves server-to-server routes to their own authentication', () => {
    for (const path of [
      '/api/webhooks/buildbase',
      '/api/buildbase/provision',
      '/api/auth/oauth2-token',
      '/api/mcp',
    ]) {
      expect(
        refuseCrossSiteRequest(
          req(path, {
            method: 'POST',
            headers: { 'content-type': 'text/plain' },
            body: 'x',
          })
        )
      ).toBeNull();
    }
  });
});

describe('proxy', () => {
  function nonceOf(res: Response): string {
    const csp = res.headers.get('content-security-policy') ?? '';
    return /'nonce-([^']+)'/.exec(csp)?.[1] ?? '';
  }

  it('sends a fresh nonce on every page and forwards it to rendering', () => {
    const a = proxy(req('/'));
    const b = proxy(req('/'));
    expect(nonceOf(a)).not.toBe('');
    expect(nonceOf(a)).not.toBe(nonceOf(b));
    // Request headers forwarded by the locale middleware to the page.
    expect(a.headers.get('x-middleware-request-x-nonce')).toBe(nonceOf(a));
    expect(a.headers.get('x-middleware-request-x-page-scope')).toBe('public');
    expect(a.headers.get('x-middleware-request-content-security-policy')).toBe(
      a.headers.get('content-security-policy')
    );
    expect(
      directive(a.headers.get('content-security-policy') ?? '', 'script-src')
    ).not.toContain('unsafe-inline');
  });

  it('overwrites a client-sent nonce or scope', () => {
    const res = proxy(
      req('/order', {
        headers: { 'x-nonce': 'evil', 'x-page-scope': 'public' },
      })
    );
    expect(res.headers.get('x-middleware-request-x-nonce')).not.toBe('evil');
    expect(res.headers.get('x-middleware-request-x-page-scope')).toBe(
      'private'
    );
  });

  it('gives order and account pages the private policy', () => {
    for (const path of ['/order', '/dashboard/licences']) {
      const res = proxy(req(path));
      const csp = res.headers.get('content-security-policy') ?? '';
      expect(csp).not.toContain('ship-or-die');
      expect(res.headers.get('referrer-policy')).toBe('no-referrer');
      expect(res.headers.get('strict-transport-security')).toContain(
        'max-age=63072000'
      );
    }
  });

  it('puts security headers on /api responses', () => {
    const res = proxy(req('/api/health'));
    expect(res.headers.get('content-security-policy')).toBe(API_CSP);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('strict-transport-security')).toContain(
      'includeSubDomains'
    );
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('refuses a cross-site sign-in POST before it reaches the route', () => {
    const res = proxy(
      req('/api/auth/token', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
          origin: 'https://other.example',
        },
        body: '{"code":"x"}',
      })
    );
    expect(res.status).toBe(415);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });
});

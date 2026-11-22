/**
 * Content Security Policy and the other security headers, built per request
 * by the proxy (src/proxy.ts). Hardening from a private security review
 * (SEC-12, SEC-15).
 *
 * Scripts are allowed by a per-request nonce with 'strict-dynamic': Next.js
 * reads the nonce from the request's CSP header while it renders and puts it
 * on its own scripts, and a script that carries it may load the scripts it
 * needs (the BuildBase SDK's consented tracking tags). Host names in
 * script-src are only a fallback for browsers without CSP level 3.
 *
 * Every page is rendered per request already (the site sends no-store on
 * HTML), so a nonce costs no caching.
 */

/** Pages that show licence keys, order tokens or account data. */
const PRIVATE_PREFIXES = ['/order', '/dashboard'] as const;

/** Third-party scripts allowed on public pages only. */
const PUBLIC_SCRIPT_HOSTS = [
  // The Ship or Die hackathon's traffic verification script.
  'https://www.ship-or-die.com',
  // Cloudflare Web Analytics, which the zone can inject.
  'https://static.cloudflareinsights.com',
] as const;

/** Where those scripts report to. */
const PUBLIC_CONNECT_HOSTS = [
  'https://www.ship-or-die.com',
  'https://cloudflareinsights.com',
] as const;

/** Reels and posters (the R2 bucket). */
const MEDIA_HOST = 'https://media.reelforge.buildbase.app';

export type PageScope = 'public' | 'private';

/** Whether a page path (with or without a locale prefix) is private. */
export function pageScope(pathname: string): PageScope {
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  return PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
    ? 'private'
    : 'public';
}

/** A fresh, unguessable nonce (128 bits, base64). */
export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/**
 * The BuildBase server the browser talks to: its origin for fetch and the
 * matching ws:/wss: origin for the notification inbox's live connection.
 */
export function buildbaseOrigins(serverUrl: string | undefined): string[] {
  if (!serverUrl) return [];
  try {
    const url = new URL(serverUrl);
    const socket = `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}`;
    return [url.origin, socket];
  } catch {
    return [];
  }
}

export interface PageCspOptions {
  nonce: string;
  scope: PageScope;
  /** `next dev`: React's dev tooling needs eval, and there is no HTTPS. */
  dev?: boolean;
  /** NEXT_PUBLIC_BUILDBASE_SERVER_URL. */
  buildbaseServerUrl?: string;
}

/** The Content-Security-Policy for an HTML page. */
export function pageCsp({
  nonce,
  scope,
  dev = false,
  buildbaseServerUrl,
}: PageCspOptions): string {
  const isPublic = scope === 'public';
  const bb = buildbaseOrigins(buildbaseServerUrl);
  const directives: string[] = [
    "default-src 'self'",
    [
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      ...(isPublic ? PUBLIC_SCRIPT_HOSTS : []),
      ...(dev ? ["'unsafe-eval'"] : []),
    ].join(' '),
    // Inline style attributes (Radix, sonner, next-themes) need this; styles
    // cannot run code.
    "style-src 'self' 'unsafe-inline'",
    // Avatars and console images come from several https hosts.
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `media-src 'self' blob: ${MEDIA_HOST}`,
    ["connect-src 'self'", ...bb, ...(isPublic ? PUBLIC_CONNECT_HOSTS : [])]
      .join(' ')
      .trim(),
    "frame-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Not in development: it would turn http://localhost calls into https.
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ];
  return directives.join('; ');
}

/** The policy for API responses: they render nothing and load nothing. */
export const API_CSP =
  "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

/**
 * Headers every response gets, pages and /api alike. HSTS is also set at the
 * Cloudflare zone, which takes precedence there.
 */
export function baseSecurityHeaders(scope: PageScope): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    // Private pages carry an order token in the address: send no referrer.
    'Referrer-Policy':
      scope === 'private' ? 'no-referrer' : 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  };
}

/** API routes that return personal data: never cached. */
const NO_STORE_API_PREFIXES = [
  '/api/auth/',
  '/api/user/',
  '/api/notifications/',
  '/api/events',
  '/api/mcp',
] as const;

/** Security headers for an /api response. */
export function apiSecurityHeaders(pathname: string): Record<string, string> {
  return {
    ...baseSecurityHeaders('private'),
    'Content-Security-Policy': API_CSP,
    ...(NO_STORE_API_PREFIXES.some((p) => pathname.startsWith(p))
      ? { 'Cache-Control': 'no-store' }
      : {}),
  };
}

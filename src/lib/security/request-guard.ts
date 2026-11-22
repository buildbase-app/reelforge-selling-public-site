import { refuseCrossSiteAuthPost } from '@buildbase/sdk';

/**
 * Same-origin JSON only for state-changing /api routes the browser calls.
 * Hardening from a private security review (SEC-14).
 *
 * Built on the SDK's `refuseCrossSiteAuthPost` (415 unless
 * `Content-Type: application/json`, 403 for a foreign or opaque `Origin`),
 * plus a `Sec-Fetch-Site` check for browsers that send it.
 */

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Server-to-server routes: called by BuildBase or by agents, never by the
 * site's own pages, and authenticated by a signature, a shared secret or a
 * bearer token instead of the session cookie.
 */
const SERVER_TO_SERVER_PREFIXES = [
  '/api/webhooks/',
  '/api/buildbase/provision',
  '/api/auth/oauth2-token',
  '/api/auth/oauth2-revoke',
  '/api/mcp',
] as const;

function refuse(status: number, error: string): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export function isServerToServerRoute(pathname: string): boolean {
  return SERVER_TO_SERVER_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`)
  );
}

/**
 * The refusal for a state-changing request another site could have sent, or
 * null when it may go ahead. Safe methods and server-to-server routes pass.
 */
export function refuseCrossSiteRequest(request: Request): Response | null {
  if (!UNSAFE_METHODS.has(request.method.toUpperCase())) return null;
  const { pathname } = new URL(request.url);
  if (isServerToServerRoute(pathname)) return null;

  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return refuse(403, 'Cross-origin request refused');
  }

  // A DELETE cannot be sent cross-site without a CORS preflight, and has no
  // body to type: the Origin check is enough.
  if (request.method.toUpperCase() === 'DELETE') {
    const origin = request.headers.get('origin');
    if (origin === 'null') return refuse(403, 'Cross-origin request refused');
    if (origin) {
      try {
        if (new URL(origin).hostname !== new URL(request.url).hostname) {
          return refuse(403, 'Cross-origin request refused');
        }
      } catch {
        return refuse(403, 'Cross-origin request refused');
      }
    }
    return null;
  }

  return refuseCrossSiteAuthPost(request);
}

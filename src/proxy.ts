import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import {
  apiSecurityHeaders,
  baseSecurityHeaders,
  createNonce,
  pageCsp,
  pageScope,
} from './lib/security/csp';
import { refuseCrossSiteRequest } from './lib/security/request-guard';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Canonical host for the production site. Set via CANONICAL_HOST env var.
 * When set, requests to `www.{host}` are 301-redirected to the apex
 * domain so search engines consolidate around a single canonical URL.
 */
const CANONICAL_HOST = process.env.CANONICAL_HOST;

function withHeaders<T extends Response>(
  response: T,
  headers: Record<string, string>
): T {
  for (const [name, value] of Object.entries(headers)) {
    response.headers.set(name, value);
  }
  return response;
}

export function proxy(request: NextRequest): Response {
  const { pathname } = request.nextUrl;

  // --- Canonical host redirect (www → apex) ---
  if (CANONICAL_HOST) {
    const host = request.headers.get('host') ?? '';
    if (host === `www.${CANONICAL_HOST}`) {
      const url = request.nextUrl.clone();
      url.host = CANONICAL_HOST;
      return NextResponse.redirect(url, 301);
    }
  }

  // --- Docs Markdown twins ---
  // `/docs.md` and `/docs/<path>.md` (and `Accept: text/markdown` on a docs
  // page) are answered by /api/content/docs, from BuildBase Docs.
  const docsTwin = pathname.match(
    /^\/docs(?:\/((?:[a-z0-9-]+\/)*[a-z0-9-]+))?\.md$/
  );
  const docsPage = pathname.match(
    /^\/docs(?:\/((?:[a-z0-9-]+\/)*[a-z0-9-]+))?\/?$/
  );
  const wantsMd = (request.headers.get('accept') ?? '').includes(
    'text/markdown'
  );
  if (docsTwin || (docsPage && wantsMd)) {
    const rest = (docsTwin ?? docsPage)![1];
    const url = request.nextUrl.clone();
    url.pathname = rest ? `/api/content/docs/${rest}` : '/api/content/docs';
    return withHeaders(
      NextResponse.rewrite(url),
      apiSecurityHeaders(url.pathname)
    );
  }

  // --- Markdown content negotiation ---
  // When an agent requests Accept: text/markdown on a content page,
  // rewrite to the /api/content/ endpoint which returns raw markdown.
  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('text/markdown')) {
    const blogMatch = pathname.match(/^(?:\/[a-z]{2})?\/blog\/([^/]+)$/);
    const changelogMatch = pathname.match(
      /^(?:\/[a-z]{2})?\/changelog\/([^/]+)$/
    );
    if (blogMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/api/content/blog/${blogMatch[1]}`;
      return withHeaders(
        NextResponse.rewrite(url),
        apiSecurityHeaders(url.pathname)
      );
    }
    if (changelogMatch) {
      const url = request.nextUrl.clone();
      url.pathname = `/api/content/changelog/${changelogMatch[1]}`;
      return withHeaders(
        NextResponse.rewrite(url),
        apiSecurityHeaders(url.pathname)
      );
    }
  }

  // --- API routes ---
  if (pathname.startsWith('/api/')) {
    // State-changing calls from the browser: same-origin JSON only.
    const refused = refuseCrossSiteRequest(request);
    if (refused) return withHeaders(refused, apiSecurityHeaders(pathname));
    const response = NextResponse.next();
    // Belt-and-braces: robots.txt already disallows /api/, but this
    // header prevents accidental indexing if a crawler ignores robots.txt.
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return withHeaders(response, apiSecurityHeaders(pathname));
  }

  // --- Propagate request-id for observability ---
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();

  // --- Content Security Policy with a per-request nonce ---
  // Next.js reads the nonce from the request's CSP header while rendering
  // and puts it on its scripts; layouts read `x-nonce` for their own, and
  // `x-page-scope` to leave third-party scripts off private pages. Both are
  // always overwritten here, so a client cannot set them.
  const scope = pageScope(pathname);
  const nonce = createNonce();
  const csp = pageCsp({
    nonce,
    scope,
    dev: process.env.NODE_ENV !== 'production',
    buildbaseServerUrl: process.env.NEXT_PUBLIC_BUILDBASE_SERVER_URL,
    galleryMediaUrl: process.env.GALLERY_MEDIA_URL,
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-page-scope', scope);
  requestHeaders.set('Content-Security-Policy', csp);

  // The locale middleware forwards these request headers to the page.
  const response = intlMiddleware(
    new NextRequest(request, { headers: requestHeaders })
  );

  // Set request-id header
  response.headers.set('x-request-id', requestId);

  // A docs page has a Markdown form under the same URL (Accept: text/markdown).
  if (docsPage) response.headers.append('Vary', 'Accept');

  // --- Link headers for agent/resource discovery ---
  const origin = request.nextUrl.origin;
  response.headers.append(
    'Link',
    [
      `<${origin}/llms.txt>; rel="describedby"; type="text/plain"`,
      `<${origin}/sitemap.xml>; rel="sitemap"; type="application/xml"`,
      `<${origin}/blog/feed.xml>; rel="alternate"; type="application/rss+xml"; title="Blog"`,
    ].join(', ')
  );

  response.headers.set('Content-Security-Policy', csp);
  return withHeaders(response, baseSecurityHeaders(scope));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml and robots.txt (SEO files)
     * - agent discovery documents (llms.txt, auth.md, security.txt, ...):
     *   served by route handlers, so the locale middleware must not
     *   rewrite them to /en/... (that answered 404)
     * - public folder assets (images, and the reels in public/reels)
     */
    '/((?!_next/static|_next/image|favicon.ico|push-sw\\.js|sitemap\\.xml|sitemap-\\d+\\.xml|robots\\.txt|llms\\.txt|llms-full\\.txt|openapi\\.json|auth\\.md|agents\\.md|security\\.txt|\\.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm)$).*)',
  ],
};

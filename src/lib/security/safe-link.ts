import { validateRedirectUrl } from '@buildbase/sdk';

/**
 * Where a notification's link may take the reader. Hardening from a private
 * security review (SEC-18).
 *
 * Built on the SDK's `validateRedirectUrl`: a path on this site, or an
 * `https:` URL on one of the allowed origins. Anything else (other schemes,
 * `//host`, `/\host`, control characters, other sites) is refused.
 */
export type LinkTarget =
  | { kind: 'internal'; path: string }
  | { kind: 'external'; url: string };

/** Sites a notification may link to besides this one. */
export const NOTIFICATION_LINK_ORIGINS = ['https://github.com'] as const;

export function notificationLinkTarget(
  link: string | null | undefined,
  siteOrigin: string,
  allowedOrigins: readonly string[] = NOTIFICATION_LINK_ORIGINS
): LinkTarget | null {
  if (!link) return null;
  const safe = validateRedirectUrl(link.trim(), {
    allowedOrigins: [siteOrigin, ...allowedOrigins],
  });
  if (!safe) return null;
  if (safe.startsWith('/') && !safe.startsWith('//')) {
    return { kind: 'internal', path: safe };
  }
  let url: URL;
  try {
    url = new URL(safe);
  } catch {
    return null;
  }
  if (url.origin === siteOrigin) {
    return {
      kind: 'internal',
      path: `${url.pathname}${url.search}${url.hash}`,
    };
  }
  if (url.protocol !== 'https:') return null;
  return { kind: 'external', url: url.toString() };
}

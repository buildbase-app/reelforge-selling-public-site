import { verifyWebhookSignature } from '@buildbase/sdk';

/**
 * Authentication for /api/buildbase/provision. Hardening from a private
 * security review (SEC-16).
 *
 * The route has its own secret, BUILDBASE_PROVISION_SECRET, never the
 * platform webhook signing key. Two ways to present it:
 *
 * - Signed (preferred, for any caller that can compute an HMAC):
 *   `x-provision-timestamp` (Unix seconds) and `x-provision-signature`
 *   (`sha256=<hex HMAC-SHA256 of "{timestamp}.{body}">`), checked with the
 *   SDK's `verifyWebhookSignature`, constant time, five-minute window.
 * - Header: `x-provision-secret: <secret>`. BuildBase's workflow HTTP
 *   Webhook action cannot sign a request (it sends static headers only), so
 *   this is how a workflow calls the route. Compared as SHA-256 digests in
 *   constant time, so neither the value nor its length leaks; a repeated
 *   call lands on the same row (the route is idempotent on the body).
 */

export const PROVISION_MAX_AGE_SECONDS = 300;

export type ProvisionAuthResult =
  | { ok: true; mode: 'signed' | 'header' }
  | { ok: false; status: 401 | 503; reason: string };

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  );
}

/** Equal strings, in time that depends on neither value nor length. */
export async function constantTimeEqual(
  a: string,
  b: string
): Promise<boolean> {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function authenticateProvisionCall(options: {
  headers: Headers;
  body: string;
  secret: string | undefined;
}): Promise<ProvisionAuthResult> {
  const { headers, body, secret } = options;
  if (!secret) return { ok: false, status: 503, reason: 'not configured' };

  const signature = headers.get('x-provision-signature');
  const timestamp = headers.get('x-provision-timestamp');
  if (signature || timestamp) {
    const valid = verifyWebhookSignature({
      body,
      signature,
      timestamp,
      secret,
      maxAgeSeconds: PROVISION_MAX_AGE_SECONDS,
    });
    return valid
      ? { ok: true, mode: 'signed' }
      : { ok: false, status: 401, reason: 'bad or stale signature' };
  }

  const given = headers.get('x-provision-secret');
  if (given && (await constantTimeEqual(given, secret))) {
    return { ok: true, mode: 'header' };
  }
  return { ok: false, status: 401, reason: 'missing or wrong secret' };
}

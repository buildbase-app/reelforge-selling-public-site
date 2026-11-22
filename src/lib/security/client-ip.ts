/**
 * The caller's IP address for audit records. Hardening from a private
 * security review (SEC-19).
 *
 * On Cloudflare Workers, `CF-Connecting-IP` is set by Cloudflare's edge and
 * replaces any value the client sent, so it can be trusted.
 * `X-Forwarded-For` and `X-Real-IP` are passed through from the client and
 * are never used.
 */
export function clientIp(headers: Headers): string | undefined {
  const ip = headers.get('cf-connecting-ip')?.trim();
  return ip ? ip : undefined;
}

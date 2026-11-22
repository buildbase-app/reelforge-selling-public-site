/**
 * Whether this URL is a return from BuildBase's hosted pages that the SDK
 * must finish: a sign-in code (`code` with `state`, or a bare 32-character
 * code), a re-verification code, or an impersonation ticket. The same test
 * as `@buildbase/sdk/react` 1.8 (`SaaSOSProvider`), so pages without the
 * provider know when to load it (studio issue #79).
 */
const BARE_CODE = /^[0-9A-Za-z]{32}$/;

export function isAuthCallback(search: string): boolean {
  try {
    const params = new URLSearchParams(search);
    if (params.has('reverify_code') || params.has('bb_impersonation')) {
      return true;
    }
    return (
      params.has('code') &&
      (params.has('state') || BARE_CODE.test(params.get('code') ?? ''))
    );
  } catch {
    return false;
  }
}

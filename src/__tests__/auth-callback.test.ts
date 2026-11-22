import { describe, expect, it } from 'vitest';
import { isAuthCallback } from '@/lib/auth-callback';

/**
 * Provider-free pages load the BuildBase SDK to finish a return from the
 * hosted sign-in page (studio issue #79); everything else stays SDK-free.
 */
describe('isAuthCallback', () => {
  it('spots a sign-in return, a re-verification and an impersonation ticket', () => {
    expect(isAuthCallback('?code=abc&state=xyz')).toBe(true);
    expect(isAuthCallback('?code=' + 'a'.repeat(32))).toBe(true);
    expect(isAuthCallback('?reverify_code=1')).toBe(true);
    expect(isAuthCallback('?bb_impersonation=' + 'a'.repeat(40))).toBe(true);
  });

  it('ignores ordinary query strings', () => {
    expect(isAuthCallback('')).toBe(false);
    expect(isAuthCallback('?utm_source=x')).toBe(false);
    expect(isAuthCallback('?code=short')).toBe(false);
    expect(isAuthCallback('?promo=launch')).toBe(false);
  });
});

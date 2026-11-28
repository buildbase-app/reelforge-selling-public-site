'use client';

/**
 * The free Personal licence in one trip (studio issue #599): "Get it free"
 * signs in and comes back to /pricing with `?claim=personal`, and /pricing
 * then claims the free licence at once and goes on to /order. Kept apart
 * from the catalog so the provider-free cards can import it cheaply.
 */
export const FREE_CLAIM_PARAM = 'claim';
export const FREE_CLAIM_VALUE = 'personal';

/** Where sign-in from "Get it free" comes back to. */
export const FREE_CLAIM_RETURN = `/pricing?${FREE_CLAIM_PARAM}=${FREE_CLAIM_VALUE}`;

/** True when this address asks to finish the free claim. */
export function wantsFreeClaim(search: string): boolean {
  return new URLSearchParams(search).get(FREE_CLAIM_PARAM) === FREE_CLAIM_VALUE;
}

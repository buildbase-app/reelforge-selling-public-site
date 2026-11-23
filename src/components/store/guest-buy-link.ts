/**
 * A guest's "Buy now" on a provider-free page (the home page) links to
 * /pricing with the offer named in `?buy=`, and the pricing page opens that
 * card's guest checkout. The SDK loads only there, after the click (studio
 * issues #79, #257). No SDK import here: this ships with the home page.
 */
export const GUEST_BUY_PARAM = 'buy';

export function guestBuyKey(itemId: string, variantId: string): string {
  return `${itemId}:${variantId}`;
}

export function guestBuyHref(itemId: string, variantId: string): string {
  return `/pricing?${GUEST_BUY_PARAM}=${encodeURIComponent(
    guestBuyKey(itemId, variantId)
  )}`;
}

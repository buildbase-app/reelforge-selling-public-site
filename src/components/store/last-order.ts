'use client';

/**
 * The order a checkout just started, kept for this browser tab so /order
 * can show it when Stripe sends the buyer back. A signed-in buyer's return
 * URL can't carry the order id (the order doesn't exist when the URL is
 * set), so it carries a checkout reference (`?ref=`) instead, and the
 * checkout's start records which order that reference became. Losing it is
 * harmless: /order then shows the newest order.
 */
const KEY = 'renderweld:last-order';
const REF_KEY = 'renderweld:checkout-ref:';

/** A fresh reference for one checkout's return URL. */
export function newCheckoutRef(): string {
  try {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  } catch {
    return Math.random().toString(36).slice(2, 18);
  }
}

/** The /order address a checkout returns to, naming its reference. */
export function orderReturnUrl(origin: string, ref: string): string {
  return `${origin}/order?ref=${encodeURIComponent(ref)}`;
}

export function rememberOrder(orderId: string, ref?: string | null) {
  try {
    sessionStorage.setItem(KEY, orderId);
    if (ref) sessionStorage.setItem(REF_KEY + ref, orderId);
  } catch {
    /* storage blocked: /order falls back to the newest order */
  }
}

/**
 * The order to show: the one the return URL's reference became, else the
 * last one this tab started.
 */
export function recallOrder(ref?: string | null): string | null {
  try {
    return (
      (ref ? sessionStorage.getItem(REF_KEY + ref) : null) ??
      sessionStorage.getItem(KEY)
    );
  } catch {
    return null;
  }
}

'use client';

/**
 * The order a checkout just started, kept for this browser tab so /order
 * can show it when Stripe sends the buyer back (a signed-in buyer's return
 * URL carries no order id). Losing it is harmless: /order then shows the
 * newest order.
 */
const KEY = 'renderweld:last-order';

export function rememberOrder(orderId: string) {
  try {
    sessionStorage.setItem(KEY, orderId);
  } catch {
    /* storage blocked: /order falls back to the newest order */
  }
}

export function recallOrder(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

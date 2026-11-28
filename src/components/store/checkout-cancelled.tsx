'use client';

import { useEffect, useState } from 'react';

/** The query a cancelled checkout returns to /pricing with. */
export const CHECKOUT_CANCELLED = 'checkout=cancelled';

/** Where Stripe sends a buyer who leaves checkout. */
export function pricingCancelUrl(origin: string): string {
  return `${origin}/pricing?${CHECKOUT_CANCELLED}`;
}

/**
 * "Checkout cancelled. You haven't been charged." when Stripe sends a buyer
 * back from a checkout they left (studio issue #570). Read in the browser,
 * since the pricing page is cached for everyone; the flag is then taken off
 * the address so a reload doesn't show it again.
 */
export function CheckoutCancelledNote() {
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('checkout') !== 'cancelled') return;
    url.searchParams.delete('checkout');
    window.history.replaceState(window.history.state, '', url.toString());
    // After this render, not inside the effect itself. Not cleared on
    // unmount: in development React runs effects twice, and the second run
    // no longer sees the flag it just removed.
    window.setTimeout(() => setCancelled(true), 0);
  }, []);
  if (!cancelled) return null;
  return (
    <p
      role="status"
      data-checkout-cancelled
      className="bg-muted mx-auto mb-8 max-w-xl rounded-md px-4 py-3 text-center text-sm"
    >
      Checkout cancelled. You haven&apos;t been charged.
    </p>
  );
}

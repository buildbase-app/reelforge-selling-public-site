import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CheckoutCancelledNote,
  pricingCancelUrl,
} from '@/components/store/checkout-cancelled';

/**
 * A buyer who leaves Stripe checkout comes back to /pricing and is told
 * they haven't been charged (studio issue #570).
 */
afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('cancelled checkout', () => {
  it('returns to /pricing with a cancelled flag', () => {
    expect(pricingCancelUrl('https://renderweld.com')).toBe(
      'https://renderweld.com/pricing?checkout=cancelled'
    );
  });

  it('says checkout was cancelled and nothing was charged', async () => {
    window.history.replaceState(null, '', '/pricing?checkout=cancelled');
    render(<CheckoutCancelledNote />);
    expect((await screen.findByRole('status')).textContent).toBe(
      "Checkout cancelled. You haven't been charged."
    );
    // Taken off the address so a reload doesn't show it again.
    expect(window.location.search).toBe('');
  });

  it('shows nothing on an ordinary visit', () => {
    window.history.replaceState(null, '', '/pricing');
    render(<CheckoutCancelledNote />);
    expect(screen.queryByRole('status')).toBeNull();
  });
});

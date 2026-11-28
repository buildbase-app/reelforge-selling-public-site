import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { HoldingView } from '@buildbase/sdk';

/**
 * Guests can't give a key activation back from their order link, so the
 * page gives them the support path with their order number (studio issue
 * #583). Signed-in buyers free an install themselves.
 */

const keysProps: { canRemove?: boolean }[] = [];

vi.mock('@buildbase/sdk/react', () => ({
  usePublishedItems: () => ({ items: [], loading: false, error: null }),
  HoldingKeys: (props: { canRemove?: boolean }) => {
    keysProps.push(props);
    return null;
  },
  HoldingFiles: () => null,
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { OrderHoldings } from '@/components/store/order-holdings';

const key = {
  _id: 'h1',
  kind: 'license_key',
  state: 'available',
  itemId: '6b01b5c5a2516bdd69b225e2',
  itemTitle: 'RenderWeld Commercial',
  title: 'Licence key',
} as unknown as HoldingView;

describe('freeing an install', () => {
  it('a guest gets the support path with the order number', () => {
    keysProps.length = 0;
    render(
      <OrderHoldings
        holdings={[key]}
        guestOrder={{ orderId: 'ord_guest_1', token: 'tok' }}
      />
    );
    expect(keysProps[0].canRemove).toBe(false);
    const note = document.querySelector('[data-free-install]')!;
    expect(note.textContent).toContain('ord_guest_1');
    expect(
      screen.getByRole('link', { name: 'contact support' })
    ).toHaveAttribute('href', '/contact');
  });

  it('a signed-in buyer frees it themselves and sees no note', () => {
    keysProps.length = 0;
    render(<OrderHoldings holdings={[key]} />);
    expect(keysProps[0].canRemove).toBe(true);
    expect(document.querySelector('[data-free-install]')).toBeNull();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { HoldingView, PublicItemView } from '@buildbase/sdk';
import { keyEdition, LicenceEdition } from '@/components/store/order-holdings';

/**
 * A licence key whose edition neither its item nor a known id tells says
 * "Edition unknown" and points to support, rather than guessing Commercial
 * (studio issue #564). While the store's items load, nothing shows yet.
 */

vi.mock('@buildbase/sdk/react', () => ({
  usePublishedItems: () => ({ items: [], loading: false, error: null }),
  HoldingKeys: () => null,
  HoldingFiles: () => null,
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

type Holding = Pick<HoldingView, 'kind' | 'itemId'>;
const key = (itemId: string): Holding => ({ kind: 'license_key', itemId });

const prodPersonal = {
  _id: 'prod-personal',
  slug: 'prod-personal',
  variants: [
    {
      id: 'v',
      prices: [{ id: 'p', currency: 'usd', mode: 'fixed', amount: 9900 }],
      stock: { mode: 'none' },
    },
  ],
  data: { edition: 'personal' },
} as unknown as PublicItemView;

describe('keyEdition', () => {
  it('is null for anything that is not a key', () => {
    expect(keyEdition({ kind: 'file', itemId: 'x' }, [], false)).toBeNull();
  });

  it('reads the edition field on the listed item first', () => {
    expect(keyEdition(key('prod-personal'), [prodPersonal], false)).toBe(
      'personal'
    );
  });

  it('is unknown for a key nothing identifies, once items have loaded', () => {
    expect(keyEdition(key('archived-combined'), [], false)).toBe('unknown');
  });

  it('shows nothing while the items are still loading', () => {
    expect(keyEdition(key('archived-combined'), [], true)).toBeNull();
  });
});

describe('LicenceEdition', () => {
  it('says the edition is unknown and links to support', () => {
    render(<LicenceEdition edition="unknown" />);
    expect(screen.getByText('Edition unknown')).toBeTruthy();
    const link = screen.getByRole('link', { name: 'Contact support' });
    expect(link.getAttribute('href')).toBe('/contact');
    expect(screen.queryByText(/Commercial licence/)).toBeNull();
  });

  it('still labels known keys', () => {
    render(<LicenceEdition edition="commercial" />);
    expect(screen.getByText('Commercial licence')).toBeTruthy();
    expect(screen.queryByText('Edition unknown')).toBeNull();
  });
});

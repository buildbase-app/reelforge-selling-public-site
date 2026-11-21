import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicItemView } from '@buildbase/sdk';

/**
 * The pricing page shows only what the store's published items say: no
 * items, no prices (a "not on sale yet" state with the waitlist); an item,
 * its own price and a Buy button that returns to /order.
 */

const state: {
  items: PublicItemView[];
  loading: boolean;
  error: string | null;
} = { items: [], loading: false, error: null };
let browserReads = 0;
const buyProps: Record<string, unknown>[] = [];

vi.mock('@buildbase/sdk/react', () => ({
  usePublishedItems: () => {
    browserReads += 1;
    return { ...state, hasNextPage: false, refetch: vi.fn() };
  },
  useSaaSAuth: () => ({ signIn: vi.fn() }),
  WhenAuthenticated: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  WhenUnauthenticated: () => null,
  BuyButton: (props: Record<string, unknown>) => {
    buyProps.push(props);
    return <button type="button">{String(props.label)}</button>;
  },
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { PricingCatalog } from '@/components/store/pricing-catalog';
import { priceLabel } from '@/components/store/price';

function item(overrides: Partial<PublicItemView> = {}): PublicItemView {
  return {
    _id: 'item_1',
    title: 'ReelForge',
    slug: 'reelforge',
    summary: 'Docker image, licence key and install docs.',
    variants: [
      {
        id: 'solo',
        label: 'Solo',
        prices: [{ id: 'eur', currency: 'eur', mode: 'fixed', amount: 12345 }],
        stock: { mode: 'none' },
      },
    ],
    benefits: [{ id: 'b1', kind: 'file', title: 'Docker image download' }],
    restricted: false,
    ...overrides,
  } as unknown as PublicItemView;
}

beforeEach(() => {
  state.items = [];
  state.loading = false;
  state.error = null;
  buyProps.length = 0;
  browserReads = 0;
});

describe('PricingCatalog', () => {
  it('says ReelForge is not on sale and links the waitlist when nothing is published', () => {
    render(<PricingCatalog />);
    expect(screen.getByText('Not on sale yet')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /join the waitlist/i })
    ).toHaveAttribute('href', '/waitlist');
    expect(document.body.textContent).not.toMatch(/[€$£]\s?\d/);
  });

  it('shows the item price and a Buy button returning to /order', () => {
    state.items = [item()];
    render(<PricingCatalog />);
    expect(screen.getByText('ReelForge: Solo')).toBeInTheDocument();
    expect(screen.getByText(/123\.45/)).toBeInTheDocument();
    expect(screen.getByText('Docker image download')).toBeInTheDocument();
    expect(buyProps[0]).toMatchObject({
      itemId: 'item_1',
      variantId: 'solo',
      priceId: 'eur',
      successUrl: `${window.location.origin}/order`,
    });
  });

  it('skips retired prices and variants with none left', () => {
    state.items = [
      item({
        variants: [
          {
            id: 'old',
            label: 'Old',
            prices: [
              {
                id: 'p',
                currency: 'eur',
                mode: 'fixed',
                amount: 100,
                retired: true,
              },
            ],
            stock: { mode: 'none' },
          },
        ] as PublicItemView['variants'],
      }),
    ];
    render(<PricingCatalog />);
    expect(screen.getByText('Not on sale yet')).toBeInTheDocument();
  });
});

describe('PricingCatalog with server-read items', () => {
  it('renders the server items without reading the store in the browser', () => {
    state.loading = true; // the browser read would only show a spinner
    render(<PricingCatalog serverItems={[item()]} />);
    expect(screen.getByText('ReelForge: Solo')).toBeInTheDocument();
    expect(screen.getByText(/123\.45/)).toBeInTheDocument();
    expect(browserReads).toBe(0);
  });

  it('says not on sale when the server read found nothing published', () => {
    render(<PricingCatalog serverItems={[]} />);
    expect(screen.getByText('Not on sale yet')).toBeInTheDocument();
    expect(browserReads).toBe(0);
  });

  it('falls back to the browser read when the server could not read', () => {
    state.items = [item()];
    render(<PricingCatalog serverItems={null} />);
    expect(screen.getByText('ReelForge: Solo')).toBeInTheDocument();
    expect(browserReads).toBeGreaterThan(0);
  });
});

describe('priceLabel', () => {
  it('formats from the price itself', () => {
    expect(
      priceLabel({ id: 'x', currency: 'usd', mode: 'fixed', amount: 4900 })
    ).toMatch(/\$49(\.00)? one-time/);
    expect(priceLabel({ id: 'x', currency: 'usd', mode: 'free' })).toBe('Free');
  });
});

import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicItemView } from '@buildbase/sdk';

/**
 * The pricing page shows only what the store's published items say: no
 * items, no prices (a "not on sale yet" state with the waitlist); an item,
 * its own price and a Buy button that returns to /order. The free Personal
 * licence comes first ("Free", "Get it free"), then the Commercial tiers.
 */

const state: {
  items: PublicItemView[];
  loading: boolean;
  error: string | null;
} = { items: [], loading: false, error: null };
let browserReads = 0;
let signedIn = true;
const buyProps: Record<string, unknown>[] = [];

vi.mock('@buildbase/sdk/react', () => ({
  usePublishedItems: () => {
    browserReads += 1;
    return { ...state, hasNextPage: false, refetch: vi.fn() };
  },
  useSaaSAuth: () => ({ signIn: vi.fn() }),
  WhenAuthenticated: ({ children }: { children: React.ReactNode }) =>
    signedIn ? <>{children}</> : null,
  WhenUnauthenticated: ({ children }: { children: React.ReactNode }) =>
    signedIn ? null : <>{children}</>,
  BuyButton: (props: Record<string, unknown>) => {
    buyProps.push(props);
    return <button type="button">{String(props.label)}</button>;
  },
}));

vi.mock('@/i18n/link', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { PricingCatalog } from '@/components/store/pricing-catalog';
import { priceLabel, priceParts } from '@/components/store/price';

function item(overrides: Partial<PublicItemView> = {}): PublicItemView {
  return {
    _id: 'item_1',
    title: 'ReelForge',
    slug: 'reelforge',
    summary: 'Licence key and install docs.',
    variants: [
      {
        id: 'solo',
        label: 'Solo',
        prices: [{ id: 'eur', currency: 'eur', mode: 'fixed', amount: 12345 }],
        stock: { mode: 'none' },
      },
    ],
    benefits: [{ id: 'b1', kind: 'license_key', title: 'Licence key' }],
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
  signedIn = true;
});

/** The two store items as the dev environment has them (test prices). */
function commercialItem(): PublicItemView {
  return item({
    _id: 'commercial',
    title: 'ReelForge Commercial',
    slug: 'reelforge-commercial',
    summary: 'Commercial licence for anything that earns money.',
    variants: [
      ['solo', 'Solo', 4900],
      ['studio', 'Studio', 14900],
      ['agency', 'Agency', 39900],
    ].map(([id, label, amount]) => ({
      id,
      label,
      prices: [{ id: `${id}-usd`, currency: 'usd', mode: 'fixed', amount }],
      stock: { mode: 'none' },
    })) as PublicItemView['variants'],
  });
}

function personalItem(overrides: Partial<PublicItemView> = {}): PublicItemView {
  return item({
    _id: 'personal',
    // A title that says nothing: the edition must not come from it.
    title: 'Zeta',
    slug: 'zeta',
    summary: 'Free licence key for noncommercial use.',
    variants: [
      {
        id: 'noncommercial',
        label: 'Noncommercial',
        prices: [{ id: 'free', currency: 'usd', mode: 'free' }],
        stock: { mode: 'none' },
      },
    ] as PublicItemView['variants'],
    benefits: [
      {
        id: 'k',
        kind: 'license_key',
        title: 'Personal licence key (1 server)',
      },
    ],
    ...overrides,
  });
}

function cardTitles(): string[] {
  return [...document.querySelectorAll('[data-edition]')].map(
    (card) => card.querySelector('[data-slot="card-title"]')?.textContent ?? ''
  );
}

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
    expect(screen.getByText('Licence key')).toBeInTheDocument();
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

describe('PricingCatalog: Personal first, then Commercial', () => {
  it('puts the free Personal licence first, whatever order the store lists', () => {
    state.items = [commercialItem(), personalItem()];
    render(<PricingCatalog />);
    expect(cardTitles()).toEqual([
      'Zeta: Noncommercial',
      'ReelForge Commercial: Solo',
      'ReelForge Commercial: Studio',
      'ReelForge Commercial: Agency',
    ]);
    const editions = [...document.querySelectorAll('[data-edition]')].map((c) =>
      c.getAttribute('data-edition')
    );
    expect(editions).toEqual([
      'personal',
      'commercial',
      'commercial',
      'commercial',
    ]);
  });

  it('shows "Free" and a "Get it free" claim on the Personal card', () => {
    state.items = [commercialItem(), personalItem()];
    render(<PricingCatalog />);
    const personal = document.querySelector<HTMLElement>(
      '[data-edition="personal"]'
    )!;
    expect(personal.textContent).toContain('Free for personal use');
    expect(within(personal).getByText('Free', { exact: true })).toBeVisible();
    expect(personal.textContent).not.toMatch(/[$€£]\s?\d/);
    expect(screen.getByRole('button', { name: 'Get it free' })).toBeVisible();
    expect(buyProps[0]).toMatchObject({
      itemId: 'personal',
      variantId: 'noncommercial',
      priceId: 'free',
      free: true,
      label: 'Get it free',
      successUrl: `${window.location.origin}/order`,
    });
  });

  it('shows each Commercial tier with its own price and a Buy button', () => {
    state.items = [commercialItem(), personalItem()];
    render(<PricingCatalog />);
    const commercial = [
      ...document.querySelectorAll('[data-edition="commercial"]'),
    ];
    expect(commercial).toHaveLength(3);
    expect(commercial[1].textContent).toContain('For commercial use');
    expect(commercial.map((c) => c.textContent)).toEqual([
      expect.stringMatching(/\$49(\.00)? one-time/),
      expect.stringMatching(/\$149(\.00)? one-time/),
      expect.stringMatching(/\$399(\.00)? one-time/),
    ]);
    expect(screen.getAllByRole('button', { name: 'Buy' })).toHaveLength(3);
    expect(buyProps.slice(1).map((p) => [p.variantId, p.free])).toEqual([
      ['solo', false],
      ['studio', false],
      ['agency', false],
    ]);
  });

  it('signed out: "Get it free" and "Sign in to buy" both sign in first', () => {
    signedIn = false;
    state.items = [commercialItem(), personalItem()];
    render(<PricingCatalog />);
    expect(buyProps).toHaveLength(0);
    const buttons = screen.getAllByRole('button').map((b) => b.textContent);
    expect(buttons).toEqual([
      'Get it free',
      'Sign in to buy',
      'Sign in to buy',
      'Sign in to buy',
    ]);
  });

  it('orders by the item edition from metadata, not by price or title', () => {
    // An item marked Commercial stays Commercial even with a free price.
    const freeCommercial = personalItem({
      _id: 'promo',
      title: 'Promo',
      slug: 'promo',
      data: { edition: 'commercial' },
    } as Partial<PublicItemView>);
    state.items = [freeCommercial, commercialItem(), personalItem()];
    render(<PricingCatalog />);
    expect(cardTitles()).toEqual([
      'Zeta: Noncommercial',
      'Promo: Noncommercial',
      'ReelForge Commercial: Solo',
      'ReelForge Commercial: Studio',
      'ReelForge Commercial: Agency',
    ]);
    expect(document.querySelectorAll('[data-edition="personal"]')).toHaveLength(
      1
    );
  });

  it('never says "open source" or "locked image"', () => {
    state.items = [commercialItem(), personalItem()];
    render(<PricingCatalog />);
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/open[\s-]?source/i);
    expect(text).not.toMatch(/locked\s+(docker\s+)?image/i);
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

  it('splits the term from the amount, so a card never breaks "one-time"', () => {
    expect(
      priceParts({ id: 'x', currency: 'usd', mode: 'fixed', amount: 4900 })
    ).toEqual({
      amount: expect.stringMatching(/^\$49(\.00)?$/),
      term: 'one-time',
    });
    expect(priceParts({ id: 'x', currency: 'usd', mode: 'free' })).toEqual({
      amount: 'Free',
      term: null,
    });
    state.items = [commercialItem()];
    render(<PricingCatalog />);
    const term = screen.getAllByText('one-time')[0]!;
    expect(term.className).toContain('whitespace-nowrap');
  });
});

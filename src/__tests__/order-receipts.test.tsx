import { render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BuyerOrderView } from '@buildbase/sdk';
import en from '@/i18n/messages/en';

/**
 * One-time buyers find their orders and receipts (studio issue #258):
 * Dashboard > Orders and receipts lists each order with a link to its
 * receipt (the order page), its copy no longer talks about plans, and the
 * order page says it is the receipt and prints. BuildBase exposes no Stripe
 * receipt link for an order, so the store shows none.
 */

const orders = {
  list: [] as BuyerOrderView[],
  one: null as BuyerOrderView | null,
};
let search = '';

vi.mock('@buildbase/sdk/react', () => ({
  useMyOrders: () => ({
    orders: orders.list,
    hasNextPage: false,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useMyOrder: () => ({ order: orders.one, loading: false, error: null }),
  useHoldings: () => ({ holdings: [], refetch: vi.fn() }),
  useOrderByToken: () => ({
    order: orders.one,
    holdings: [],
    loading: false,
    error: null,
  }),
  useSaaSAuth: () => ({
    isAuthenticated: true,
    status: 'authenticated',
    signIn: vi.fn(),
  }),
  usePublishedItems: () => ({ items: [], loading: false, error: null }),
  HoldingKeys: () => null,
  HoldingFiles: () => null,
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(search),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/support-contact', () => ({
  SupportContact: () => <span>Contact us</span>,
}));

import { OrderList } from '@/components/store/order-list';
import { OrderView } from '@/components/store/order-view';

function order(overrides: Partial<BuyerOrderView> = {}): BuyerOrderView {
  return {
    _id: 'order_studio',
    checkout: 'complete',
    paymentStatus: 'paid',
    buyer: {
      type: 'user',
      id: 'u1',
      email: 'buyer@example.com',
      name: 'Sample Buyer',
    },
    currency: 'usd',
    subtotal: 14900,
    total: 14900,
    refunded: 0,
    refunds: [],
    dispute: null,
    paidAt: '2026-11-23T06:40:00.000Z',
    createdAt: '2026-11-23T06:38:00.000Z',
    lines: [
      {
        lineKey: 'l1',
        itemId: 'commercial',
        itemTitle: 'ReelForge Commercial',
        variantId: 'studio',
        variantLabel: 'Studio',
        quantity: 1,
        total: 14900,
      },
    ],
    ...overrides,
  } as unknown as BuyerOrderView;
}

function withIntl(ui: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  orders.list = [];
  orders.one = null;
  search = '';
});

describe('Dashboard > Orders and receipts', () => {
  it('lists one-time orders with date, licence, total, status and a receipt link', () => {
    orders.list = [
      order(),
      order({
        _id: 'order_personal',
        total: 0,
        lines: [
          {
            lineKey: 'l1',
            itemTitle: 'ReelForge Personal',
            variantLabel: 'Noncommercial',
            quantity: 1,
            total: 0,
          },
        ] as BuyerOrderView['lines'],
      }),
    ];
    render(withIntl(<OrderList />));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    const studio = within(rows[0]);
    expect(studio.getByText('ReelForge Commercial: Studio')).toBeVisible();
    expect(studio.getByText('$149.00')).toBeVisible();
    expect(studio.getByText('Paid')).toBeVisible();
    // A column of its own from 640 px, under the licence on a phone.
    expect(
      studio.getAllByText(
        new Date('2026-11-23T06:40:00.000Z').toLocaleDateString()
      )
    ).toHaveLength(2);
    expect(studio.getByRole('link', { name: 'View receipt' })).toHaveAttribute(
      'href',
      '/order?id=order_studio'
    );
    expect(within(rows[1]).getByText('$0.00')).toBeVisible();
  });

  it('leaves out a checkout that was never paid', () => {
    orders.list = [
      order({
        _id: 'abandoned',
        checkout: 'expired',
        paymentStatus: 'unpaid',
        paidAt: null,
      } as Partial<BuyerOrderView>),
      order(),
    ];
    render(withIntl(<OrderList />));
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(document.querySelector('[data-order="abandoned"]')).toBeNull();
  });

  it('with no orders, points to pricing and says nothing about plans', () => {
    render(withIntl(<OrderList />));
    const text = document.body.textContent ?? '';
    expect(text).toContain('No orders yet');
    expect(text).not.toMatch(/plan/i);
    expect(screen.getByRole('link', { name: 'See pricing' })).toHaveAttribute(
      'href',
      '/pricing'
    );
  });

  it('is named "Orders and receipts", and its invoice copy no longer mentions plans', () => {
    expect(en.common.nav.invoices).toBe('Orders and receipts');
    expect(en.invoices.title).toBe('Orders and receipts');
    expect(en.invoices.card.empty).not.toMatch(/plan/i);
    expect(JSON.stringify(en.invoices)).not.toMatch(/subscribe/i);
  });
});

describe('/order as the receipt', () => {
  it('a signed-in buyer: who bought, "this page is your receipt", print, and a link to all orders', () => {
    search = 'id=order_studio';
    orders.one = order();
    render(<OrderView />);
    expect(screen.getByText('Sample Buyer (buyer@example.com)')).toBeVisible();
    expect(screen.getByText(/This page is your receipt/)).toBeVisible();
    expect(screen.getByRole('button', { name: /Print receipt/ })).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Orders and receipts' })
    ).toHaveAttribute('href', '/dashboard/invoices');
  });

  it('a guest: the receipt and print, no dashboard link', () => {
    search = 'order=order_guest&token=tok';
    orders.one = order({
      _id: 'order_guest',
      buyer: { type: 'guest', id: 'g@example.com', email: 'g@example.com' },
    } as Partial<BuyerOrderView>);
    render(<OrderView />);
    expect(screen.getByText('g@example.com')).toBeVisible();
    expect(screen.getByText(/This page is your receipt/)).toBeVisible();
    expect(screen.getByRole('button', { name: /Print receipt/ })).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Orders and receipts' })
    ).toBeNull();
  });

  it('an unpaid order shows no receipt yet', () => {
    search = 'id=open';
    orders.one = order({
      _id: 'open',
      checkout: 'open',
      paymentStatus: 'unpaid',
      paidAt: null,
    } as Partial<BuyerOrderView>);
    render(<OrderView />);
    expect(screen.queryByText(/This page is your receipt/)).toBeNull();
  });

  it('shows what was refunded', () => {
    search = 'id=order_studio';
    orders.one = order({
      refunded: 14900,
      paymentStatus: 'refunded',
    } as Partial<BuyerOrderView>);
    render(<OrderView />);
    expect(screen.getByText('Refunded', { selector: 'dt' })).toBeVisible();
  });
});

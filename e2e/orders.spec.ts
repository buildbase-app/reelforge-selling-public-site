import { test, expect } from '@playwright/test';
import { fakeSignIn } from './fake-sign-in';

/**
 * Dashboard > Orders and receipts lists a one-time buyer's orders with a
 * link to each receipt, the order page (studio issue #258). The orders come
 * from a made-up BuildBase answer, as the rest of the signed-in pages do.
 */
const sampleOrder = {
  _id: 'order_e2e',
  checkout: 'complete',
  paymentStatus: 'paid',
  buyer: { type: 'user', id: 'u_e2e', email: 'buyer@example.com' },
  seller: { id: null, subject: { type: 'org', id: 'store' }, displayName: '' },
  shape: 'storefront',
  currency: 'usd',
  subtotal: 14900,
  total: 14900,
  refunded: 0,
  refunds: [],
  dispute: null,
  expiresAt: null,
  paidAt: '2026-11-23T06:40:00.000Z',
  createdAt: '2026-11-23T06:38:00.000Z',
  updatedAt: '2026-11-23T06:40:00.000Z',
  lines: [
    {
      lineKey: 'l1',
      itemId: 'commercial',
      itemTitle: 'ReelForge Commercial',
      typeKey: 'software',
      typeVersion: 1,
      variantId: 'studio',
      variantLabel: 'Studio',
      priceId: 'studio-usd',
      priceMode: 'fixed',
      unitAmount: 14900,
      quantity: 1,
      subtotal: 14900,
      total: 14900,
      fulfilment: 'none',
      refunded: 0,
      fulfilledAt: null,
      fulfilmentNote: null,
    },
  ],
};

test('one-time orders are listed with a link to their receipt', async ({
  page,
}) => {
  await fakeSignIn(page);
  // Registered after fakeSignIn, so it answers the orders read first.
  await page.route(/\/api\/v1\/public\/.*\/orders(\?|$)/, (route) =>
    route.fulfill({
      json: {
        docs: [sampleOrder],
        page: 1,
        totalDocs: 1,
        totalPages: 1,
        hasNextPage: false,
      },
      headers: {
        'access-control-allow-origin':
          route.request().headers()['origin'] ?? '*',
        'access-control-allow-credentials': 'true',
      },
    })
  );
  await page.goto('/dashboard/invoices');
  await expect(
    page.getByRole('heading', { name: 'Orders and receipts' })
  ).toBeVisible();
  const row = page.locator('[data-order="order_e2e"]');
  await expect(row).toContainText('ReelForge Commercial: Studio');
  await expect(row).toContainText('$149.00');
  await expect(row).toContainText('Paid');
  await expect(row.getByRole('link', { name: 'View receipt' })).toHaveAttribute(
    'href',
    '/order?id=order_e2e'
  );
  await expect(page.locator('main')).not.toContainText(/paid plan/i);
});

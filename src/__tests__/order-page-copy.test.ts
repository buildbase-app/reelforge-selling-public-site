// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { ORDER_STATUS } from '@/components/store/order-status';

const read = (p: string) =>
  readFileSync(join(__dirname, '..', '..', p), 'utf8').replace(/\s+/g, ' ');

describe('order page copy (Content C42, C43, C44)', () => {
  it('C42: a partly paid order says the rest will be emailed', () => {
    expect(ORDER_STATUS.partly_paid.label).toBe('Partly paid');
    expect(ORDER_STATUS.partly_paid.hint).toBe(
      "Part of the payment has arrived. We'll email you when the rest does."
    );
  });

  it('C43: the order page promises an order and a licence key, not downloads', () => {
    const page = read('src/app/[locale]/(app)/(store)/order/page.tsx');
    expect(page).toContain(
      "description: 'Your RenderWeld order and licence key.'"
    );
    const view = read('src/components/store/order-view.tsx');
    expect(view).toContain(
      'When you buy RenderWeld, your order and licence key appear here'
    );
    expect(view).not.toContain('downloads and licence keys appear');
  });

  it('C44: a signed-out buyer is told both ways back to the order', () => {
    const view = read('src/components/store/order-view.tsx');
    expect(view).toContain(
      'Sign in with the account you used, or open the link in your receipt email.'
    );
    expect(view).not.toContain(
      'Your order is in the account you bought it with.'
    );
  });
});

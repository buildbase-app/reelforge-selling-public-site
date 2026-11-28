// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The refund page says how to ask, when we reply, how the money returns
 * and that the key stops working, and how long that takes (studio issues
 * #587 and #584).
 */
const REFUND = readFileSync(
  join(__dirname, '..', 'content', 'pages', 'refund', 'en.ts'),
  'utf8'
);

describe('refund page', () => {
  it('says how to ask and when we reply', () => {
    expect(REFUND).toContain('## How to ask');
    expect(REFUND).toMatch(/with your order number/);
    expect(REFUND).toMatch(/We reply within/);
  });

  it('says how the money returns and that the key is revoked', () => {
    expect(REFUND).toMatch(/goes back to the payment method you used/);
    expect(REFUND).toMatch(/licence keys stop working/);
  });

  it('says a refunded key stops working within about two weeks', () => {
    expect(REFUND).toContain(
      'A refunded key stops working within about two weeks'
    );
  });
});

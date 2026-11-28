// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import type { PublicItemView } from '@buildbase/sdk';

vi.mock('server-only', () => ({}));

import {
  freeKeyFrom,
  hasFreeKey,
  hasOffers,
  onSaleFrom,
} from '@/lib/store/items';

/**
 * Only a price a buyer pays counts as "on sale": publishing only the free
 * Personal item must not switch the site to "Buy RenderWeld". The free key
 * is its own state (studio issue #554).
 */

type Price = {
  mode: 'fixed' | 'free' | 'pwyw';
  amount?: number;
  retired?: boolean;
};

function item(id: string, prices: Price[]): PublicItemView {
  return {
    _id: id,
    slug: id,
    variants: [{ id: `${id}-v`, prices }],
  } as unknown as PublicItemView;
}

const personal = item('personal', [{ mode: 'free' }]);
const commercial = item('commercial', [{ mode: 'fixed', amount: 4900 }]);
const retiredPaid = item('old', [
  { mode: 'fixed', amount: 100, retired: true },
]);
const zeroFixed = item('zero', [{ mode: 'fixed', amount: 0 }]);

describe('hasOffers', () => {
  it('ignores free variants', () => {
    expect(hasOffers([personal])).toBe(false);
    expect(hasOffers([zeroFixed])).toBe(false);
  });

  it('ignores retired prices', () => {
    expect(hasOffers([retiredPaid])).toBe(false);
  });

  it('counts a current paid price, with or without the free item', () => {
    expect(hasOffers([commercial])).toBe(true);
    expect(hasOffers([personal, commercial])).toBe(true);
  });

  it('counts pay-what-you-want as paid', () => {
    expect(hasOffers([item('pwyw', [{ mode: 'pwyw' }])])).toBe(true);
  });
});

describe('hasFreeKey', () => {
  it('is true when the free item is published', () => {
    expect(hasFreeKey([personal])).toBe(true);
    expect(hasFreeKey([zeroFixed])).toBe(true);
    expect(hasFreeKey([commercial])).toBe(false);
    expect(hasFreeKey([item('gone', [{ mode: 'free', retired: true }])])).toBe(
      false
    );
  });
});

describe('onSaleFrom and freeKeyFrom', () => {
  it('only the free item published: not on sale, free key available', () => {
    const store = { source: 'server' as const, items: [personal] };
    expect(onSaleFrom(store)).toBe(false);
    expect(freeKeyFrom(store)).toBe(true);
  });

  it('a failed read is unknown for both', () => {
    const store = { source: 'unavailable' as const, items: [] };
    expect(onSaleFrom(store)).toBeUndefined();
    expect(freeKeyFrom(store)).toBeUndefined();
  });
});

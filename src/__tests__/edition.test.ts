// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { PublicItemView } from '@buildbase/sdk';
import {
  editionOf,
  editionOfHolding,
  orderByEdition,
} from '@/lib/store/edition';
import { toPublicItem } from '@/lib/store/public-item';

type Variant = PublicItemView['variants'][number];

function item(
  _id: string,
  prices: Variant['prices'],
  extra: Partial<PublicItemView> = {}
): PublicItemView {
  return {
    _id,
    title: 'ReelForge Personal Commercial', // titles never decide
    slug: _id,
    variants: [{ id: 'v', prices, stock: { mode: 'none' }, data: {} }],
    data: {},
    ...extra,
  } as unknown as PublicItemView;
}

const free = [{ id: 'f', currency: 'usd', mode: 'free' }] as Variant['prices'];
const paid = [
  { id: 'p', currency: 'usd', mode: 'fixed', amount: 4900 },
] as Variant['prices'];

describe('editionOf', () => {
  it('reads edition set on the item first', () => {
    expect(editionOf(item('a', paid, { data: { edition: 'Personal' } }))).toBe(
      'personal'
    );
    expect(
      editionOf(item('b', free, { data: { edition: 'commercial' } }))
    ).toBe('commercial');
  });

  it('knows the store items by id and slug', () => {
    expect(editionOf(item('6b01b5a42e4626d1e671e34f', paid))).toBe('personal');
    expect(editionOf(item('6b01b5c5a2516bdd69b225e2', free))).toBe(
      'commercial'
    );
    expect(editionOf(item('reelforge-personal', paid))).toBe('personal');
    expect(editionOf(item('renderweld-personal', paid))).toBe('personal');
    expect(editionOf(item('renderweld-commercial', free))).toBe('commercial');
  });

  it('falls back to the price: all free is Personal', () => {
    expect(editionOf(item('x', free))).toBe('personal');
    expect(editionOf(item('y', paid))).toBe('commercial');
  });

  it('orders Personal first and keeps the store order otherwise', () => {
    const items = [item('c1', paid), item('p', free), item('c2', paid)];
    expect(orderByEdition(items).map((i) => i._id)).toEqual(['p', 'c1', 'c2']);
  });
});

describe('editionOfHolding', () => {
  it('uses the published item, then a known id, else null (unknown)', () => {
    expect(editionOfHolding('p', [item('p', free)])).toBe('personal');
    expect(editionOfHolding('6b01b5a42e4626d1e671e34f', [])).toBe('personal');
    expect(editionOfHolding('archived-combined', [])).toBeNull();
  });

  it('reads the edition field before the id and the prices', () => {
    // A production item: unknown id, a price to pay, edition field Personal.
    const prod = item('prod-personal', paid, {
      data: { edition: 'personal' },
    });
    expect(editionOfHolding('prod-personal', [prod])).toBe('personal');
  });
});

describe('toPublicItem and edition', () => {
  it('copies metadata.edition and nothing else from metadata', () => {
    const view = toPublicItem({
      _id: 'i',
      title: 'T',
      slug: 't',
      status: 'published',
      metadata: { edition: 'personal', secret: 'never-public' },
      variants: [{ id: 'v', prices: free, stock: { mode: 'none' } }],
    });
    expect(view?.data).toEqual({ edition: 'personal' });
    expect(JSON.stringify(view)).not.toMatch(/never-public/);
    expect(editionOf(view!)).toBe('personal');
  });

  it('ignores an edition value it does not know', () => {
    const view = toPublicItem({
      _id: 'i',
      title: 'T',
      slug: 't',
      status: 'published',
      metadata: { edition: 'enterprise' },
      variants: [{ id: 'v', prices: paid, stock: { mode: 'none' } }],
    });
    expect(view?.data).toEqual({});
  });
});

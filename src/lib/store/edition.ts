import type { PublicItemView } from '@buildbase/sdk';

/**
 * Which RenderWeld licence an item (and every key it grants) is: the free
 * Personal licence (PolyForm Noncommercial, noncommercial use only) or the
 * paid Commercial licence. Founder decision 2026-11-21.
 *
 * Decided from the item itself, never from its title:
 *  1. `edition` set on the item: its server-only metadata (`metadata.edition`,
 *     copied by `toPublicItem` on the server read; nothing else in metadata
 *     is) or a public item field of that name (`data.edition`);
 *  2. a known item id or slug (below), for keys whose item is no longer
 *     listed, and for the browser read, which never sees metadata;
 *  3. otherwise: an item whose every current price is free is Personal,
 *     anything with a price to pay is Commercial.
 */

export type Edition = 'personal' | 'commercial';

/**
 * Item slugs per edition; the same in every BuildBase environment. The
 * renderweld-* slugs are the names the production items are due to take.
 */
const PERSONAL_SLUGS = new Set(['reelforge-personal', 'renderweld-personal']);
const COMMERCIAL_SLUGS = new Set([
  'reelforge-commercial',
  'renderweld-commercial',
]);

/**
 * Item ids per edition, a backup for when an item carries no `edition`
 * field. The development environment's items; production's get added here
 * when they are created. Each production item should also carry
 * `metadata.edition`, which is read first.
 */
const PERSONAL_ITEM_IDS = new Set(['6b01b5a42e4626d1e671e34f']);
const COMMERCIAL_ITEM_IDS = new Set(['6b01b5c5a2516bdd69b225e2']);

export function asEdition(value: unknown): Edition | null {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  return v === 'personal' || v === 'commercial' ? v : null;
}

/** The edition a known item id names, or null when the id is not known. */
export function editionOfItemId(itemId: string): Edition | null {
  if (PERSONAL_ITEM_IDS.has(itemId)) return 'personal';
  if (COMMERCIAL_ITEM_IDS.has(itemId)) return 'commercial';
  return null;
}

type ItemLike = Pick<PublicItemView, '_id' | 'slug' | 'variants'> & {
  data?: Record<string, unknown> | null;
};

export function editionOf(item: ItemLike): Edition {
  const set = asEdition(item.data?.edition);
  if (set) return set;
  const byId = editionOfItemId(item._id);
  if (byId) return byId;
  if (PERSONAL_SLUGS.has(item.slug)) return 'personal';
  if (COMMERCIAL_SLUGS.has(item.slug)) return 'commercial';
  const prices = item.variants.flatMap((v) =>
    v.prices.filter((p) => !p.retired)
  );
  return prices.length > 0 && prices.every((p) => p.mode === 'free')
    ? 'personal'
    : 'commercial';
}

/**
 * Items in the order the pricing page shows them: Personal first, then
 * Commercial, each keeping the store's own order.
 */
export function orderByEdition<T extends ItemLike>(items: T[]): T[] {
  const rank = (item: T) => (editionOf(item) === 'personal' ? 0 : 1);
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => rank(a.item) - rank(b.item) || a.index - b.index)
    .map(({ item }) => item);
}

/**
 * The edition of a key a buyer holds, by its item id: the published item it
 * came from when it is still listed, else a known id. Null when neither
 * tells: the key's page then says the edition is unknown and points to
 * support, rather than guessing a licence the buyer may not have.
 */
export function editionOfHolding(
  itemId: string,
  items: readonly ItemLike[]
): Edition | null {
  const item = items.find((i) => i._id === itemId);
  if (item) return editionOf(item);
  return editionOfItemId(itemId);
}

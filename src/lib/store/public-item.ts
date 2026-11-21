import type { PublicItemView } from '@buildbase/sdk';
import { asEdition } from './edition';

/**
 * Turns an item as the server API returns it (`/api/v1/server/commerce/items`,
 * every field, including server-only metadata, payees, eligibility and
 * benefit settings) into the public shape the browser may see: the fields a
 * buyer's own read (`usePublishedItems`) would return, and no more. Only
 * what is listed here is copied, so a new server-side field never leaks.
 *
 * Returns null for an item that is not published, is limited to named
 * buyers, or has no variant with a current price.
 *
 * The one exception to "no metadata": `metadata.edition` (`personal` or
 * `commercial`, see `./edition`) is copied to `data.edition`, so the pricing
 * page can order and label the licences. Nothing else in metadata is.
 */

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v : undefined;

const PRICE_KEYS = [
  'id',
  'currency',
  'mode',
  'amount',
  'compareAtAmount',
  'minimum',
  'suggested',
  'maximum',
  'recurring',
  'deposit',
  'milestones',
  'installments',
] as const;

const VARIANT_KEYS = [
  'id',
  'label',
  'rank',
  'stock',
  'benefitIds',
  'terms',
  'salesWindow',
  'quantity',
  'releasesAt',
] as const;

function pick<K extends string>(source: Raw, keys: readonly K[]): Raw {
  const out: Raw = {};
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
}

function publicVariant(raw: unknown): Raw | null {
  if (!isObj(raw) || !str(raw.id)) return null;
  const prices = (Array.isArray(raw.prices) ? raw.prices : [])
    .filter((p): p is Raw => isObj(p) && !p.retired && !!str(p.id))
    .map((p) => pick(p, PRICE_KEYS));
  if (prices.length === 0) return null;
  return { ...pick(raw, VARIANT_KEYS), prices, data: {} };
}

export function toPublicItem(raw: unknown): PublicItemView | null {
  if (!isObj(raw) || raw.status !== 'published') return null;
  if (!str(raw._id) || !str(raw.title)) return null;
  const eligibility = isObj(raw.eligibility) ? raw.eligibility : {};
  const buyerIds = Array.isArray(eligibility.buyerIds)
    ? eligibility.buyerIds
    : [];
  if (buyerIds.length > 0) return null;

  const variants = (Array.isArray(raw.variants) ? raw.variants : [])
    .map(publicVariant)
    .filter((v): v is Raw => v !== null);
  if (variants.length === 0) return null;

  const benefits = (Array.isArray(raw.benefits) ? raw.benefits : [])
    .filter((b): b is Raw => isObj(b) && !!str(b.id))
    .map((b) => ({
      id: String(b.id),
      kind: String(b.kind ?? ''),
      ...(str(b.title) ? { title: String(b.title) } : {}),
    }));

  const metadata = isObj(raw.metadata) ? raw.metadata : {};
  const publicData = isObj(raw.data) ? raw.data : {};
  const edition = asEdition(metadata.edition) ?? asEdition(publicData.edition);

  const seller = isObj(raw.seller) ? raw.seller : {};
  const subject = isObj(seller.subject) ? seller.subject : {};

  return {
    _id: String(raw._id),
    title: String(raw.title),
    slug: String(raw.slug ?? ''),
    ...(str(raw.summary) ? { summary: raw.summary } : {}),
    ...(str(raw.description) ? { description: raw.description } : {}),
    ...(str(raw.ctaText) ? { ctaText: raw.ctaText } : {}),
    ...(Array.isArray(raw.buyerCountries)
      ? { buyerCountries: raw.buyerCountries.filter((c) => !!str(c)) }
      : {}),
    variants,
    data: edition ? { edition } : {},
    typeKey: String(raw.typeKey ?? ''),
    typeVersion: Number(raw.typeVersion ?? 0),
    seller: {
      id: null,
      subject: { type: 'org', id: String(subject.id ?? 'store') },
      displayName: String(seller.displayName ?? ''),
    },
    status: 'published',
    publishedAt: str(raw.publishedAt) ?? null,
    updatedAt: String(raw.updatedAt ?? ''),
    benefits,
    restricted: false,
  } as unknown as PublicItemView;
}

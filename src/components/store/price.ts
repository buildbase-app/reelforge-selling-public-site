import { formatMinorAmountIntl } from '@buildbase/sdk';
import type { PublicItemView, VariantPrice } from '@buildbase/sdk';

type Variant = PublicItemView['variants'][number];

/** The price a variant is sold at now: the first one not retired. */
export function currentPrice(variant: Variant): VariantPrice | null {
  return variant.prices.find((p) => !p.retired) ?? null;
}

const INTERVAL: Record<string, string> = {
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
};

/**
 * A price in two parts, the amount and its term ("one-time", "/ month"), so
 * a card can set the term smaller and never break it across lines.
 */
export function priceParts(
  price: VariantPrice,
  locale = 'en'
): { amount: string; term: string | null } {
  const money = (amount: number) =>
    formatMinorAmountIntl(amount, price.currency, locale);
  let amount: string;
  if (price.mode === 'free') amount = 'Free';
  else if (price.mode === 'pwyw')
    amount = `Pay what you want${
      price.minimum ? `, from ${money(price.minimum)}` : ''
    }`;
  else amount = money(price.amount ?? 0);
  let term: string | null = null;
  if (price.recurring) {
    const n = price.recurring.intervalCount ?? 1;
    const unit = INTERVAL[price.recurring.interval] ?? price.recurring.interval;
    term = n === 1 ? `/ ${unit}` : `every ${n} ${unit}s`;
  } else if (price.mode !== 'free') {
    term = 'one-time';
  }
  return { amount, term };
}

/** A price as a buyer reads it, from the item's own amounts. */
export function priceLabel(price: VariantPrice, locale = 'en'): string {
  const { amount, term } = priceParts(price, locale);
  return term ? `${amount} ${term}` : amount;
}

/** The "was" price shown struck through, when the seller set one. */
export function compareAtLabel(
  price: VariantPrice,
  locale = 'en'
): string | null {
  if (price.mode !== 'fixed' || !price.compareAtAmount) return null;
  if (price.compareAtAmount <= (price.amount ?? 0)) return null;
  return formatMinorAmountIntl(price.compareAtAmount, price.currency, locale);
}

/** The benefits a variant includes: those it names, or all when it names none. */
export function variantBenefits(item: PublicItemView, variant: Variant) {
  const ids = variant.benefitIds ?? [];
  return ids.length
    ? item.benefits.filter((b) => ids.includes(b.id))
    : item.benefits;
}

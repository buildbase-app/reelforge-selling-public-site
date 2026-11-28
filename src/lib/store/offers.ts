import type { PublicItemView } from '@buildbase/sdk';
import { isLaunchPriceActive, LAUNCH_PRICE_ENDS_AT } from './launch';

/**
 * schema.org `Offer`s from the store's published items, one per variant with
 * a current price. Amounts are minor units in BuildBase and decimal strings
 * in schema.org. A pay-what-you-want price is listed at its minimum, and only
 * when it has one.
 *
 * While the launch price lasts, a paid offer says until when
 * (`priceValidUntil`, from the one end-date setting in launch.ts). A variant
 * whose counted stock has run out is `SoldOut`, not `InStock` (studio
 * issue #563).
 */

export interface SchemaOffer {
  '@type': 'Offer';
  name: string;
  price: string;
  priceCurrency: string;
  availability: string;
  /** `YYYY-MM-DD`: the last day this price applies. */
  priceValidUntil?: string;
  url: string;
}

type Variant = PublicItemView['variants'][number];

/** Out of stock only when the store counts units and none are left. */
function availability(variant: Variant): string {
  const { stock } = variant;
  if (stock?.mode === 'counted' && (stock.available ?? 0) <= 0)
    return 'https://schema.org/SoldOut';
  return 'https://schema.org/InStock';
}

function fractionDigits(currency: string): number {
  try {
    return (
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

function decimal(minor: number, currency: string): string {
  const digits = fractionDigits(currency);
  return (minor / 10 ** digits).toFixed(digits);
}

export function buildOffers(
  items: PublicItemView[],
  url: string,
  now: Date = new Date()
): SchemaOffer[] {
  const offers: SchemaOffer[] = [];
  const validUntil = isLaunchPriceActive(now)
    ? LAUNCH_PRICE_ENDS_AT.toISOString().slice(0, 10)
    : undefined;
  for (const item of items) {
    for (const variant of item.variants) {
      const price = variant.prices.find((p) => !p.retired);
      if (!price) continue;
      let minor: number | undefined;
      if (price.mode === 'free') minor = 0;
      else if (price.mode === 'fixed') minor = price.amount;
      else if (price.mode === 'pwyw') minor = price.minimum;
      if (typeof minor !== 'number' || !Number.isFinite(minor)) continue;
      offers.push({
        '@type': 'Offer',
        name: variant.label ? `${item.title}: ${variant.label}` : item.title,
        price: decimal(minor, price.currency),
        priceCurrency: price.currency.toUpperCase(),
        availability: availability(variant),
        ...(validUntil && minor > 0 && { priceValidUntil: validUntil }),
        url,
      });
    }
  }
  return offers;
}

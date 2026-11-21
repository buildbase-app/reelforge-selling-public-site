import type { PublicItemView } from '@buildbase/sdk';

/**
 * schema.org `Offer`s from the store's published items, one per variant with
 * a current price. Amounts are minor units in BuildBase and decimal strings
 * in schema.org. A pay-what-you-want price is listed at its minimum, and only
 * when it has one.
 */

export interface SchemaOffer {
  '@type': 'Offer';
  name: string;
  price: string;
  priceCurrency: string;
  availability: string;
  url: string;
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
  url: string
): SchemaOffer[] {
  const offers: SchemaOffer[] = [];
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
        availability: 'https://schema.org/InStock',
        url,
      });
    }
  }
  return offers;
}

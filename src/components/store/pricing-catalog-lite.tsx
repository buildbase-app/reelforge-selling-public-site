import type { PublicItemView } from '@buildbase/sdk';
import { OfferGrid } from './offer-grid';
import { LiteOfferAction } from './lite-offer-action';
import { PricingCatalogFallback } from './pricing-catalog-fallback';

/**
 * The offer cards on provider-free pages (the home page's pricing section,
 * studio issue #79). A server component: the cards and prices render on the
 * server from `getStoreItems`, so neither the price formatting nor the SDK
 * reaches the browser; only each card's button is a client component
 * (`LiteOfferAction`). Checkout happens on /pricing, which keeps the
 * provider.
 *
 * When the server could not read the store (`null`), the provider-backed
 * catalog loads on demand and reads it in the browser, as before.
 */
export function LitePricingCatalog({
  serverItems,
}: {
  serverItems: PublicItemView[] | null;
}) {
  if (!serverItems) return <PricingCatalogFallback />;
  return (
    <OfferGrid
      items={serverItems}
      unreachable={false}
      Action={LiteOfferAction}
    />
  );
}

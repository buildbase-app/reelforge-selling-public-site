'use client';

import { useSyncExternalStore } from 'react';
import { Loader2 } from 'lucide-react';
import {
  BuyButton,
  WhenAuthenticated,
  WhenUnauthenticated,
  useSaaSAuth,
} from '@buildbase/sdk/react';
import type { CheckoutStart, PublicItemView } from '@buildbase/sdk';
import { Button } from '@/components/ui/button';
import { useStoreItems } from './use-store-items';
import { rememberOrder } from './last-order';
import { copy, OfferGrid, type OfferActionProps } from './offer-grid';

/**
 * What can be bought, with checkout: the offer cards (`OfferGrid`) with a
 * Buy button per card. Needs `SaaSProvider` (the `(store)` pages); the
 * provider-free pages use `LitePricingCatalog`.
 *
 * `serverItems` are the items the page read on the server
 * (`getStoreItems`), so the prices are in the HTML. When the server could
 * not read them (`null` or absent: API down), the browser reads them
 * instead, as before.
 */
export function PricingCatalog({
  serverItems = null,
}: {
  serverItems?: PublicItemView[] | null;
}) {
  if (serverItems)
    return (
      <OfferGrid items={serverItems} unreachable={false} Action={BuyAction} />
    );
  return <LiveCatalog />;
}

function LiveCatalog() {
  const { items, loading, error } = useStoreItems();

  if (loading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {copy.loading}
      </div>
    );
  }
  return <OfferGrid items={items} unreachable={!!error} Action={BuyAction} />;
}

/** Signed in: the SDK's checkout. Signed out: sign in first, then buy here. */
function BuyAction({ item, variant, price, free, label }: OfferActionProps) {
  const { signIn } = useSaaSAuth();
  const origin = useOrigin();
  return (
    <>
      <WhenAuthenticated>
        {origin && (
          <BuyButton
            itemId={item._id}
            variantId={variant.id}
            priceId={price.id}
            free={free}
            amount={
              price.mode === 'pwyw'
                ? (price.suggested ?? price.minimum)
                : undefined
            }
            recurring={!!price.recurring}
            buyerCountries={item.buyerCountries}
            currency={price.currency}
            successUrl={`${origin}/order`}
            label={label}
            onStarted={(start: CheckoutStart) => {
              rememberOrder(start.order._id);
            }}
            onComplete={(order) => {
              rememberOrder(order._id);
              window.location.assign(
                `${origin}/order?id=${encodeURIComponent(order._id)}`
              );
            }}
          />
        )}
      </WhenAuthenticated>
      <WhenUnauthenticated>
        {/* Signed out: sign in first, then claim or buy on this page. */}
        <Button onClick={() => signIn()}>
          {free ? copy.getFree : copy.signInToBuy}
        </Button>
      </WhenUnauthenticated>
    </>
  );
}

/** This page's origin in the browser, null on the server (Stripe's return URL needs it). */
const noSubscribe = () => () => {};
function useOrigin(): string | null {
  return useSyncExternalStore(
    noSubscribe,
    () => window.location.origin,
    () => null
  );
}

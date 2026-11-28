'use client';

import '@/lib/zod-jitless';
import { useSyncExternalStore } from 'react';
import { Loader2 } from 'lucide-react';
import { BuyButton, useSaaSAuth } from '@buildbase/sdk/react';
import type { CheckoutStart, PublicItemView } from '@buildbase/sdk';
import { Button } from '@/components/ui/button';
import { useStoreItems } from './use-store-items';
import { rememberOrder } from './last-order';
import { pricingCancelUrl } from './checkout-cancelled';
import { copy, OfferGrid, type OfferActionProps } from './offer-grid';
import { GuestCheckout } from './guest-checkout';

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

/**
 * Signed in: the SDK's checkout. Signed out: a paid offer can be bought as
 * a guest ("Buy now", studio issue #257) or after signing in; the free
 * Personal licence needs an account, so it signs in first.
 *
 * The card's action. The guest path ("Buy now" with a name and email, or
 * "Get it free", which signs in) shows straight away, also while sign-in
 * is still loading or if it never loads, so nobody is left without a way
 * to buy (studio issue #555). The SDK's signed-in Buy button replaces it
 * only once sign-in confirms the visitor.
 */
function BuyAction({ item, variant, price, free, label }: OfferActionProps) {
  const { signIn, status } = useSaaSAuth();
  const origin = useOrigin();
  if (status === 'authenticated') {
    return origin ? (
      <BuyButton
        itemId={item._id}
        variantId={variant.id}
        priceId={price.id}
        free={free}
        amount={
          price.mode === 'pwyw' ? (price.suggested ?? price.minimum) : undefined
        }
        recurring={!!price.recurring}
        buyerCountries={item.buyerCountries}
        currency={price.currency}
        successUrl={`${origin}/order`}
        cancelUrl={pricingCancelUrl(origin)}
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
    ) : null;
  }
  if (free) {
    return <Button onClick={() => signIn()}>{copy.getFree}</Button>;
  }
  return (
    <>
      {origin && (
        <GuestCheckout
          item={item}
          variant={variant}
          price={price}
          origin={origin}
        />
      )}
      <Button variant="outline" onClick={() => signIn()}>
        {copy.signInToBuy}
      </Button>
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

'use client';

import '@/lib/zod-jitless';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Loader2 } from 'lucide-react';
import { BuyButton, useCheckout, useSaaSAuth } from '@buildbase/sdk/react';
import type {
  CheckoutStart,
  PublicItemView,
  VariantPrice,
} from '@buildbase/sdk';
import { Button } from '@/components/ui/button';
import { useStoreItems } from './use-store-items';
import { newCheckoutRef, orderReturnUrl, rememberOrder } from './last-order';
import { copy, OfferGrid, type OfferActionProps } from './offer-grid';
import { GuestCheckout } from './guest-checkout';
import { FREE_CLAIM_RETURN, wantsFreeClaim } from './free-claim';

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
  const claimRequested = useFreeClaimRequested();
  // One reference per offer on this page load: the return URL names it, and
  // the checkout's start records which order it became.
  const [ref] = useState(newCheckoutRef);
  const buy = origin && (
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
      successUrl={orderReturnUrl(origin, ref)}
      label={label}
      onStarted={(start: CheckoutStart) => {
        rememberOrder(start.order._id, ref);
      }}
      onComplete={(order) => {
        rememberOrder(order._id, ref);
        window.location.assign(
          `${origin}/order?id=${encodeURIComponent(order._id)}`
        );
      }}
    />
  );
  if (status === 'authenticated') {
    if (!origin) return null;
    // Back from "Get it free" with `?claim=personal`: claim at once.
    return free && claimRequested ? (
      <FreeClaim
        itemId={item._id}
        variantId={variant.id}
        price={price}
        origin={origin}
        checkoutRef={ref}
        fallback={buy}
      />
    ) : (
      buy
    );
  }
  if (free) {
    return (
      <Button
        onClick={() =>
          signIn(origin ? new URL(FREE_CLAIM_RETURN, origin).href : undefined)
        }
      >
        {copy.getFree}
      </Button>
    );
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

const CLAIMING = 'Getting your free key…';
const CLAIM_FAILED = "Your free key didn't come through. Try again.";

/**
 * Back from "Get it free" with `?claim=personal`, signed in: claims the
 * free licence at once and goes to its /order page, so there is no second
 * click here (studio issue #599). `replace`, so Back doesn't land on the
 * claim address again. If the claim is refused, says so and shows the
 * card's usual button to try again.
 */
function FreeClaim({
  itemId,
  variantId,
  price,
  origin,
  checkoutRef,
  fallback,
}: {
  itemId: string;
  variantId: string;
  price: VariantPrice;
  origin: string;
  checkoutRef: string;
  fallback: React.ReactNode;
}) {
  const { checkout, error } = useCheckout();
  const started = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    checkout(itemId, {
      variantId,
      priceId: price.id,
      successUrl: orderReturnUrl(origin, checkoutRef),
      cancelUrl: `${origin}/pricing`,
    })
      .then((start) => {
        if (!start) {
          setFailed(true);
          return;
        }
        rememberOrder(start.order._id, checkoutRef);
        window.location.replace(
          start.url ??
            `${origin}/order?id=${encodeURIComponent(start.order._id)}`
        );
      })
      .catch(() => setFailed(true));
  }, [checkout, itemId, variantId, price.id, origin, checkoutRef]);

  if (!failed) {
    return (
      <Button disabled data-free-claim="pending">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {CLAIMING}
      </Button>
    );
  }
  return (
    <>
      <p role="alert" className="text-destructive text-sm">
        {error ?? CLAIM_FAILED}
      </p>
      {fallback}
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

/** True when the address asks to finish the free claim (`?claim=personal`). */
function useFreeClaimRequested(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => wantsFreeClaim(window.location.search),
    () => false
  );
}

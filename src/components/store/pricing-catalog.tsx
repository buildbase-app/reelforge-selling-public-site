'use client';

import { useSyncExternalStore } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import {
  BuyButton,
  WhenAuthenticated,
  WhenUnauthenticated,
  useSaaSAuth,
} from '@buildbase/sdk/react';
import type { CheckoutStart, PublicItemView } from '@buildbase/sdk';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { useStoreItems } from './use-store-items';
import {
  compareAtLabel,
  currentPrice,
  priceLabel,
  variantBenefits,
} from './price';
import { rememberOrder } from './last-order';

// English only for now (src/i18n/config.ts); kept together for translation.
const copy = {
  loading: 'Loading what is on sale…',
  notOnSaleTitle: 'Not on sale yet',
  notOnSaleBody:
    'ReelForge is in early access and cannot be bought yet. Prices and what each option includes will appear here as soon as they are published. Join the waitlist to hear first.',
  joinWaitlist: 'Join the waitlist',
  storeUnreachable: 'The store could not be reached just now.',
  includes: 'What is included',
  signInToBuy: 'Sign in to buy',
  buy: 'Buy',
};

/**
 * What can be bought, from the store's published items. Each variant is a
 * card with its price, what it includes and a Buy button. With nothing
 * published it says so; it never shows a made-up price.
 *
 * `serverItems` are the items the page read on the server
 * (`getStoreItems`), so the prices are in the HTML. When the server could
 * not read them (`null` or absent: no token, API down), the browser reads
 * them instead, as before.
 */
export function PricingCatalog({
  serverItems = null,
}: {
  serverItems?: PublicItemView[] | null;
}) {
  if (serverItems) return <Catalog items={serverItems} unreachable={false} />;
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
  return <Catalog items={items} unreachable={!!error} />;
}

function Catalog({
  items,
  unreachable,
}: {
  items: PublicItemView[];
  unreachable: boolean;
}) {
  const origin = useOrigin();
  const offers = items.flatMap((item) =>
    item.variants
      .map((variant) => ({ item, variant, price: currentPrice(variant) }))
      .filter((o) => o.price !== null)
  );

  if (offers.length === 0) {
    return <NotOnSale unreachable={unreachable} />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {offers.map(({ item, variant, price }) => (
        <OfferCard
          key={`${item._id}:${variant.id}`}
          item={item}
          variant={variant}
          price={price!}
          origin={origin}
        />
      ))}
    </div>
  );
}

function OfferCard({
  item,
  variant,
  price,
  origin,
}: {
  item: PublicItemView;
  variant: PublicItemView['variants'][number];
  price: NonNullable<ReturnType<typeof currentPrice>>;
  origin: string | null;
}) {
  const { signIn } = useSaaSAuth();
  const benefits = variantBenefits(item, variant).filter((b) => b.title);
  const was = compareAtLabel(price);
  const description = variant.terms || item.summary || item.description;
  const title = variant.label ? `${item.title}: ${variant.label}` : item.title;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">
            {priceLabel(price)}
          </span>
          {was && (
            <span className="text-muted-foreground text-sm line-through">
              {was}
            </span>
          )}
        </div>
        {description && (
          <CardDescription className="mt-2 whitespace-pre-line">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {benefits.length > 0 && (
          <>
            <p className="mb-2 text-sm font-medium">{copy.includes}</p>
            <ul className="space-y-1.5 text-sm">
              {benefits.map((b) => (
                <li key={b.id} className="flex gap-2">
                  <Check
                    className="text-primary mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden
                  />
                  {b.title}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <WhenAuthenticated>
          {origin && (
            <BuyButton
              itemId={item._id}
              variantId={variant.id}
              priceId={price.id}
              free={price.mode === 'free'}
              amount={
                price.mode === 'pwyw'
                  ? (price.suggested ?? price.minimum)
                  : undefined
              }
              recurring={!!price.recurring}
              buyerCountries={item.buyerCountries}
              currency={price.currency}
              successUrl={`${origin}/order`}
              label={item.ctaText || copy.buy}
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
          <Button onClick={() => signIn()}>{copy.signInToBuy}</Button>
        </WhenUnauthenticated>
      </CardFooter>
    </Card>
  );
}

function NotOnSale({ unreachable }: { unreachable: boolean }) {
  return (
    <div className="bg-muted/40 mx-auto max-w-2xl rounded-2xl border px-6 py-12 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">
        {copy.notOnSaleTitle}
      </h2>
      <p className="text-muted-foreground mx-auto mt-3 max-w-xl">
        {copy.notOnSaleBody}
      </p>
      {unreachable && (
        <p className="text-muted-foreground mt-2 text-xs">
          {copy.storeUnreachable}
        </p>
      )}
      <Button size="lg" className="mt-6 gap-2" asChild>
        <Link href="/waitlist">
          {copy.joinWaitlist}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
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

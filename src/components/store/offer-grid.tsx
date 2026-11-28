import { ArrowRight, Check } from 'lucide-react';
import type { PublicItemView, VariantPrice } from '@buildbase/sdk';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/link';
import {
  compareAtLabel,
  currentPrice,
  priceParts,
  variantBenefits,
} from './price';
import { editionOf, orderByEdition, type Edition } from '@/lib/store/edition';
import { isLaunchPriceActive, LAUNCH_PRICE_ENDS_DAY } from '@/lib/store/launch';

// English only for now (src/i18n/config.ts); kept together for translation.
export const copy = {
  loading: 'Loading what is on sale…',
  notOnSaleTitle: 'Not on sale yet',
  notOnSaleBody:
    'RenderWeld is in early access and cannot be bought yet. Prices and what each option includes will appear here as soon as they are published. Join the waitlist to hear first.',
  joinWaitlist: 'Join the waitlist',
  storeUnreachable: 'The store could not be reached just now.',
  includes: 'What is included',
  signInToBuy: 'Sign in to buy',
  buy: 'Buy',
  getFree: 'Get it free',
  edition: {
    personal: {
      badge: 'Personal',
      tagline: 'Free for personal use',
      note: 'Noncommercial use only: hobby, study, research and evaluation. Needs a free account.',
    },
    commercial: {
      badge: 'Commercial',
      tagline: 'For commercial use',
      note: 'For anything that earns money: monetised channels, client work, a business. One-time licence.',
    },
  } satisfies Record<Edition, { badge: string; tagline: string; note: string }>,
};

/** What a card's button gets: the offer, and the label the card would show. */
export interface OfferActionProps {
  item: PublicItemView;
  variant: PublicItemView['variants'][number];
  price: VariantPrice;
  free: boolean;
  label: string;
}

/**
 * The offer cards, with no BuildBase provider: each variant with a price is
 * a card with its price, what it includes and a button. The button is
 * `Action`: checkout inside the provider (`PricingCatalog`), sign-in or a
 * link on provider-free pages (`LitePricingCatalog`). The free Personal
 * licence comes first, then the Commercial tiers, in the store's own order
 * (see `@/lib/store/edition`: decided from the item, never its title). With
 * nothing published it says so; it never shows a made-up price.
 */
export function OfferGrid({
  items,
  unreachable,
  Action,
}: {
  items: PublicItemView[];
  unreachable: boolean;
  Action: React.ComponentType<OfferActionProps>;
}) {
  const offers = orderByEdition(items).flatMap((item) =>
    item.variants
      .map((variant) => ({ item, variant, price: currentPrice(variant) }))
      .filter((o) => o.price !== null)
  );

  if (offers.length === 0) {
    return <NotOnSale unreachable={unreachable} />;
  }

  return (
    <div
      className={
        offers.length >= 4
          ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-4'
          : 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
      }
    >
      {offers.map(({ item, variant, price }) => (
        <OfferCard
          key={`${item._id}:${variant.id}`}
          item={item}
          variant={variant}
          price={price!}
          Action={Action}
        />
      ))}
    </div>
  );
}

function OfferCard({
  item,
  variant,
  price,
  Action,
}: {
  item: PublicItemView;
  variant: PublicItemView['variants'][number];
  price: VariantPrice;
  Action: React.ComponentType<OfferActionProps>;
}) {
  const benefits = variantBenefits(item, variant).filter((b) => b.title);
  // A future price rise while the launch price lasts; nothing afterwards,
  // when the price itself goes up. Never a struck-through "was" price.
  const rise = isLaunchPriceActive() ? compareAtLabel(price) : null;
  const { amount, term } = priceParts(price);
  const description = variant.terms || item.summary || item.description;
  const title = variant.label ? `${item.title}: ${variant.label}` : item.title;
  const edition = editionOf(item);
  const ed = copy.edition[edition];
  const free = price.mode === 'free';
  const label = free ? copy.getFree : item.ctaText || copy.buy;

  return (
    <Card
      className={
        edition === 'personal'
          ? 'border-primary/40 flex flex-col'
          : 'flex flex-col'
      }
      data-edition={edition}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={edition === 'personal' ? 'default' : 'secondary'}>
            {ed.badge}
          </Badge>
          <span className="text-muted-foreground text-xs font-medium">
            {ed.tagline}
          </span>
        </div>
        <CardTitle className="mt-2 text-lg">{title}</CardTitle>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="text-3xl font-medium tracking-tight tabular-nums">
            {amount}
          </span>{' '}
          {term && (
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              {term}
            </span>
          )}
        </div>
        {rise && (
          <p className="text-muted-foreground mt-1 text-sm" data-price-rise="">
            Launch price. Goes up to {rise} on {LAUNCH_PRICE_ENDS_DAY}.
          </p>
        )}
        {description && (
          <CardDescription className="mt-2 whitespace-pre-line">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground mb-4 text-xs">{ed.note}</p>
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
        <Action
          item={item}
          variant={variant}
          price={price}
          free={free}
          label={label}
        />
      </CardFooter>
    </Card>
  );
}

export function NotOnSale({ unreachable }: { unreachable: boolean }) {
  return (
    <div className="bg-muted/40 mx-auto max-w-2xl rounded-2xl border px-6 py-12 text-center">
      <h2 className="text-2xl font-medium tracking-tight">
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

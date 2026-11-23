'use client';

import '@/lib/zod-jitless';
import { useEffect, useId, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useGuestCheckout } from '@buildbase/sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OfferActionProps } from './offer-grid';
import { GUEST_BUY_PARAM, guestBuyKey } from './guest-buy-link';

// English only for now (src/i18n/config.ts); kept together for translation.
export const guestCopy = {
  buyNow: 'Buy now',
  name: 'Name',
  email: 'Email',
  pay: 'Continue to payment',
  cancel: 'Cancel',
  starting: 'Opening payment…',
  hint: 'No account needed. After payment, your order page shows your licence key.',
};

/**
 * A signed-out buyer's checkout without an account (studio issue #257):
 * "Buy now" asks for a name and an email, then the SDK's
 * `useGuestCheckout` opens Stripe, which returns to `/order?order=&token=`
 * where the order and its licence key are read by that token. Paid offers
 * only: the free Personal licence needs an account.
 *
 * Opens by itself when the page was reached from the home page's "Buy now"
 * (`?buy=<item>:<variant>`, see ./guest-buy-link).
 */
export function GuestCheckout({
  item,
  variant,
  price,
  origin,
}: Pick<OfferActionProps, 'item' | 'variant' | 'price'> & { origin: string }) {
  const { checkout, starting, error, reset } = useGuestCheckout();
  const [open, setOpen] = useState(false);
  const formId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const fromLink = useRef(false);
  const key = guestBuyKey(item._id, variant.id);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(
      GUEST_BUY_PARAM
    );
    if (requested !== key) return;
    // Opened from a link that names this card: the page loaded with it.
    fromLink.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
  }, [key]);

  useEffect(() => {
    if (!open) return;
    // The form replaces the button: move focus to its first field, and
    // bring it into view when the page opened it from a link.
    if (fromLink.current) nameRef.current?.scrollIntoView({ block: 'center' });
    nameRef.current?.focus({ preventScroll: true });
  }, [open]);

  if (!open) {
    return <Button onClick={() => setOpen(true)}>{guestCopy.buyNow}</Button>;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const start = await checkout(item._id, {
      variantId: variant.id,
      priceId: price.id,
      amount:
        price.mode === 'pwyw' ? (price.suggested ?? price.minimum) : undefined,
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      successUrl: `${origin}/order`,
      cancelUrl: `${origin}/pricing`,
    });
    if (!start) return; // refused: `error` says why
    window.location.assign(
      start.url ??
        `${origin}/order?order=${encodeURIComponent(
          start.order._id
        )}&token=${encodeURIComponent(start.token)}`
    );
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={onSubmit}
      aria-label={`${guestCopy.buyNow}: ${variant.label ?? item.title}`}
    >
      <label htmlFor={`${formId}-name`} className="text-sm font-medium">
        {guestCopy.name}
      </label>
      <Input
        ref={nameRef}
        id={`${formId}-name`}
        name="name"
        autoComplete="name"
        required
        maxLength={200}
        disabled={starting}
      />
      <label htmlFor={`${formId}-email`} className="text-sm font-medium">
        {guestCopy.email}
      </label>
      <Input
        id={`${formId}-email`}
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={320}
        disabled={starting}
      />
      <p className="text-muted-foreground text-xs">{guestCopy.hint}</p>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Button type="submit" disabled={starting}>
        {starting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {starting ? guestCopy.starting : guestCopy.pay}
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={starting}
        onClick={() => {
          reset();
          setOpen(false);
        }}
      >
        {guestCopy.cancel}
      </Button>
    </form>
  );
}

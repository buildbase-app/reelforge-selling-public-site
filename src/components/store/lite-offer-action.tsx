'use client';

import { buttonClass } from '@/components/ui/button-classes';
import { Link } from '@/i18n/link';
import { SignInButton } from '@/components/auth/lite-auth-button';
import { useHasSession } from '@/components/auth/session-hint';
import type { OfferActionProps } from './offer-grid';
import { guestBuyHref } from './guest-buy-link';

// The same words as `copy` in ./offer-grid, kept here so the browser does
// not load that module (and the price formatting it imports).
const SIGN_IN_TO_BUY = 'Sign in to buy';
const GET_FREE = 'Get it free';
const BUY_NOW = 'Buy now';

/**
 * A card's button without the provider. Signed in, it goes to /pricing.
 * Signed out, a paid offer has "Buy now", which opens that card's guest
 * checkout on /pricing (the SDK loads there, after the click; studio issue
 * #257), and "Sign in to buy"; the free licence signs in. Sign-in comes
 * back to /pricing to buy there.
 */
export function LiteOfferAction({
  item,
  variant,
  free,
  label,
}: OfferActionProps) {
  const hasSession = useHasSession();
  if (hasSession) {
    return (
      <Link
        href="/pricing"
        data-slot="button"
        data-variant="default"
        data-size="default"
        className={buttonClass()}
      >
        {label}
      </Link>
    );
  }
  if (free) {
    return <SignInButton returnTo="/pricing">{GET_FREE}</SignInButton>;
  }
  return (
    <>
      <Link
        href={guestBuyHref(item._id, variant.id)}
        data-slot="button"
        data-variant="default"
        data-size="default"
        className={buttonClass()}
      >
        {BUY_NOW}
      </Link>
      <SignInButton returnTo="/pricing" variant="outline">
        {SIGN_IN_TO_BUY}
      </SignInButton>
    </>
  );
}

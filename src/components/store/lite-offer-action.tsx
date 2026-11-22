'use client';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { SignInButton } from '@/components/auth/lite-auth-button';
import { useHasSession } from '@/components/auth/session-hint';
import type { OfferActionProps } from './offer-grid';

// The same words as `copy` in ./offer-grid, kept here so the browser does
// not load that module (and the price formatting it imports).
const SIGN_IN_TO_BUY = 'Sign in to buy';
const GET_FREE = 'Get it free';

/**
 * A card's button without the provider: signed out, it signs in and comes
 * back to /pricing to buy there; signed in, it goes to /pricing.
 */
export function LiteOfferAction({ free, label }: OfferActionProps) {
  const hasSession = useHasSession();
  if (hasSession) {
    return (
      <Button asChild>
        <Link href="/pricing">{label}</Link>
      </Button>
    );
  }
  return (
    <SignInButton returnTo="/pricing">
      {free ? GET_FREE : SIGN_IN_TO_BUY}
    </SignInButton>
  );
}

'use client';

import '@/lib/zod-jitless';
import { CookieBanner, openCookieBanner } from '@buildbase/sdk/react';

/**
 * One consent system for the whole app: the SDK's own `CookieBanner`.
 *
 * It asks once (Accept all, Reject all, or Choose between analytics and
 * marketing), in the visitor's locale, and keeps the answer in the
 * `bb_consent` cookie. `BuildBaseTracking` (mounted by `SaaSOSProvider`'s
 * `tracking` option) restores it on later pages and decides from it which
 * analytics and ad tags load, so nothing here stores consent itself.
 * `useTracking().consent` reads the same answer anywhere in the app.
 */

/** Reopen the banner on the visitor's current answer, e.g. from a settings page. */
export const openCookieChoices = openCookieBanner;

export function CookieConsent({
  privacyPolicyUrl = '/privacy',
}: {
  /** Path to the privacy policy page. Defaults to "/privacy". */
  privacyPolicyUrl?: string;
}) {
  return (
    <CookieBanner
      privacyHref={privacyPolicyUrl}
      buttons="accept-primary"
      className="rf-consent"
    />
  );
}

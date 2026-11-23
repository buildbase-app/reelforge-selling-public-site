'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  useTracking,
  type AnalyticsConsent,
} from '@buildbase/sdk/tracking';

/**
 * The cookie banner's first view on provider-free pages (studio issue #79):
 * the same markup, classes and English copy as the SDK's `CookieBanner`
 * (`@buildbase/sdk/react` 1.8), without its 580 KB bundle. "Reject all" and
 * "Accept all" answer exactly as its buttons do (`consent.set` on the
 * tracker and `setAnalyticsConsent`, which keeps the answer in the
 * `bb_consent` cookie, `source: 'banner'`). "Choose" loads the SDK's own
 * banner, opened on its per-category switches, and hands over to it.
 *
 * If the SDK's banner copy or markup changes in an upgrade, update this
 * file to match (the "Choose" view is always the SDK's).
 *
 * Both banners carry `rf-consent` (globals.css), which gives the SDK's
 * classes our tokens and our button shape (studio #284). Reject all and
 * Accept all look the same (the SDK's default, `buttons="equal"`): neither
 * answer is made the easier one (no dark pattern; EDPB guidance on equal
 * prominence). Choose is an outline button of the same shape.
 */
const BUTTON =
  'inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none h-9 sm:h-8 px-3 text-xs';
const PRIMARY = `${BUTTON} bg-primary text-primary-foreground hover:bg-primary/90`;
const OUTLINE = `${BUTTON} border border-input hover:bg-accent hover:text-accent-foreground`;

// Inlined at build time: keeps this import (and a copy of the SDK) out of
// the server bundle.
const SdkCookieBanner = dynamic(
  () =>
    typeof window === 'undefined'
      ? new Promise<never>(() => {})
      : import('./sdk-cookie-banner'),
  { ssr: false }
);

export function LiteCookieBanner({ privacyHref }: { privacyHref: string }) {
  const { consent } = useTracking();
  const [answered, setAnswered] = useState(
    () => getAnalyticsConsent() !== null
  );
  const [choose, setChoose] = useState(false);

  if (choose) return <SdkCookieBanner privacyHref={privacyHref} />;
  if (answered || consent.state) return null;

  const answer = (state: AnalyticsConsent) => {
    consent.set(state, { source: 'banner' });
    setAnalyticsConsent(state, { source: 'banner' });
    setAnswered(true);
  };

  // `saas-os-ui`: the SDK's stylesheet scopes its colours (light and dark)
  // to this wrapper, exactly as its banner renders.
  return (
    <div className="saas-os-ui" style={{ backgroundColor: 'transparent' }}>
      <div
        role="region"
        aria-label="Cookie consent"
        tabIndex={-1}
        dir="ltr"
        className="rf-consent border-border bg-background text-foreground fixed inset-x-0 bottom-0 z-[2147483000] flex flex-col gap-3 border-t px-4 py-3 text-sm shadow-lg outline-none sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0 space-y-1 sm:max-w-2xl">
          <p className="font-medium">Cookies on this site</p>
          <p className="text-muted-foreground break-words">
            Cookies help us see how people find and use this site and measure
            our ads. You choose which we use.{' '}
            <a
              href={privacyHref}
              className="text-foreground hover:text-primary underline underline-offset-2"
            >
              Privacy policy
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
          <button
            type="button"
            className={PRIMARY}
            onClick={() => answer({ analytics: false, marketing: false })}
          >
            Reject all
          </button>
          <button
            type="button"
            className={OUTLINE}
            aria-expanded="false"
            onClick={() => setChoose(true)}
          >
            Choose
          </button>
          <button
            type="button"
            className={PRIMARY}
            onClick={() => answer({ analytics: true, marketing: true })}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

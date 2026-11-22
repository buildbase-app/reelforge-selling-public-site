'use client';

import { BuildBaseTracking } from '@buildbase/sdk/tracking';
import { TRACKING, TRACKING_APP } from '@/lib/tracking-config';
import { AuthIslandHost } from '@/components/auth/auth-island';
import { LiteCookieBanner } from './lite-cookie-banner';

/**
 * Loaded by `SiteTracking`. The banner and the sign-in island sit inside
 * the tracker so `useTracking()` reaches it: the banner's answer, and the
 * SDK's sign-in events from the island, go to this one tracker.
 */
export default function SiteTrackingSdk() {
  return (
    <BuildBaseTracking {...TRACKING_APP} {...TRACKING}>
      <LiteCookieBanner privacyHref="/privacy" />
      <AuthIslandHost />
    </BuildBaseTracking>
  );
}

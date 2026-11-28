'use client';

import { BuildBaseTracking } from '@buildbase/sdk/tracking';
import { TRACKING, TRACKING_APP } from '@/lib/tracking-config';
import { LiteCookieBanner } from './lite-cookie-banner';

/**
 * Loaded by `SiteTracking`. The banner sits inside the tracker so
 * `useTracking()` reaches it. Sign-in does not live here: a blocker that
 * stops this chunk must never stop sign-in (studio issue #596), so the
 * sign-in island mounts on its own in `MarketingShell`.
 */
export default function SiteTrackingSdk() {
  return (
    <BuildBaseTracking {...TRACKING_APP} {...TRACKING}>
      <LiteCookieBanner privacyHref="/privacy" />
    </BuildBaseTracking>
  );
}

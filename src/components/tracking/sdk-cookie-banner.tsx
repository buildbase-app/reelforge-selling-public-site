'use client';

import '@/lib/zod-jitless';
import { useEffect } from 'react';
import { CookieBanner, openCookieBanner } from '@buildbase/sdk/react';

/**
 * The SDK's own cookie banner, loaded when a visitor presses "Choose" in
 * `LiteCookieBanner`, and opened on its per-category switches. It works
 * without `SaaSProvider`: it answers through the page's `BuildBaseTracking`
 * (one shared tracking context) and has English copy built in.
 */
export default function SdkCookieBanner({
  privacyHref,
}: {
  privacyHref: string;
}) {
  useEffect(() => {
    openCookieBanner();
  }, []);
  return (
    <CookieBanner
      privacyHref={privacyHref}
      buttons="accept-primary"
      className="rf-consent"
    />
  );
}

'use client';

import { clientOnly } from '@/components/client-only';

/**
 * BuildBase tracking for the provider-free public pages (studio issue #79):
 * `BuildBaseTracking` from `@buildbase/sdk/tracking` (no UI dependencies)
 * and the cookie banner, loaded right after the page hydrates instead of
 * with it. Sign-in is not part of it (see `MarketingShell`). Pages inside `SaaSProvider` get the same
 * tracking from the provider's `tracking` option instead.
 */
export const SiteTracking = clientOnly(
  // Inlined at build time: no server copy of this client-only chunk.
  () =>
    typeof window === 'undefined'
      ? new Promise<never>(() => {})
      : import('./site-tracking-sdk')
);

'use client';

import { clientOnly } from '@/components/client-only';

/**
 * BuildBase tracking for the provider-free public pages (studio issue #79):
 * `BuildBaseTracking` from `@buildbase/sdk/tracking` (no UI dependencies),
 * the cookie banner and the sign-in island, loaded right after the page
 * hydrates instead of with it. Pages inside `SaaSProvider` get the same
 * tracking from the provider's `tracking` option instead.
 */
export const SiteTracking = clientOnly(
  // Inlined at build time: no server copy of this client-only chunk.
  () =>
    typeof window === 'undefined'
      ? new Promise<never>(() => {})
      : import('./site-tracking-sdk')
);

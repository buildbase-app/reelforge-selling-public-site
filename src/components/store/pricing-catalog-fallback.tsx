'use client';

import { clientOnly } from '@/components/client-only';
import { Loader2 } from '@/components/icons/lite';

/**
 * Only when a provider-free page could not read the store on the server:
 * the provider-backed catalog loads on demand and reads it in the browser.
 */
export const PricingCatalogFallback = clientOnly(
  // Inlined at build time: keeps this import (and a copy of the SDK) out of
  // the server bundle.
  () =>
    typeof window === 'undefined'
      ? new Promise<never>(() => {})
      : import('./pricing-catalog-island'),
  <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
    <Loader2 className="h-4 w-4 animate-spin" />
    Loading what is on sale…
  </div>
);

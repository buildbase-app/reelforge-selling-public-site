'use client';

import '@/lib/zod-jitless';
import { usePublishedItems } from '@buildbase/sdk/react';

/**
 * The ReelForge store's own items (the app owner's store, seller
 * `{ type: 'org' }`), as buyers read them. Prices, variants and what each
 * includes come from BuildBase; nothing about them is written in this repo.
 * A module constant, so the hook's query stays the same between renders.
 */
const OWN_STORE = { seller: { type: 'org' as const }, limit: 20 };

export function useStoreItems() {
  return usePublishedItems(OWN_STORE);
}

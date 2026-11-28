/**
 * The buy-related sentences on the home and pricing pages, one set per sale
 * state, so they switch at the same moment as the buttons (`saleState` in
 * store-ctas.tsx; studio issue #553). Before launch nothing says "buy" or
 * "claim": it says coming soon and points to the waitlist.
 *
 * - `paid`: a paid Commercial price is on sale.
 * - `free`: only the free Personal key can be claimed.
 * - `none`: nothing is on sale, or the store read failed.
 */
export type SaleState = 'paid' | 'free' | 'none';

/** Step 2 of "Three steps to your first reel". */
export const LICENCE_STEP: Record<SaleState, string> = {
  paid: 'Claim the free Personal key, or buy a Commercial key, on this site. The server checks it once a day and keeps rendering for 14 days without a connection.',
  free: 'Claim the free Personal key on this site; Commercial keys go on sale soon. The server checks the key once a day and keeps rendering for 14 days without a connection.',
  none: 'Licence keys go on sale on this site soon: join the waitlist to hear the day. The server checks the key once a day and keeps rendering for 14 days without a connection.',
};

/** The sentence under "Give your agent a render server". */
export const FINAL_CTA: Record<SaleState, string> = {
  paid: 'Start with the free Personal licence. Move to Commercial when it starts earning.',
  free: 'Start with the free Personal licence. Commercial licences go on sale soon.',
  none: 'RenderWeld goes on sale soon. Join the waitlist to hear the day it opens.',
};

/** The `pricing` message key for the subtitle above the prices. */
export const PRICING_SUBTITLE_KEY: Record<
  SaleState,
  'subtitle' | 'subtitleFree' | 'subtitleComingSoon'
> = {
  paid: 'subtitle',
  free: 'subtitleFree',
  none: 'subtitleComingSoon',
};

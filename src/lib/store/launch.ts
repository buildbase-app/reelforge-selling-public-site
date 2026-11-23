/**
 * The launch price window (founder decision, studio issue #91): launch
 * prices last until 16 December 2026, 13:00 UTC. This is the one place the
 * store keeps that date.
 *
 * Contest rules require the real end date wherever a launch price is shown
 * (studio issues #127, #260). The console content block `launch-price-note`
 * says it in the founder's words, but it can only be read with the org API
 * token, so `getLaunchPriceNote` (src/lib/platform/blocks.ts) shows the note
 * below whenever that block is missing, unreadable or does not state this
 * date. After the end date no launch note is shown at all.
 *
 * No prices here: they always come from the BuildBase items.
 *
 * The note is about prices, so it shows only where a price can be paid: when
 * the store has at least one paid Commercial variant on sale, or when the
 * server could not tell (the browser then reads the prices, and a launch
 * price must never appear without its end date). With nothing on sale ("Not
 * on sale yet") there is no note (studio issue #266).
 */
import type { PublicItemView } from '@buildbase/sdk';
import { editionOf } from './edition';

/** When the launch price ends, as an exact instant. */
export const LAUNCH_PRICE_ENDS_AT = new Date('2026-12-16T13:00:00Z');

/** The same instant as buyers read it (and as the content block says it). */
export const LAUNCH_PRICE_ENDS_LABEL = '16 December 2026, 13:00 UTC';

/** The built-in note, shown when the content block can't be used. */
export const LAUNCH_PRICE_FALLBACK_NOTE = `Launch prices end ${LAUNCH_PRICE_ENDS_LABEL}. Regular prices apply after that.`;

/** True until the launch price ends. */
export function isLaunchPriceActive(now: Date = new Date()): boolean {
  return now.getTime() < LAUNCH_PRICE_ENDS_AT.getTime();
}

/** True when a text states the launch price's end date (spacing ignored). */
export function statesLaunchEnd(text: string): boolean {
  return text.replace(/\s+/g, ' ').includes(LAUNCH_PRICE_ENDS_LABEL);
}

/**
 * Whether a paid Commercial variant is on sale: true or false from a server
 * read of the store (`source: 'server'`), undefined when the read failed and
 * nobody knows yet. A variant is on sale when its current (not retired)
 * price is one a buyer pays: anything but `free`.
 */
export function paidCommercialOnSale(store: {
  source: 'server' | 'unavailable';
  items: PublicItemView[];
}): boolean | undefined {
  if (store.source !== 'server') return undefined;
  return store.items.some(
    (item) =>
      editionOf(item) === 'commercial' &&
      item.variants.some((variant) => {
        const price = variant.prices.find((p) => !p.retired);
        return price !== undefined && price.mode !== 'free';
      })
  );
}

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
 */

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

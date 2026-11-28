/**
 * The owner's bar for the public showcase (studio issue #807): a reel is
 * shown on /gallery or in the home page showcase only with at least 1000
 * HTML components, at least 1000 animations or effects, at least 10 sound
 * effects, and music. A count nobody recorded counts as below the bar.
 */
export const GALLERY_BAR = {
  htmlComponents: 1000,
  animations: 1000,
  soundEffects: 10,
} as const;

/** What a reel's data records about it, `null` where it was not counted. */
export interface ReelCounts {
  htmlComponents: number | null;
  /** Animations or effects. */
  animations: number | null;
  soundEffects: number | null;
  music: boolean | null;
}

export const UNCOUNTED: ReelCounts = {
  htmlComponents: null,
  animations: null,
  soundEffects: null,
  music: null,
};

/** Each way a reel falls short of the bar, in plain words; empty when it meets it. */
export function belowBar(counts: ReelCounts | null | undefined): string[] {
  const c = counts ?? UNCOUNTED;
  const short: string[] = [];
  const atLeast = (n: number | null, min: number, what: string) => {
    if (n === null) short.push(`${what} not counted`);
    else if (n < min) short.push(`${n} ${what}, needs ${min}`);
  };
  atLeast(c.htmlComponents, GALLERY_BAR.htmlComponents, 'HTML components');
  atLeast(c.animations, GALLERY_BAR.animations, 'animations or effects');
  atLeast(c.soundEffects, GALLERY_BAR.soundEffects, 'sound effects');
  if (c.music !== true)
    short.push(c.music === null ? 'music not recorded' : 'no music');
  return short;
}

export function meetsGalleryBar(
  counts: ReelCounts | null | undefined
): boolean {
  return belowBar(counts).length === 0;
}

/** A count from a record field: a whole number of at least 0, else null. */
export function countOf(v: unknown): number | null {
  const n =
    typeof v === 'number'
      ? v
      : typeof v === 'string' && v.trim()
        ? Number(v)
        : NaN;
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/** Music from a record field: true, false, or null when not recorded. */
export function musicOf(v: unknown): boolean | null {
  if (v === true || v === 'true' || v === 'yes') return true;
  if (v === false || v === 'false' || v === 'no') return false;
  return null;
}

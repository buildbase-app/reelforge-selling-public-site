import showcase from '@/data/showcase.json';
import { reels, type Reel } from '@/lib/agents/catalog';
import { meetsGalleryBar, type ReelCounts } from './bar';

/**
 * The home page showcase under the gallery bar (studio issue #807): the
 * reel rail and the poster marquee list only entries marked shown whose
 * recorded counts meet the bar. Entries below it stay in
 * src/data/showcase.json (and their files in the repo), just not on the page.
 */
export interface ShowcaseEntry {
  shown: boolean;
  /** Absent when nobody counted: below the bar. */
  counts?: ReelCounts;
}

export interface RailEntry extends ShowcaseEntry {
  slug: string;
}

export interface MarqueeEntry extends ShowcaseEntry {
  /** `public/reels/marquee/<file>.webp`; the name ends in the file's hash. */
  file: string;
  row: number;
}

export const railEntries = showcase.rail as RailEntry[];
export const marqueeEntries = showcase.marquee as MarqueeEntry[];

export function isShowcased(entry: ShowcaseEntry): boolean {
  return entry.shown && meetsGalleryBar(entry.counts);
}

/** The demo reels the home page rail shows, in reels.json order. */
export function showcaseReels(entries: RailEntry[] = railEntries): Reel[] {
  const ok = new Set(entries.filter(isShowcased).map((e) => e.slug));
  return reels.filter((r) => ok.has(r.slug));
}

/** The marquee's poster files by row; rows with none shown are empty. */
export function marqueeRows(
  entries: MarqueeEntry[] = marqueeEntries
): [string[], string[]] {
  const shown = entries.filter(isShowcased);
  return [
    shown.filter((e) => e.row === 0).map((e) => e.file),
    shown.filter((e) => e.row === 1).map((e) => e.file),
  ];
}

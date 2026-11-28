import fs from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));
import showcase from '@/data/showcase.json';
import { reels } from '@/lib/agents/catalog';
import {
  GALLERY_BAR,
  belowBar,
  meetsGalleryBar,
  type ReelCounts,
} from '@/lib/gallery/bar';
import { toReels, type GalleryRecordData } from '@/lib/gallery/model';
import {
  agentsEntries,
  agentsVideoSlugs,
  heroDemoShown,
  heroEntry,
  isShowcased,
  transcriptEntry,
  transcriptReelShown,
  marqueeEntries,
  marqueeRows,
  railEntries,
  showcaseReels,
  type MarqueeEntry,
  type RailEntry,
} from '@/lib/gallery/showcase';
import { ReelGallery, ReelMarquee } from '@/components/product/home-sections';

/**
 * The owner's gallery bar (studio issue #807): at least 1000 HTML
 * components, 1000 animations or effects, 10 sound effects, and music, or
 * the reel stays out of /gallery and the home page showcase.
 */

const AT_BAR_RECORD = {
  htmlComponents: GALLERY_BAR.htmlComponents,
  animations: GALLERY_BAR.animations,
  soundEffects: GALLERY_BAR.soundEffects,
  music: true,
};
const AT_BAR: ReelCounts = AT_BAR_RECORD;

describe('the bar', () => {
  it('lets a reel exactly at the bar through', () => {
    expect(belowBar(AT_BAR)).toEqual([]);
    expect(meetsGalleryBar(AT_BAR)).toBe(true);
  });

  it('keeps out a reel one short on any count, or without music', () => {
    expect(meetsGalleryBar({ ...AT_BAR, htmlComponents: 999 })).toBe(false);
    expect(meetsGalleryBar({ ...AT_BAR, animations: 999 })).toBe(false);
    expect(meetsGalleryBar({ ...AT_BAR, soundEffects: 9 })).toBe(false);
    expect(meetsGalleryBar({ ...AT_BAR, music: false })).toBe(false);
  });

  it('treats a count nobody recorded as below the bar', () => {
    expect(meetsGalleryBar(null)).toBe(false);
    expect(belowBar({ ...AT_BAR, soundEffects: null })).toEqual([
      'sound effects not counted',
    ]);
    expect(meetsGalleryBar({ ...AT_BAR, music: null })).toBe(false);
  });
});

describe('the gallery collection', () => {
  const record = (
    slug: string,
    counts: Partial<GalleryRecordData>
  ): { data: GalleryRecordData } => ({
    data: {
      slug,
      title: slug,
      mp4Path: `gallery/${slug}/${slug}.0123456789ab.mp4`,
      posterPath: `gallery/${slug}/poster.0123456789ab.jpg`,
      status: 'published',
      ...counts,
    },
  });

  it('shows only records whose counts meet the bar, hidden ones included', () => {
    const records = [
      record('meets', AT_BAR_RECORD),
      record('short', { ...AT_BAR_RECORD, soundEffects: 3 }),
      record('uncounted', {}),
    ];
    expect(toReels(records).map((r) => r.slug)).toEqual(['meets']);
    expect(
      toReels(records, { includeHidden: true }).map((r) => r.slug)
    ).toEqual(['meets']);
  });

  it('records the counts on each reel', () => {
    const [reel] = toReels([
      record('meets', {
        htmlComponents: 1400,
        animations: 1100,
        soundEffects: 14,
        music: true,
      }),
    ]);
    expect(reel!.counts).toEqual({
      htmlComponents: 1400,
      animations: 1100,
      soundEffects: 14,
      music: true,
    });
  });
});

describe('the home page showcase data (src/data/showcase.json)', () => {
  const entries = [
    ...railEntries,
    ...marqueeEntries,
    heroEntry,
    transcriptEntry,
    ...agentsEntries,
  ];

  it('fails when a reel below the bar is marked as shown', () => {
    for (const entry of entries)
      if (entry.shown)
        expect(
          belowBar(entry.counts),
          `${'slug' in entry ? entry.slug : entry.file} is marked shown`
        ).toEqual([]);
  });

  it('records all four counts wherever counts are given', () => {
    for (const entry of entries)
      if (entry.counts)
        expect(Object.keys(entry.counts).sort()).toEqual([
          'animations',
          'htmlComponents',
          'music',
          'soundEffects',
        ]);
  });

  it('lists every demo reel and existing poster files', () => {
    expect(railEntries.map((e) => e.slug).sort()).toEqual(
      reels.map((r) => r.slug).sort()
    );
    for (const e of marqueeEntries)
      expect(
        fs.existsSync(
          path.join(process.cwd(), 'public/reels/marquee', `${e.file}.webp`)
        ),
        e.file
      ).toBe(true);
    expect(showcase.marquee.length).toBe(16);
    expect(agentsEntries.map((e) => e.slug).sort()).toEqual(
      reels.map((r) => r.slug).sort()
    );
    for (const ext of ['mp4', 'webm', 'jpg'])
      expect(
        fs.existsSync(
          path.join(
            process.cwd(),
            'public/walkthroughs',
            `${heroEntry.file}.${ext}`
          )
        ),
        `${heroEntry.file}.${ext}`
      ).toBe(true);
  });

  it('applies the bar to the hero session and the /agents videos', () => {
    expect(heroDemoShown({ ...heroEntry, shown: true, counts: AT_BAR })).toBe(
      true
    );
    expect(heroDemoShown({ ...heroEntry, shown: true })).toBe(false);
    expect(
      transcriptReelShown({ ...transcriptEntry, shown: true, counts: AT_BAR })
    ).toBe(true);
    expect(transcriptReelShown({ ...transcriptEntry, shown: true })).toBe(
      false
    );
    expect([
      ...agentsVideoSlugs([
        { slug: 'a', shown: true, counts: AT_BAR },
        { slug: 'b', shown: true },
        { slug: 'c', shown: false, counts: AT_BAR },
      ]),
    ]).toEqual(['a']);
  });

  it('shows an entry only when it is marked shown and meets the bar', () => {
    const rail: RailEntry[] = [
      { slug: reels[0]!.slug, shown: true, counts: AT_BAR },
      { slug: reels[1]!.slug, shown: false, counts: AT_BAR },
      {
        slug: reels[2]!.slug,
        shown: true,
        counts: { ...AT_BAR, music: false },
      },
    ];
    expect(showcaseReels(rail).map((r) => r.slug)).toEqual([reels[0]!.slug]);
    const marquee: MarqueeEntry[] = [
      { file: 'a', row: 0, shown: true, counts: AT_BAR },
      { file: 'b', row: 1, shown: true, counts: { ...AT_BAR, animations: 5 } },
    ];
    expect(marqueeRows(marquee)).toEqual([['a'], []]);
    expect(isShowcased({ shown: true, counts: AT_BAR })).toBe(true);
  });

  it('leaves the rail and the marquee out while nothing meets the bar', () => {
    if (showcaseReels().length === 0) {
      const { container } = render(<ReelGallery />);
      expect(container.innerHTML).toBe('');
    }
    const [a, b] = marqueeRows();
    if (a.length + b.length === 0) {
      const { container } = render(<ReelMarquee />);
      expect(container.innerHTML).toBe('');
    }
  });
});

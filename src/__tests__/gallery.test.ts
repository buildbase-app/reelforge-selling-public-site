import { describe, expect, it } from 'vitest';
import {
  agentSnippet,
  applyFilter,
  categories,
  filterHref,
  isoDuration,
  mediaOrigin,
  mediaUrl,
  parseFilter,
  toReel,
  toReels,
  videoObject,
  type GalleryRecordData,
} from '@/lib/gallery/model';

/**
 * The gallery's data model: BuildBase `gallery` records (written by the
 * studio's `pnpm gallery publish`) become reels; hidden or broken records
 * never reach a page; filters come from URL parameters.
 */

function record(
  slug: string,
  extra: Partial<GalleryRecordData> = {}
): { data: GalleryRecordData } {
  return {
    data: {
      slug,
      title: `Reel ${slug}`,
      description: 'A reel',
      category: 'Data story',
      tags: 'data, charts',
      engines: ['remotion', 'html'],
      theme: 'midnight',
      durationSeconds: 16,
      frames: 480,
      fps: 30,
      renderSeconds: 142.8,
      hardware: 'Intel Xeon, 4 cores, 16 GB RAM, Linux',
      studioVersion: '0.1.0',
      renderedAt: '2026-11-21T20:13:53.631Z',
      prompt: 'Make a reel.',
      tools: 'create_project, validate_project, render_project',
      mcpCalls: 9,
      manifestPath: `gallery/${slug}/manifest.0123456789ab.json`,
      posterPath: `gallery/${slug}/poster.0123456789ab.jpg`,
      posterAvifPath: `gallery/${slug}/poster.0123456789ab.avif`,
      posterSmallPath: `gallery/${slug}/poster-360.0123456789ab.jpg`,
      posterSmallAvifPath: `gallery/${slug}/poster-360.0123456789ab.avif`,
      mp4Path: `gallery/${slug}/${slug}.0123456789ab.mp4`,
      webmPath: `gallery/${slug}/${slug}.0123456789ab.webm`,
      mp4Bytes: 700000,
      status: 'published',
      featured: false,
      order: 10,
      ...extra,
    },
  };
}

describe('gallery records', () => {
  it('turns a record into a reel with media URLs on the configured origin', () => {
    const reel = toReel(record('city-data').data, 'http://127.0.0.1:8787/')!;
    expect(reel.mp4).toBe(
      'http://127.0.0.1:8787/gallery/city-data/city-data.0123456789ab.mp4'
    );
    expect(reel.poster.avifSmall).toMatch(/poster-360\.0123456789ab\.avif$/);
    expect(reel.manifestUrl).toMatch(/manifest\.0123456789ab\.json$/);
    expect(reel).toMatchObject({
      categorySlug: 'data-story',
      tags: ['data', 'charts'],
      tools: ['create_project', 'validate_project', 'render_project'],
      published: true,
    });
  });

  it('drops records without media, with a bad slug, or with a path outside gallery/', () => {
    expect(toReel(record('x', { mp4Path: '' }).data)).toBeNull();
    expect(toReel(record('Bad Slug').data)).toBeNull();
    expect(
      toReel(record('evil', { posterPath: 'https://evil.example/x.jpg' }).data)
    ).toBeNull();
    expect(
      toReel(record('evil', { webmPath: 'gallery/../../secret' }).data)
    ).toBeNull();
  });

  it('shows published reels only (unless asked), once each, featured first then by order', () => {
    const reels = toReels([
      record('b', { order: 20 }),
      record('a', { order: 30, featured: true }),
      record('c', { order: 10, status: 'hidden' }),
      record('b', { order: 5 }),
    ]);
    expect(reels.map((r) => r.slug)).toEqual(['a', 'b']);
    expect(
      toReels([record('c', { status: 'hidden' })], { includeHidden: true })
    ).toHaveLength(1);
  });
});

describe('gallery filters', () => {
  const reels = toReels([
    record('a', { category: 'Recipe', engines: ['html'] }),
    record('b', { category: 'Recipe', engines: ['hyperframes', 'html'] }),
    record('c', { category: 'Before & after', engines: ['remotion'] }),
  ]);

  it('reads known categories and engines from the URL and ignores the rest', () => {
    expect(parseFilter({ category: 'recipe', engine: 'html' }, reels)).toEqual({
      category: 'recipe',
      engine: 'html',
    });
    expect(parseFilter({ category: 'nope', engine: 'flash' }, reels)).toEqual({
      category: null,
      engine: null,
    });
    expect(
      parseFilter({ category: ['before-and-after'] }, reels).category
    ).toBe('before-and-after');
  });

  it('filters by both and builds the links', () => {
    expect(
      applyFilter(reels, { category: 'recipe', engine: 'hyperframes' }).map(
        (r) => r.slug
      )
    ).toEqual(['b']);
    expect(categories(reels)).toEqual([
      { slug: 'recipe', label: 'Recipe', count: 2 },
      { slug: 'before-and-after', label: 'Before & after', count: 1 },
    ]);
    expect(filterHref({ category: 'recipe', engine: null })).toBe(
      '/gallery?category=recipe'
    );
    expect(filterHref({})).toBe('/gallery');
  });
});

describe('gallery media and SEO helpers', () => {
  it('joins URLs and finds the CSP origin', () => {
    expect(mediaUrl('https://m.example/', '/gallery/a/b.mp4')).toBe(
      'https://m.example/gallery/a/b.mp4'
    );
    expect(mediaOrigin('https://media.example/base')).toBe(
      'https://media.example'
    );
    expect(mediaOrigin(undefined)).toBe(
      'https://media.reelforge.buildbase.app'
    );
    expect(mediaOrigin('not a url')).toBeNull();
  });

  it('writes ISO 8601 durations and a VideoObject', () => {
    expect(isoDuration(16)).toBe('PT16S');
    expect(isoDuration(75.5)).toBe('PT1M15.5S');
    expect(isoDuration(120)).toBe('PT2M');
    const reel = toReel(record('a').data)!;
    const v = videoObject(reel, 'https://renderweld.com/gallery/a');
    expect(v).toMatchObject({
      '@type': 'VideoObject',
      name: 'Reel a',
      contentUrl: reel.mp4,
      thumbnailUrl: [reel.poster.jpg],
      duration: 'PT16S',
      uploadDate: '2026-11-21T20:13:53.631Z',
    });
  });

  it('gives the agent the prompt and the manifest to start from', () => {
    const s = agentSnippet(toReel(record('a').data)!);
    expect(s).toMatch(/^Make a reel\./);
    expect(s).toMatch(/manifest\.0123456789ab\.json/);
    expect(s).toMatch(/create_project/);
  });
});

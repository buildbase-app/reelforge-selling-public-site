import { describe, expect, it, vi } from 'vitest';
import { robotsTxt } from '@buildbase/sdk';
import { toChangelogPost, toChangelogPosts } from '@/lib/blog/changelog';
import { buildFeed } from '@/lib/blog/feed';
import { robotsConfig } from '@/lib/seo/robots';

vi.mock('server-only', () => ({}));
vi.mock('@/env', () => ({ siteUrl: 'https://renderweld.com' }));
vi.mock('@/lib/gallery', () => ({ getGallery: async () => [] }));
vi.mock('@/lib/docs/source', () => ({
  getDocsSite: async () => ({
    nav: {
      sections: [],
      rootPages: [],
      pages: [
        {
          href: '/docs/start/quick-start',
          updatedAt: '2026-11-22T09:40:43.203Z',
        },
      ],
    },
    docs: [],
  }),
}));
vi.mock('@/lib/blog/source', async () => {
  const { toChangelogPosts: map } = await import('@/lib/blog/changelog');
  return {
    getPosts: async (kind: string) =>
      kind === 'changelog'
        ? map([record(), record({ slug: 'renderweld', date: '2026-11-24' })])
        : [],
  };
});

/** A record as `GET /api/collections/data/changelog?latest=true` returns it. */
function record(
  data: Record<string, unknown> = {},
  over: Record<string, unknown> = {}
) {
  return {
    _id: 'r1',
    archived: false,
    createdAt: '2026-11-24T20:05:38.135Z',
    updatedAt: '2026-11-24T20:05:38.135Z',
    data: {
      title: 'Store early access',
      slug: 'v0-1-0',
      date: '2026-11-21',
      version: '0.1.0',
      description: 'The store opens for early access.',
      content: '## Highlights\n\n- **Public store.** ' + 'word '.repeat(200),
      published: true,
      ...data,
    },
    ...over,
  };
}

describe('toChangelogPost', () => {
  it('maps a published record into a release note', () => {
    const post = toChangelogPost(record())!;
    expect(post).toMatchObject({
      id: 'r1',
      kind: 'changelog',
      slug: 'v0-1-0',
      title: 'Store early access',
      description: 'The store opens for early access.',
      date: '2026-11-21T00:00:00.000Z',
      updated: '2026-11-24T20:05:38.135Z',
      version: '0.1.0',
      authors: [],
      tags: [],
      readingTime: '1 min read',
    });
    expect(post.markdown).toContain('## Highlights');
    expect(post.image).toBeUndefined();
  });

  it('never shows a draft, an archived record or one without slug, title or date', () => {
    expect(toChangelogPost(record({ published: false }))).toBeNull();
    expect(toChangelogPost(record({ published: undefined }))).toBeNull();
    expect(toChangelogPost(record({}, { archived: true }))).toBeNull();
    expect(toChangelogPost(record({ slug: '' }))).toBeNull();
    expect(toChangelogPost(record({ slug: '../etc' }))).toBeNull();
    expect(toChangelogPost(record({ slug: 'Has Spaces' }))).toBeNull();
    expect(toChangelogPost(record({ title: '  ' }))).toBeNull();
    expect(toChangelogPost(record({ date: 'soon' }))).toBeNull();
    expect(toChangelogPost(record({ published: 'true' }))).not.toBeNull();
  });

  it('reads the version from the field, a leading v, or a v1-2-0 slug', () => {
    expect(toChangelogPost(record({ version: 'v1.2.0' }))!.version).toBe(
      '1.2.0'
    );
    expect(
      toChangelogPost(record({ version: '', slug: 'v2-0-1' }))!.version
    ).toBe('2.0.1');
    expect(
      toChangelogPost(record({ version: 'next', slug: 'renderweld' }))!.version
    ).toBeUndefined();
  });

  it('keeps an https share image only', () => {
    expect(
      toChangelogPost(record({ image: 'https://cdn.test/og.png' }))!.image
    ).toBe('https://cdn.test/og.png');
    expect(
      toChangelogPost(record({ image: 'http://cdn.test/og.png' }))!.image
    ).toBeUndefined();
    expect(
      toChangelogPost(record({ image: 'https://placehold.co/1200x630.png' }))!
        .image
    ).toBeUndefined();
  });

  it('says "updated" only for an edit on a later day than the release', () => {
    expect(
      toChangelogPost(
        record({ date: '2026-11-24' }, { updatedAt: '2026-11-24T20:00:00Z' })
      )!.updated
    ).toBeUndefined();
  });
});

describe('toChangelogPosts', () => {
  it('lists newest first, one entry per slug', () => {
    const posts = toChangelogPosts([
      record({ slug: 'a', date: '2026-11-22' }),
      record({ slug: 'b', date: '2026-11-24' }),
      record({ slug: 'a', date: '2026-11-23', title: 'Duplicate' }),
      record({ slug: 'c', date: '2026-11-23', published: false }),
    ]);
    expect(posts.map((p) => p.slug)).toEqual(['b', 'a']);
    expect(posts[1].title).toBe('Store early access');
  });
});

describe('changelog feed', () => {
  it('is RSS with one item per release note, its version and summary', () => {
    const xml = buildFeed(
      toChangelogPosts([
        record(),
        record({ slug: 'renderweld', date: '2026-11-24', version: '' }),
      ]),
      {
        title: 'RenderWeld Changelog',
        description: 'Releases.',
        siteUrl: 'https://renderweld.com/changelog',
        feedUrl: 'https://renderweld.com/changelog/feed.xml',
        postUrl: (slug) => `https://renderweld.com/changelog/${slug}`,
        imageUrl: 'https://renderweld.com/logo.png',
        language: 'en',
      }
    );
    expect(xml).toContain('<rss');
    expect(xml.match(/<item>/g)?.length).toBe(2);
    expect(xml).toContain('<title><![CDATA[Store early access (v0.1.0)]]>');
    expect(xml).toContain(
      '<guid isPermaLink="true">https://renderweld.com/changelog/v0-1-0</guid>'
    );
    expect(xml).toContain('The store opens for early access.');
    expect(xml.indexOf('/changelog/renderweld<')).toBeLessThan(
      xml.indexOf('/changelog/v0-1-0<')
    );
    expect(xml).toContain(
      '<atom:link href="https://renderweld.com/changelog/feed.xml"'
    );
  });
});

describe('sitemap', () => {
  it('lists every release note and docs page with its lastmod', async () => {
    const { default: sitemap } = await import('@/app/sitemap');
    const entries = await sitemap();
    const byUrl = new Map(entries.map((e) => [e.url, e]));
    expect(byUrl.get('https://renderweld.com/changelog/v0-1-0')).toMatchObject({
      lastModified: '2026-11-24T20:05:38.135Z',
    });
    expect(
      byUrl.get('https://renderweld.com/changelog/renderweld')
    ).toMatchObject({ lastModified: '2026-11-24T00:00:00.000Z' });
    expect(byUrl.get('https://renderweld.com/changelog')?.lastModified).toBe(
      '2026-11-24T00:00:00.000Z'
    );
    expect(
      byUrl.get('https://renderweld.com/docs/start/quick-start')?.lastModified
    ).toBe('2026-11-22T09:40:43.203Z');
    for (const e of entries) {
      expect(e.url).not.toMatch(/\/(api|dashboard|order)(\/|$)|feed\.xml/);
    }
  });
});

describe('robots.txt', () => {
  it('production allows the public pages and lists the sitemap', () => {
    const txt = robotsTxt({
      ...robotsConfig(false, 'https://renderweld.com'),
      siteUrl: 'https://renderweld.com',
    });
    expect(txt).toMatch(
      /User-agent: \*\nContent-Signal: search=yes, ai-input=yes\nAllow: \/\nDisallow: \/api\//
    );
    expect(txt).toContain('Disallow: /dashboard/');
    expect(txt).toContain('User-agent: GPTBot');
    expect(txt).toContain('Sitemap: https://renderweld.com/sitemap.xml');
    expect(txt).not.toMatch(/^Disallow: \/$/m);
  });

  it('the test copy disallows everything and lists no sitemap', () => {
    const txt = robotsTxt({
      ...robotsConfig(true, 'https://dev.renderweld.com'),
      siteUrl: 'https://dev.renderweld.com',
    });
    expect(txt).toMatch(
      /User-agent: \*\n(Content-Signal: search=no, ai-input=no\n)?Disallow: \/$/m
    );
    expect(txt).not.toMatch(/^Allow:/m);
    expect(txt).not.toContain('Sitemap:');
  });
});

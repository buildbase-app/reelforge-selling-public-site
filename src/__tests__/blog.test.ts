import { describe, expect, it } from 'vitest';
import type { BlogPost as BuildBaseBlogPost } from '@buildbase/sdk/server';
import {
  authorsOf,
  isPlaceholderImage,
  relatedPosts,
  tagsOf,
  toBlogPost,
  toBlogPosts,
  versionFromSlug,
} from '@/lib/blog/posts';
import { buildFeed } from '@/lib/blog/feed';
import { postMarkdown } from '@/lib/blog/twin';
import { pathsForWebhookEvent } from '@/lib/cache/webhook-tags';
import { renderMarkdown } from '@/lib/platform/markdown';

/** A post as `GET /api/blogs` returns it (folder, authors, tags populated). */
function apiPost(over: Partial<BuildBaseBlogPost> = {}): BuildBaseBlogPost {
  return {
    _id: 'p1',
    title: 'Introducing ReelForge (early access)',
    slug: 'introducing-reelforge',
    description: 'What ReelForge is.',
    content:
      '## How it is licensed\n\nSource-available. ' + 'word '.repeat(398),
    image: 'https://placehold.co/1200x630.png',
    published: true,
    publishedAt: '2026-11-21T19:23:33.161Z',
    createdAt: '2026-11-21T19:23:32.595Z',
    updatedAt: '2026-11-21T19:23:33.175Z',
    seo: { title: 'x', description: 'x', keywords: [] },
    folder: {
      _id: 'f1',
      name: 'Blog',
      slug: 'blog',
      path: '',
      parentFolder: null,
      subFolders: [],
    },
    authors: [
      {
        _id: 'a1',
        name: 'ReelForge team',
        username: 'team',
        image: '',
        links: { twitter: '@reelforge' },
      },
    ],
    tags: [
      { _id: 't2', title: 'Early access', slug: 'early-access', public: true },
      { _id: 't1', title: 'Announcement', slug: 'announcement', public: true },
    ],
    ...over,
  } as BuildBaseBlogPost;
}

const changelogFolder = {
  _id: 'f2',
  name: 'Changelog',
  slug: 'changelog',
  path: '',
  parentFolder: null,
  subFolders: [],
};

describe('toBlogPost (BuildBase Blogs -> page post)', () => {
  it('maps a published blog post', () => {
    const post = toBlogPost(apiPost())!;
    expect(post).toMatchObject({
      id: 'p1',
      kind: 'blog',
      slug: 'introducing-reelforge',
      title: 'Introducing ReelForge (early access)',
      description: 'What ReelForge is.',
      date: '2026-11-21T19:23:33.161Z',
      readingTime: '2 min read',
      authors: [
        {
          username: 'team',
          name: 'ReelForge team',
          links: { twitter: '@reelforge' },
        },
      ],
      // Sorted by title, whatever order the API sends.
      tags: [
        { slug: 'announcement', title: 'Announcement' },
        { slug: 'early-access', title: 'Early access' },
      ],
    });
    // Publishing bumps updatedAt; that is not an edit.
    expect(post.updated).toBeUndefined();
    // BuildBase's placeholder cover is no cover.
    expect(post.image).toBeUndefined();
    expect(post.version).toBeUndefined();
    expect(post.markdown).toContain('## How it is licensed');
  });

  it('keeps a real cover and a later edit date', () => {
    const post = toBlogPost(
      apiPost({
        image: 'https://cdn.example.com/cover.png',
        updatedAt: '2026-11-25T10:00:00.000Z',
      })
    )!;
    expect(post.image).toBe('https://cdn.example.com/cover.png');
    expect(post.updated).toBe('2026-11-25T10:00:00.000Z');
  });

  it('reads a changelog entry and its version from the slug', () => {
    const post = toBlogPost(
      apiPost({ slug: 'v0-1-0', folder: changelogFolder, tags: [] })
    )!;
    expect(post.kind).toBe('changelog');
    expect(post.version).toBe('0.1.0');
    expect(versionFromSlug('store-early-access')).toBeUndefined();
  });

  it('leaves out drafts, other folders, unpopulated folders and empty posts', () => {
    expect(toBlogPost(apiPost({ published: false }))).toBeNull();
    expect(
      toBlogPost(
        apiPost({ folder: { ...changelogFolder, slug: 'engineering' } })
      )
    ).toBeNull();
    expect(toBlogPost(apiPost({ folder: 'f1' }))).toBeNull();
    expect(toBlogPost(apiPost({ slug: '' }))).toBeNull();
    expect(toBlogPost(apiPost({ title: ' ' }))).toBeNull();
  });

  it('drops archived authors, hidden tags and unpopulated references', () => {
    const post = toBlogPost(
      apiPost({
        authors: [
          'a1',
          {
            _id: 'a2',
            name: 'Old',
            username: 'old',
            image: '',
            links: {},
            archived: true,
          },
        ] as never,
        tags: [
          't1',
          { _id: 't3', title: 'Hidden', slug: 'hidden', public: false },
        ] as never,
      })
    )!;
    expect(post.authors).toEqual([]);
    expect(post.tags).toEqual([]);
  });

  it('isPlaceholderImage', () => {
    expect(isPlaceholderImage('https://placehold.co/1200x630.png')).toBe(true);
    expect(isPlaceholderImage('not a url')).toBe(true);
    expect(isPlaceholderImage('https://cdn.example.com/a.png')).toBe(false);
  });
});

describe('lists', () => {
  const newer = apiPost({
    _id: 'p2',
    slug: 'second',
    title: 'Second',
    publishedAt: '2026-12-01T00:00:00.000Z',
    tags: [{ _id: 't1', title: 'Announcement', slug: 'announcement' }] as never,
  });
  const unrelated = apiPost({
    _id: 'p3',
    slug: 'third',
    title: 'Third',
    publishedAt: '2026-11-01T00:00:00.000Z',
    tags: [],
    authors: [
      { _id: 'a9', name: 'Ada', username: 'ada', image: '', links: {} },
    ] as never,
  });
  const posts = toBlogPosts([apiPost(), unrelated, newer, apiPost()]);

  it('sorts newest first and keeps one post per slug', () => {
    expect(posts.map((p) => p.slug)).toEqual([
      'second',
      'introducing-reelforge',
      'third',
    ]);
  });

  it('collects tags and authors', () => {
    expect(tagsOf(posts).map((t) => t.slug)).toEqual([
      'announcement',
      'early-access',
    ]);
    expect(authorsOf(posts).map((a) => a.username)).toEqual(['ada', 'team']);
  });

  it('relates posts by shared tags only', () => {
    expect(relatedPosts(posts[1], posts).map((p) => p.slug)).toEqual([
      'second',
    ]);
    expect(relatedPosts(posts[2], posts)).toEqual([]);
  });
});

describe('buildFeed (RSS)', () => {
  const posts = toBlogPosts([
    apiPost({
      title: 'Fish & <chips>',
      image: 'https://cdn.example.com/cover.webp',
    }),
    apiPost({
      _id: 'c1',
      slug: 'v0-1-0',
      title: 'Store early access',
      folder: changelogFolder,
      tags: [],
      authors: [],
    }),
  ]);
  const xml = buildFeed(posts, {
    title: 'ReelForge Blog',
    description: 'Posts',
    siteUrl: 'https://reelforge.example/blog',
    feedUrl: 'https://reelforge.example/blog/feed.xml',
    postUrl: (slug) => `https://reelforge.example/blog/${slug}`,
    imageUrl: 'https://reelforge.example/logo.png',
    language: 'en',
  });

  it('is RSS 2.0 with one item per post', () => {
    expect(xml).toContain('<rss');
    expect(xml).toContain('version="2.0"');
    expect(xml.match(/<item>/g)).toHaveLength(2);
    expect(xml).toContain('<language><![CDATA[en]]></language>');
  });

  it('uses the post URL as guid, the date, authors, tags and the cover', () => {
    expect(xml).toContain(
      '<guid isPermaLink="false">https://reelforge.example/blog/introducing-reelforge</guid>'
    );
    expect(xml).toContain('<pubDate>Sat, 21 Nov 2026 19:23:33 GMT</pubDate>');
    expect(xml).toContain(
      '<dc:creator><![CDATA[ReelForge team]]></dc:creator>'
    );
    expect(xml).toContain('<category><![CDATA[Announcement]]></category>');
    expect(xml).toContain(
      '<enclosure url="https://cdn.example.com/cover.webp" length="0" type="image/webp"/>'
    );
  });

  it('keeps titles as text and names the version of a release note', () => {
    expect(xml).toContain('<title><![CDATA[Fish & <chips>]]></title>');
    expect(xml).toContain(
      '<title><![CDATA[Store early access (v0.1.0)]]></title>'
    );
  });
});

describe('postMarkdown (Markdown twin)', () => {
  it('has the title, summary, facts and the body as written', () => {
    const post = toBlogPost(apiPost())!;
    const md = postMarkdown(post, 'https://reelforge.example/blog/x');
    expect(md.startsWith('# Introducing ReelForge (early access)\n')).toBe(
      true
    );
    expect(md).toContain('> What ReelForge is.');
    expect(md).toContain('**URL:** https://reelforge.example/blog/x');
    expect(md).toContain('**Published:** 2026-11-21');
    expect(md).toContain('**Author:** ReelForge team');
    expect(md).toContain('**Tags:** Announcement, Early access');
    expect(md).toContain('## How it is licensed');
  });
});

describe('rendering a post body', () => {
  it('gives headings ids for the table of contents and stays sanitised', () => {
    const { html } = renderMarkdown(
      '## How it is licensed\n\n<script>alert(1)</script><img src=x onerror="steal()">'
    );
    expect(html).toContain('<h2 id="md-how-it-is-licensed">');
    expect(html).not.toMatch(/<script|onerror|alert/i);
  });
});

describe('pathsForWebhookEvent (blog.*)', () => {
  it('names the blog and changelog pages, feeds, the post and the sitemap', () => {
    expect(
      pathsForWebhookEvent('blog.updated', { slug: 'introducing-reelforge' })
    ).toEqual([
      '/en/blog',
      '/en/blog/feed.xml',
      '/en/changelog',
      '/en/changelog/feed.xml',
      '/en/blog/introducing-reelforge',
      '/en/changelog/introducing-reelforge',
      '/sitemap.xml',
    ]);
  });

  it('ignores a slug that is not a plain slug', () => {
    expect(pathsForWebhookEvent('blog.deleted', { slug: '../x' })).toEqual([
      '/en/blog',
      '/en/blog/feed.xml',
      '/en/changelog',
      '/en/changelog/feed.xml',
      '/sitemap.xml',
    ]);
  });
});

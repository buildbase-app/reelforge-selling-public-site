// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  highlightsToMarkdown,
  mdxToMarkdown,
  parseFrontMatter,
  slugify,
  toBuildBaseAuthor,
  toBuildBasePost,
} from '../../scripts/content/blog-migration-lib.mjs';

/**
 * The Contentlayer -> BuildBase Blogs migration
 * (scripts/content/migrate-blog-to-buildbase.mjs): front matter and MDX in,
 * BuildBase post payloads out. The fixtures are the shapes the old files had.
 */

const POST = `---
title: Introducing ReelForge (early access)
description: What ReelForge is, how it is licensed, and what is and is not ready yet.
date: 2026-11-21
author: team
category: Announcement
tags: [announcement, early-access]
---

ReelForge is a studio.

## How it is licensed

- **Source-available.**
`;

const ENTRY = `---
date: 2026-11-21
title: Store early access
description: The ReelForge store is open for early access.
tag: Latest
version: 0.1.0
highlights:
  - kind: New
    title: Public store
    body: Home, pricing, help, blog and changelog pages.
  - kind: Fixed
    title: Waitlist.
    body: Leave a name and email.
---

This is the first release of the ReelForge store.
`;

describe('parseFrontMatter', () => {
  it('reads scalars, inline lists and lists of maps', () => {
    const { data, body } = parseFrontMatter(ENTRY);
    expect(data).toMatchObject({
      title: 'Store early access',
      version: '0.1.0',
      highlights: [
        {
          kind: 'New',
          title: 'Public store',
          body: 'Home, pricing, help, blog and changelog pages.',
        },
        { kind: 'Fixed', title: 'Waitlist.', body: 'Leave a name and email.' },
      ],
    });
    expect(body.trim()).toBe(
      'This is the first release of the ReelForge store.'
    );
    expect(parseFrontMatter(POST).data.tags).toEqual([
      'announcement',
      'early-access',
    ]);
    expect(parseFrontMatter('---\ndraft: true\n---\nx').data.draft).toBe(true);
  });

  it('refuses front matter it does not understand', () => {
    expect(() => parseFrontMatter('---\n  nested: {a: 1}\n---\n')).toThrow(
      /Unsupported/
    );
  });
});

describe('mdxToMarkdown', () => {
  it('removes imports, turns a Callout into a quote, keeps code as is', () => {
    const { markdown, issues } = mdxToMarkdown(
      'import X from \'./x\'\n\n<Callout type="warning">Back up first.</Callout>\n\n```tsx\n<Callout>{x}</Callout>\n```\n\nUse `<Foo>` here.'
    );
    expect(markdown).toContain('> **Warning:** Back up first.');
    expect(markdown).not.toContain('import X');
    expect(markdown).toContain('```tsx\n<Callout>{x}</Callout>\n```');
    expect(issues).toEqual(["removed MDX line: import X from './x'"]);
  });

  it('reports what it cannot convert', () => {
    const { issues } = mdxToMarkdown(
      '<WhenAuthenticated>Hi</WhenAuthenticated> {1 + 1}'
    );
    expect(issues).toEqual([
      'JSX component <WhenAuthenticated> left as is',
      'MDX expression {1 + 1} left as is',
    ]);
  });
});

describe('toBuildBasePost', () => {
  it('maps a blog post: title, summary, SEO, author, category and tags', () => {
    const post = toBuildBasePost({
      kind: 'blog',
      slug: 'introducing-reelforge',
      source: POST,
    });
    expect(post).toMatchObject({
      folder: 'blog',
      slug: 'introducing-reelforge',
      title: 'Introducing ReelForge (early access)',
      description:
        'What ReelForge is, how it is licensed, and what is and is not ready yet.',
      published: true,
      author: 'team',
      tags: [
        { slug: 'announcement', title: 'Announcement' },
        { slug: 'early-access', title: 'Early access' },
      ],
      seo: {
        title: 'Introducing ReelForge (early access)',
        keywords: ['Announcement', 'Early access'],
      },
      issues: [],
    });
    expect(post.content).toBe(
      'ReelForge is a studio.\n\n## How it is licensed\n\n- **Source-available.**\n'
    );
  });

  it('maps a changelog entry: highlights become a Markdown list', () => {
    const post = toBuildBasePost({
      kind: 'changelog',
      slug: 'v0-1-0',
      source: ENTRY,
    });
    expect(post.folder).toBe('changelog');
    expect(post.tags).toEqual([]);
    expect(post.content).toBe(
      '## Highlights\n\n- **New: Public store.** Home, pricing, help, blog and changelog pages.\n- **Fixed: Waitlist.** Leave a name and email.\n\nThis is the first release of the ReelForge store.\n'
    );
    expect(post.issues).toEqual([]);
    expect(post.notes.join('\n')).toContain('tag "Latest" dropped');
  });

  it('flags a version that the slug does not carry', () => {
    const post = toBuildBasePost({
      kind: 'changelog',
      slug: 'store-launch',
      source: ENTRY,
    });
    expect(post.issues[0]).toMatch(/version 0.1.0 does not match the slug/);
  });

  it('keeps drafts unpublished and flags "open source" wording', () => {
    const post = toBuildBasePost({
      kind: 'blog',
      slug: 'x',
      source:
        '---\ntitle: X\ndescription: Y\ndraft: true\n---\nReelForge is open source.',
    });
    expect(post.published).toBe(false);
    expect(post.issues).toEqual([
      'x: says "open source"; ReelForge is source-available',
    ]);
  });

  it('highlightsToMarkdown is empty without highlights', () => {
    expect(highlightsToMarkdown(undefined)).toBe('');
  });
});

describe('toBuildBaseAuthor', () => {
  it('keeps name, links and an absolute avatar; reports what has no field', () => {
    const author = toBuildBaseAuthor({
      username: 'team',
      source:
        '---\nname: ReelForge team\nrole: Builders\nbio: We build.\navatar: /team.png\ntwitter: reelforge\n---\nBody.',
    });
    expect(author).toEqual({
      username: 'team',
      name: 'ReelForge team',
      links: { twitter: 'reelforge' },
      notes: [
        'role "Builders" dropped (no author field)',
        'bio dropped (no author field)',
        'profile body dropped (no author field)',
        'avatar /team.png dropped (needs an absolute image URL)',
      ],
    });
  });

  it('slugify', () => {
    expect(slugify('Early Access!')).toBe('early-access');
    expect(slugify('Café déjà vu')).toBe('cafe-deja-vu');
  });
});

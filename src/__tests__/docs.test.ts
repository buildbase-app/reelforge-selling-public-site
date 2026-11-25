import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  buildDocsNav,
  folderPaths,
  isDocPath,
  neighbours,
  orderPages,
  visibleTags,
  type DocsPageInput,
  type DocsTreeNode,
} from '@/lib/docs/nav';
import {
  absoluteLinks,
  demoteHeadings,
  docTwin,
  docsIndexTwin,
  llmsDocsSection,
  llmsFullDocsSection,
} from '@/lib/docs/twin';
import { renderDocMarkdown } from '@/lib/docs/markdown';
import { pathsForWebhookEvent } from '@/lib/cache/webhook-tags';

/** Shapes as BuildBase answers them (dev environment, 2026-11-21). */
const TREE: DocsTreeNode[] = [
  {
    _id: 'f-trouble',
    name: 'Troubleshooting',
    slug: 'troubleshooting',
    path: '',
  },
  {
    _id: 'f-console',
    name: 'Guides',
    slug: 'guides',
    path: '',
    subfolders: [
      { _id: 'f-adv', name: 'Advanced', slug: 'advanced', path: 'guides' },
    ],
  },
  { _id: 'f-mcp', name: 'MCP', slug: 'mcp', path: '' },
  { _id: 'f-start', name: 'Quick start', slug: 'start', path: '' },
  { _id: 'f-empty', name: 'Empty', slug: 'empty', path: '' },
];

const folder = (id: string) => ({ _id: id, name: id, slug: id });
const DOCS: DocsPageInput[] = [
  {
    _id: 'd-agent',
    title: 'Connect an agent',
    slug: 'connect-an-agent',
    folder: folder('f-start'),
    suggestedDocs: [],
    published: true,
    updatedAt: '2026-11-21T18:55:56.000Z',
  },
  {
    _id: 'd-quick',
    title: 'Quick start',
    slug: 'quick-start',
    folder: folder('f-start'),
    suggestedDocs: ['d-agent'],
    published: true,
    description: 'Run it.',
    updatedAt: '2026-11-21T18:55:57.000Z',
  },
  {
    _id: 'd-console',
    title: 'A console page',
    slug: 'console-page',
    folder: folder('f-start'),
    suggestedDocs: [],
    published: true,
  },
  {
    _id: 'd-tools',
    title: 'MCP tool reference',
    slug: 'tools',
    folder: 'f-mcp',
    suggestedDocs: [],
    published: true,
  },
  {
    _id: 'd-server',
    title: 'MCP server overview',
    slug: 'mcp-server',
    folder: 'f-mcp',
    suggestedDocs: [{ _id: 'd-tools' }],
    published: true,
  },
  {
    _id: 'd-common',
    title: 'Common problems',
    slug: 'common-problems',
    folder: folder('f-trouble'),
    published: true,
  },
  {
    _id: 'd-deep',
    title: 'Deep',
    slug: 'deep',
    folder: 'f-adv',
    published: true,
  },
  {
    _id: 'd-draft',
    title: 'Draft',
    slug: 'draft',
    folder: 'f-mcp',
    published: false,
  },
  {
    _id: 'd-hidden',
    title: 'In an archived folder',
    slug: 'gone',
    folder: 'f-archived',
    published: true,
  },
  {
    _id: 'd-root',
    title: 'Root page',
    slug: 'root-page',
    folder: null,
    published: true,
  },
];

describe('docs navigation', () => {
  const nav = buildDocsNav(TREE, DOCS);

  it('orders known folders first, then others by name, and drops empty ones', () => {
    expect(nav.sections.map((s) => s.path)).toEqual([
      'start',
      'mcp',
      'troubleshooting',
      'guides',
    ]);
    expect(nav.sections[3].sections.map((s) => s.path)).toEqual([
      'guides/advanced',
    ]);
  });

  it('follows the suggestedDocs chain inside a folder, then the rest by title', () => {
    expect(nav.sections[0].pages.map((p) => p.path)).toEqual([
      'start/quick-start',
      'start/connect-an-agent',
      'start/console-page',
    ]);
    expect(nav.sections[1].pages.map((p) => p.title)).toEqual([
      'MCP server overview',
      'MCP tool reference',
    ]);
  });

  it('skips drafts and pages in folders the tree does not show', () => {
    const paths = nav.pages.map((p) => p.path);
    expect(paths).not.toContain('mcp/draft');
    expect(paths.some((p) => p.endsWith('gone'))).toBe(false);
    expect(nav.rootPages.map((p) => p.href)).toEqual(['/docs/root-page']);
  });

  it('gives prev/next in reading order across folders', () => {
    const { prev, next, current } = neighbours(nav, 'start/console-page');
    expect(prev?.path).toBe('start/connect-an-agent');
    expect(next?.path).toBe('mcp/mcp-server');
    expect(current?.section).toBe('Quick start');
    expect(neighbours(nav, 'nope').current).toBeNull();
  });

  it('builds folder paths from slugs down the tree', () => {
    expect(folderPaths(TREE).get('f-adv')).toBe('guides/advanced');
  });

  it('survives a suggestedDocs cycle', () => {
    const pages = [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ];
    const next: Record<string, string> = { a: 'b', b: 'a' };
    expect(
      orderPages(pages, (p) => next[p.id])
        .map((p) => p.id)
        .sort()
    ).toEqual(['a', 'b']);
  });

  it('hides the sync bookkeeping tags and validates URL paths', () => {
    expect(
      visibleTags([{ slug: 'mcp' }, { slug: 'source-repo' }, 'id-only'])
    ).toEqual(['mcp']);
    expect(isDocPath(['start', 'quick-start'])).toBe(true);
    expect(isDocPath(['..', 'etc'])).toBe(false);
    expect(isDocPath(['Start'])).toBe(false);
    expect(isDocPath([])).toBe(false);
  });
});

describe('markdown twins and llms sections', () => {
  const nav = buildDocsNav(TREE, DOCS);
  const base = 'https://reelforge.example';

  it('makes site links absolute and leaves external ones', () => {
    expect(
      absoluteLinks('[a](/docs/x) [b](https://y.z/q) [c](#top)', base)
    ).toBe(
      '[a](https://reelforge.example/docs/x) [b](https://y.z/q) [c](#top)'
    );
  });

  it('builds a page twin with metadata and prev/next', () => {
    const md = docTwin(
      {
        title: 'Quick start',
        description: 'Run it.',
        content: 'See [tools](/docs/mcp/tools).',
        updatedAt: '2026-11-21T18:55:57.000Z',
        tags: [{ slug: 'mcp' }, { slug: 'source-repo' }],
      },
      'start/quick-start',
      base,
      nav
    );
    expect(md).toContain('# Quick start\n\n> Run it.');
    expect(md).toContain(
      'URL: https://reelforge.example/docs/start/quick-start'
    );
    expect(md).toContain('Last updated: 2026-11-21');
    expect(md).toContain('Tags: mcp\n');
    expect(md).toContain('[tools](https://reelforge.example/docs/mcp/tools)');
    expect(md).toContain(
      'Next: [Connect an agent](https://reelforge.example/docs/start/connect-an-agent.md)'
    );
    expect(md).not.toContain('Previous:');
  });

  it('builds the index twin and the llms sections from the nav', () => {
    expect(docsIndexTwin(nav, base)).toContain(
      '## Quick start\n\n- [Quick start](https://reelforge.example/docs/start/quick-start): Run it.'
    );
    expect(llmsDocsSection(nav, base)).toContain(
      '(Markdown: https://reelforge.example/docs/mcp/tools.md)'
    );
    const full = llmsFullDocsSection(
      nav,
      DOCS.map((d) => ({
        ...d,
        content:
          d._id === 'd-quick'
            ? '## Steps\n\n```bash\n# not a heading\n```'
            : 'x',
      })),
      base
    );
    expect(full).toContain(
      '### Quick start\n\nURL: https://reelforge.example/docs/start/quick-start'
    );
    expect(full).toContain('#### Steps');
    expect(full).toContain('# not a heading');
    expect(llmsDocsSection(buildDocsNav([], []), base)).toBe('');
  });

  it('demotes headings outside code only', () => {
    expect(demoteHeadings('# A\n```\n# b\n```\n## C', 1)).toBe(
      '## A\n```\n# b\n```\n### C'
    );
  });
});

describe('renderDocMarkdown', () => {
  it('highlights code on the server, adds copy buttons and heading ids', async () => {
    const { html, headings } = await renderDocMarkdown(
      '## Install it\n\nRun `docker compose up`.\n\n```bash\necho "hi"\n```\n\n```unknownlang\nplain\n```\n\n```\nno language\n```'
    );
    expect(html).toContain(
      '<h2 id="install-it"><a href="#install-it" class="heading-anchor">Install it</a></h2>'
    );
    expect(headings).toEqual([{ id: 'install-it', text: 'Install it' }]);
    expect(html).toContain(
      '<pre class="shiki shiki-themes github-light github-dark"'
    );
    expect(html).toContain('data-language="bash"');
    expect(html).toMatch(/--shiki-light:#[0-9A-Fa-f]{6}/);
    expect(html).toMatch(/--shiki-dark:#[0-9A-Fa-f]{6}/);
    expect(html.match(/data-copy-code/g)?.length).toBe(3);
    expect(html).toContain('plain');
    expect(html).toContain('no language');
    expect(html).toContain('<code>docker compose up</code>');
  });

  it('sanitises CMS HTML before anything else', async () => {
    const { html } = await renderDocMarkdown(
      'Hi <script>alert(1)</script><iframe src="https://evil.test"></iframe> <img src=x onerror="steal()"> [x](javascript:alert(1)) <style>body{}</style>\n\n```html\n<script>alert(2)</script>\n```'
    );
    expect(html).not.toMatch(/<script|<iframe|<style|onerror|javascript:/i);
    // The code sample is shown as text, not executed.
    expect(html).toContain('&#x3C;');
  });

  it('marks external links and keeps site links', async () => {
    const { html } = await renderDocMarkdown(
      '[a](https://example.com) [b](/docs/mcp/tools)'
    );
    expect(html).toContain(
      'href="https://example.com" target="_blank" rel="noopener noreferrer"'
    );
    expect(html).toContain('<a href="/docs/mcp/tools">b</a>');
  });
});

describe('docs webhook paths', () => {
  it('a doc event revalidates /docs, its page and the sitemap', () => {
    expect(
      pathsForWebhookEvent('doc.published', { path: 'start/quick-start' })
    ).toEqual([
      '/en',
      '/en/pricing',
      '/en/help',
      '/en/docs',
      '/en/docs/start/quick-start',
      '/sitemap.xml',
    ]);
    expect(
      pathsForWebhookEvent('doc.updated', { path: '../../etc' })
    ).not.toContain('/en/docs/../../etc');
    expect(pathsForWebhookEvent('faq.updated')).not.toContain('/en/docs');
  });
});

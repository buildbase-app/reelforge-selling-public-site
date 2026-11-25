import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { readableTokenStyle, renderRichText } from '@/lib/content/rich-text';

/**
 * The long-form renderer (blog posts, release notes, docs): every rich-text
 * feature an editor can use in BuildBase, and the sanitising that keeps
 * anything executable off the page.
 */
describe('renderRichText: features', () => {
  it('links each h2-h4 to itself and keeps the page title the only h1', async () => {
    const { html, headings } = await renderRichText(
      '# Release\n\n## What changed\n\n### Details\n\n#### Small print'
    );
    expect(html).not.toContain('<h1');
    expect(html).toContain(
      '<h2 id="release"><a href="#release" class="heading-anchor">Release</a></h2>'
    );
    expect(html).toContain('<h3 id="what-changed">');
    expect(html).toContain('<h4 id="details">');
    expect(html).toContain('<h5 id="small-print">Small print</h5>');
    expect(headings).toEqual([{ id: 'release', text: 'Release' }]);
  });

  it('keeps h2-h4 as written when there is no h1', async () => {
    const { html } = await renderRichText('## A\n\n### B\n\n#### C');
    expect(html).toMatch(/<h2 id="a">[\s\S]*<h3 id="b">[\s\S]*<h4 id="c">/);
  });

  it('renders emphasis, underline, strike, mark and inline code', async () => {
    const { html } = await renderRichText(
      '**bold** *italic* <u>under</u> ~~gone~~ <mark>hi</mark> `code` <kbd>K</kbd>'
    );
    for (const tag of [
      '<strong>bold</strong>',
      '<em>italic</em>',
      '<u>under</u>',
      '<del>gone</del>',
      '<mark>hi</mark>',
      '<code>code</code>',
      '<kbd>K</kbd>',
    ]) {
      expect(html).toContain(tag);
    }
  });

  it('marks external links and keeps site links', async () => {
    const { html } = await renderRichText(
      '[a](https://example.com) [b](/pricing) [c](#later)\n\n## Later'
    );
    expect(html).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">a</a>'
    );
    expect(html).toContain('<a href="/pricing">b</a>');
    expect(html).toContain('<a href="#later">c</a>');
  });

  it('renders ordered, unordered, nested and task lists', async () => {
    const { html } = await renderRichText(
      '1. one\n2. two\n   - nested\n     - deeper\n\n- [x] done\n- [ ] open'
    );
    expect(html).toMatch(/<ol>\s*<li>one<\/li>/);
    expect(html).toMatch(/<ul>\s*<li>nested\s*<ul>\s*<li>deeper/);
    expect(html).toContain('type="checkbox"');
    expect(html).toMatch(/checked[^>]*aria-label="Done"/);
    expect(html).toContain('aria-label="Not done"');
  });

  it('turns GitHub alerts into labelled callouts and keeps plain quotes', async () => {
    const { html } = await renderRichText(
      '> [!WARNING]\n> Back up first.\n\n> Just a quote.'
    );
    expect(html).toContain(
      '<div class="callout" data-callout="warning" role="note"><p class="callout-title">Warning</p>'
    );
    expect(html).toContain('Back up first.');
    expect(html).toMatch(/<blockquote>\s*<p>Just a quote.<\/p>/);
  });

  it('highlights fenced code by language and leaves unknown ones plain', async () => {
    const { html } = await renderRichText(
      '```ts\nconst a: number = 1;\n```\n\n```brainfuck\n+++\n```'
    );
    expect(html).toContain('data-language="typescript"');
    expect(html).toMatch(/--shiki-light:#[0-9A-Fa-f]{6}/);
    expect(html).toContain('<pre><code class="language-brainfuck">+++');
    expect(html).not.toContain('data-copy-code');
  });

  it('swaps theme colours that fail WCAG AA on the code background', async () => {
    expect(
      readableTokenStyle('--shiki-light:#E36209;--shiki-dark:#6a737d')
    ).toBe('--shiki-light:#A84A00;--shiki-dark:#959DA5');
    expect(
      readableTokenStyle('--shiki-light:#24292E;--shiki-dark:#E1E4E8')
    ).toBe('--shiki-light:#24292E;--shiki-dark:#E1E4E8');
    const { html } = await renderRichText(
      '```ts\n// a comment\nfunction f(a: string) { return a; }\n```'
    );
    expect(html).not.toMatch(/--shiki-light:#(E36209|D73A49|22863A|6A737D)/i);
    expect(html).not.toMatch(/--shiki-dark:#6A737D/i);
    expect(html).toMatch(/--shiki-light:#57606A/i);
  });

  it('adds Copy buttons only when asked (docs)', async () => {
    const { html } = await renderRichText('```bash\nls\n```', {
      copyButtons: true,
    });
    expect(html.match(/data-copy-code/g)?.length).toBe(1);
  });

  it('wraps tables in a focusable scrolling region', async () => {
    const { html } = await renderRichText('| a | b |\n| - | - |\n| 1 | 2 |');
    expect(html).toContain(
      '<div class="table-scroll" role="region" aria-label="Table" tabindex="0"><table>'
    );
  });

  it('captions a lone image with its title and loads images lazily', async () => {
    const { html } = await renderRichText(
      '![A reel poster](https://example.com/p.webp "Rendered by the studio")\n\nInline ![x](https://example.com/i.png) image.'
    );
    expect(html).toContain(
      '<figure><img src="https://example.com/p.webp" alt="A reel poster" loading="lazy" decoding="async"><figcaption>Rendered by the studio</figcaption></figure>'
    );
    expect(html).toContain(
      '<img src="https://example.com/i.png" alt="x" loading="lazy" decoding="async">'
    );
  });

  it('turns a lone .mp4 image into a video with controls, never autoplay', async () => {
    const { html } = await renderRichText(
      '![Walkthrough](/walkthroughs/a.mp4 "The install, start to finish")\n\n<video src="/b.webm" autoplay controls></video>'
    );
    expect(html).toContain(
      '<figure><video src="/walkthroughs/a.mp4" controls preload="metadata" playsinline aria-label="Walkthrough"></video><figcaption>The install, start to finish</figcaption></figure>'
    );
    expect(html).toContain('<video src="/b.webm" controls>');
    expect(html).not.toContain('autoplay');
  });

  it('keeps raw figures, RTL text, emoji and horizontal rules', async () => {
    const { html } = await renderRichText(
      '<figure><img src="https://example.com/a.png" alt="A"><figcaption>Cap</figcaption></figure>\n\n<p dir="rtl">مرحبا بالعالم</p>\n\n🎬 done\n\n---'
    );
    expect(html).toContain('<figcaption>Cap</figcaption>');
    expect(html).toContain('<p dir="rtl">مرحبا بالعالم</p>');
    expect(html).toContain('🎬 done');
    expect(html).toContain('<hr>');
  });

  it('links footnotes to their notes', async () => {
    const { html } = await renderRichText('Claim.[^1]\n\n[^1]: The source.');
    const href = /<a href="(#[^"]+)"[^>]*data-footnote-ref/.exec(html)?.[1];
    expect(href).toBeDefined();
    expect(html).toContain(`id="${href!.slice(1)}"`);
  });

  it('returns nothing for an empty body', async () => {
    expect(await renderRichText('  ')).toEqual({ html: '', headings: [] });
    expect(await renderRichText(null)).toEqual({ html: '', headings: [] });
  });
});

describe('renderRichText: sanitising', () => {
  it('strips scripts with their text, and event handlers', async () => {
    const { html } = await renderRichText(
      'Hi <script>alert(1)</script> <img src="x" onerror="steal()"> <b onclick="steal()">b</b> <svg onload="steal()"><circle/></svg>'
    );
    expect(html).not.toMatch(/<script|alert\(1\)|onerror|onclick|onload|<svg/i);
    expect(html).toContain('<b>b</b>');
  });

  it('removes javascript: and data: URLs from links, images and videos', async () => {
    const { html } = await renderRichText(
      '[x](javascript:alert(1)) <a href="JaVaScRiPt:alert(2)">y</a> <a href="data:text/html,<script>">z</a> <img src="javascript:alert(3)"> <video src="javascript:alert(4)" poster="http://insecure.test/p.png"></video>'
    );
    expect(html).not.toMatch(/javascript:|data:text|alert|insecure\.test/i);
  });

  it('removes iframes, styles, objects, forms and templates with their contents', async () => {
    const { html } = await renderRichText(
      '<iframe src="https://evil.test"></iframe><style>body{display:none}</style><object data="x.swf"></object><embed src="x"><form action="https://evil.test"><input name="password"></form><template><p>hidden</p></template><noscript>ns</noscript>'
    );
    expect(html).not.toMatch(
      /<iframe|<style|display:none|<object|<embed|<form|name="password"|<template|hidden|ns/i
    );
  });

  it('drops inline styles and classes from authored HTML', async () => {
    const { html } = await renderRichText(
      '<p style="position:fixed" class="callout">styled</p>'
    );
    expect(html).toBe('<p>styled</p>');
  });

  it('prefixes authored ids so content cannot clobber the page', async () => {
    const { html } = await renderRichText('<p id="main-content">x</p>');
    expect(html).toContain('id="md-main-content"');
  });

  it('shows code samples as text', async () => {
    const { html } = await renderRichText(
      '```html\n<script>alert(2)</script>\n```'
    );
    expect(html).not.toContain('<script');
    expect(html).toContain('&#x3C;');
  });
});

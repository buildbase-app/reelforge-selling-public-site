import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ReelVideo } from '@/components/product/reel-video';
import {
  Hero,
  ReelMarquee,
  reelSource,
} from '@/components/product/home-sections';
import { reels } from '@/lib/agents/catalog';
import { marqueeEntries } from '@/lib/gallery/showcase';
import { FontPreload, GEIST_CORE_URL, GEIST_MONO_CORE_URL } from '@/lib/fonts';

/**
 * What the LCP work (studio issue #186) relies on: the hero poster comes in
 * right-sized AVIF/WebP, preloaded at high priority and never lazy; the
 * self-hosted Geist Mono files exist, and the one /agents preloads is the
 * face that draws ASCII.
 */

vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));
vi.mock('@/i18n/link', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const root = path.resolve(__dirname, '../..');
const inPublic = (url: string) =>
  fs.existsSync(path.join(root, 'public', url.replace(/^\//, '')));
const srcSetUrls = (set: string) =>
  set.split(',').map((s) => s.trim().split(' ')[0]!);

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
});

describe('reel posters', () => {
  it('list AVIF and WebP posters at 360, 540 and 720 px that exist', () => {
    for (const reel of reels) {
      const { avifSrcSet, webpSrcSet, webp } = reel.files;
      expect(avifSrcSet).toMatch(/ 360w, .* 540w, .* 720w$/);
      for (const url of [
        ...srcSetUrls(avifSrcSet),
        ...srcSetUrls(webpSrcSet),
        webp,
      ])
        expect(inPublic(url), url).toBe(true);
    }
  });

  it('the marquee posters exist, are small and load lazily', () => {
    // Every listed poster, shown or not: the files stay in the repo.
    const { container } = render(<ReelMarquee />);
    for (const img of container.querySelectorAll('img'))
      expect(img.getAttribute('loading')).toBe('lazy');
    const urls = marqueeEntries.map((e) => `/reels/marquee/${e.file}.webp`);
    expect(urls.length).toBe(16);
    let bytes = 0;
    for (const url of urls) {
      expect(inPublic(url), url).toBe(true);
      // /reels/* is cached as immutable, so the name carries the content hash.
      const file = fs.readFileSync(path.join(root, 'public', url));
      const hash = createHash('sha256').update(file).digest('hex').slice(0, 8);
      expect(url, url).toMatch(new RegExp(`\\.${hash}\\.webp$`));
      bytes += file.length;
    }
    // The 16 files stay well under the 600 KB the issue allows.
    expect(bytes).toBeLessThan(150e3);
  });

  it('the hero poster is preloaded at high priority, eager and sized', () => {
    const sizes = '(min-width: 417px) 280px, calc(72vw - 20px)';
    const { container } = render(
      <ReelVideo sources={reels.map(reelSource)} priority sizes={sizes} />
    );
    const avif = container.querySelector('source[type="image/avif"]')!;
    expect(avif.getAttribute('srcset')).toBe(reels[0]!.files.avifSrcSet);
    expect(avif.getAttribute('sizes')).toBe(sizes);
    expect(container.querySelector('source[type="image/webp"]')).not.toBeNull();
    const img = container.querySelector('img')!;
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('fetchpriority')).toBe('high');
    expect(img.getAttribute('width')).toBe('720');
    expect(img.getAttribute('height')).toBe('1280');
    const link = document.head.querySelector(
      'link[rel="preload"][as="image"]'
    )!;
    expect(link.getAttribute('fetchpriority')).toBe('high');
    expect(link.getAttribute('type')).toBe('image/avif');
    expect(link.getAttribute('imagesrcset')).toBe(reels[0]!.files.avifSrcSet);
  });

  it('the hero demo poster is small, exists and is preloaded at high priority', () => {
    render(<Hero heading="Your agent directs." ctas={null} showDemo />);
    const link = [
      ...document.head.querySelectorAll('link[rel="preload"][as="image"]'),
    ].find((l) => l.getAttribute('imagesrcset')?.includes('/walkthroughs/'))!;
    expect(link.getAttribute('fetchpriority')).toBe('high');
    expect(link.getAttribute('type')).toBe('image/avif');
    for (const url of srcSetUrls(link.getAttribute('imagesrcset')!)) {
      expect(inPublic(url), url).toBe(true);
      // A thumbnail until the video plays: a few kilobytes.
      expect(fs.statSync(path.join(root, 'public', url)).size).toBeLessThan(
        20e3
      );
    }
  });

  it('other posters stay lazy', () => {
    const { container } = render(
      <ReelVideo sources={[reelSource(reels[1]!)]} sizes="160px" />
    );
    expect(container.querySelector('img')!.getAttribute('loading')).toBe(
      'lazy'
    );
  });
});

describe('self-hosted Geist Mono', () => {
  const css = fs.readFileSync(
    path.join(root, 'src/app/geist-mono.css'),
    'utf8'
  );
  const faces = css.match(/@font-face\s*{[^}]*}/g)!;

  it('every face points at a file in public/fonts', () => {
    const urls = [...css.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]!);
    expect(urls.length).toBe(7);
    for (const url of urls) expect(inPublic(url), url).toBe(true);
  });

  it('/agents preloads the face that draws ASCII', () => {
    const face = faces.find((f) => f.includes(GEIST_MONO_CORE_URL));
    expect(face).toMatch(/unicode-range:\s*U\+0020-007E/);
  });

  it('sets the variable on :root, where Tailwind resolves it', () => {
    expect(css).toMatch(/:root\s*{\s*--font-geist-mono:/);
    expect(css).not.toMatch(/body\s*{[^}]*--font-geist-mono/);
  });
});

/**
 * Body text in Geist (studio issue #189): Tailwind resolves the default font
 * family (--font-sans, var(--font-geist-sans)) on <html>, so the variable
 * must be defined there, not on <body> as next/font's class put it. And the
 * core file is preloaded by a <link> element in the root layout, because
 * next/font's preloads never reached the browser on Workers.
 */
describe('self-hosted Geist', () => {
  const css = fs.readFileSync(path.join(root, 'src/app/geist.css'), 'utf8');
  const faces = css.match(/@font-face\s*{[^}]*}/g)!;
  const globals = fs.readFileSync(
    path.join(root, 'src/app/globals.css'),
    'utf8'
  );
  const layout = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8');

  it('every face points at a file in public/fonts', () => {
    const urls = [...css.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]!);
    expect(urls.length).toBe(6);
    for (const url of urls) expect(inPublic(url), url).toBe(true);
    for (const face of faces.filter((f) => /family:\s*'Geist'/.test(f)))
      expect(face).toMatch(/font-display:\s*swap/);
  });

  it('defines --font-geist-sans on :root, where Tailwind resolves it', () => {
    expect(globals).toMatch(/--font-sans:\s*var\(--font-geist-sans\)/);
    expect(css).toMatch(
      /:root\s*{\s*--font-geist-sans:\s*'Geist',\s*'Geist Fallback';/
    );
    // next/font's variable class on <body> was the bug.
    expect(layout).not.toMatch(/next\/font/);
    expect(layout).toMatch(/import '\.\/geist\.css'/);
  });

  it('preloads the face that draws ASCII', () => {
    const face = faces.find((f) => f.includes(GEIST_CORE_URL));
    expect(face).toMatch(/unicode-range:\s*U\+0020-007E/);
  });

  it('every page preloads the core from <head>, as an element', () => {
    // An element, not ReactDOM.preload(), which Next moves into a Link
    // response header that does not reach the browser on Workers.
    expect(layout).toMatch(/<FontPreload href={GEIST_CORE_URL} \/>/);
    // The server render puts the element in <head>.
    /* eslint-disable @next/next/no-head-element */
    const html = renderToString(
      <html>
        <head />
        <body>
          <p>text</p>
          <FontPreload href={GEIST_CORE_URL} />
        </body>
      </html>
    );
    /* eslint-enable @next/next/no-head-element */
    const head = html.slice(0, html.indexOf('</head>'));
    const preload = head.match(/<link rel="preload"[^>]*>/)?.[0];
    expect(preload).toContain(`href="${GEIST_CORE_URL}"`);
    expect(preload).toContain('as="font"');
    expect(preload).toContain('type="font/woff2"');
    expect(preload).toContain('crossorigin=""');
  });
});

describe('hero text load-in', () => {
  const css = fs.readFileSync(
    path.join(root, 'src/components/product/product.css'),
    'utf8'
  );

  it('starts faint, not invisible, so the subhead is the LCP at the first paint', () => {
    // Chrome skips text painted at opacity 0 when it picks the LCP, then
    // counts it when a web font load repaints it (studio issue #189).
    const rule = css.match(/\.rf-fade-up-2\s*{[^}]*animation:\s*([\w-]+)/)!;
    const keyframes = css.match(
      new RegExp(`@keyframes ${rule[1]}\\s*{\\s*from\\s*{([^}]*)}`)
    )!;
    const opacity = Number(keyframes[1].match(/opacity:\s*([\d.]+)/)![1]);
    expect(opacity).toBeGreaterThan(0);
  });
});

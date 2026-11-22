import fs from 'node:fs';
import path from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReelVideo } from '@/components/product/reel-video';
import { reelSource } from '@/components/product/home-sections';
import { reels } from '@/lib/agents/catalog';
import { GEIST_MONO_CORE_URL } from '@/lib/fonts';

/**
 * What the LCP work (studio issue #186) relies on: the hero poster comes in
 * right-sized AVIF/WebP, preloaded at high priority and never lazy; the
 * self-hosted Geist Mono files exist, and the one /agents preloads is the
 * face that draws ASCII.
 */

vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://reelforge.buildbase.app',
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
    for (const name of ['album-release-countdown', 'beat-drop-visualizer'])
      for (const file of [
        `${name}.avif`,
        `${name}-240.avif`,
        `${name}-240.webp`,
      ])
        expect(inPublic(`/reels/stack/${file}`), file).toBe(true);
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

  it('sets the variable on <body>, where next/font set it', () => {
    expect(css).toMatch(/body\s*{\s*--font-geist-mono:/);
  });
});

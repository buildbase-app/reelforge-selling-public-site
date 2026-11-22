import fs from 'node:fs';
import path from 'node:path';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Scroll motion (studio issue #81): every scroll-driven animation is behind
 * `prefers-reduced-motion: no-preference`, reduced motion turns animation,
 * transitions and reel autoplay off, and the IntersectionObserver fallback
 * reveals content once and does nothing under reduced motion.
 */

const css = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

/** The CSS outside `@media (prefers-reduced-motion: no-preference)` blocks. */
function outsideNoPreference(source: string): string {
  let out = '';
  let i = 0;
  const marker = '@media (prefers-reduced-motion: no-preference)';
  while (i < source.length) {
    const at = source.indexOf(marker, i);
    if (at === -1) {
      out += source.slice(i);
      break;
    }
    out += source.slice(i, at);
    let depth = 0;
    let j = source.indexOf('{', at);
    for (; j < source.length; j++) {
      if (source[j] === '{') depth++;
      else if (source[j] === '}' && --depth === 0) break;
    }
    i = j + 1;
  }
  return out;
}

type Matcher = (query: string) => { matches: boolean };
function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia & Matcher;
}

/** A controllable IntersectionObserver. */
const observers: { cb: IntersectionObserverCallback; els: Element[] }[] = [];
class FakeIO {
  els: Element[] = [];
  constructor(public cb: IntersectionObserverCallback) {
    observers.push(this);
  }
  observe(el: Element) {
    this.els.push(el);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
function fire(el: Element, ratio: number) {
  for (const o of observers)
    if (o.els.includes(el))
      o.cb(
        [
          {
            target: el,
            isIntersecting: ratio > 0,
            intersectionRatio: ratio,
          } as unknown as IntersectionObserverEntry,
        ],
        o as unknown as IntersectionObserver
      );
}

describe('scroll motion CSS', () => {
  it.each([
    'src/components/product/product.css',
    'src/components/gallery/gallery.css',
  ])(
    'keeps every scroll-driven animation behind no-preference (%s)',
    (file) => {
      const rest = outsideNoPreference(css(file));
      expect(rest).not.toMatch(/animation(-timeline)?\s*:/);
      expect(rest).not.toMatch(/view-timeline-name|timeline-scope/);
    }
  );

  it('turns every animation and transition off under reduced motion', () => {
    const globals = css('src/app/globals.css');
    const block = globals.slice(
      globals.indexOf('@media (prefers-reduced-motion: reduce)')
    );
    expect(block).toMatch(/animation-duration:\s*0\.01ms !important/);
    expect(block).toMatch(/transition-duration:\s*0\.01ms !important/);
  });

  it('animates only transform and opacity', () => {
    for (const file of [
      'src/components/product/product.css',
      'src/components/gallery/gallery.css',
    ]) {
      const keyframes = css(file).match(/@keyframes[^{]+\{([^{}]*\{[^}]*\})+/g);
      expect(keyframes?.length).toBeGreaterThan(0);
      for (const k of keyframes ?? []) {
        const props = [...k.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
        for (const p of props) expect(['transform', 'opacity']).toContain(p);
      }
    }
  });
});

describe('motion fallback', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', FakeIO);
    document.documentElement.className = '';
    document.body.innerHTML =
      '<section data-parallax=""></section><div class="rf-reveal" id="a"></div><div class="gl-card" id="b"></div>';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('does nothing under reduced motion', async () => {
    setReducedMotion(true);
    const { startMotionFallback } = await import('@/lib/motion-fallback');
    startMotionFallback()();
    expect(document.documentElement).not.toHaveClass('rf-io');
    expect(observers).toHaveLength(0);
  });

  it('reveals each item once as it enters', async () => {
    setReducedMotion(false);
    const { startMotionFallback } = await import('@/lib/motion-fallback');
    const stop = startMotionFallback();
    expect(document.documentElement).toHaveClass('rf-io');
    const a = document.getElementById('a')!;
    expect(a).not.toHaveAttribute('data-in');
    fire(a, 1);
    expect(a).toHaveAttribute('data-in');
    stop();
    expect(document.documentElement).not.toHaveClass('rf-io');
  });
});

describe('reel autoplay', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('IntersectionObserver', FakeIO);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const source = {
    webm: '/r.webm',
    mp4: '/r.mp4',
    avif: '/r.avif',
    jpg: '/r.jpg',
    label: 'A reel',
  };

  it.each([
    [true, 0],
    [false, 1],
  ])('reduced motion %s: plays %i times when in view', async (reduce, n) => {
    setReducedMotion(reduce);
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    const { ReelVideo } = await import('@/components/product/reel-video');
    const { container } = render(<ReelVideo sources={[source]} />);
    const video = container.querySelector('video')!;
    act(() => fire(video, 1));
    expect(play).toHaveBeenCalledTimes(n);
  });
});

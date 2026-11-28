// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * RenderWeld is source-available, NOT open source (founder decision
 * 2026-11-21), and is no longer sold as a locked image. This fails if the
 * marketing copy (pages, components, messages, FAQs, content blocks, legal
 * and blog content, site/SEO config, agent docs) ever says "open source"
 * (any spelling) or describes a locked image. "source-available" is fine.
 */

const ROOT = join(__dirname, '..', '..');
const SCAN = [
  'src/app',
  'src/components',
  'src/config',
  'src/content',
  'src/lib/agent',
  'src/lib/agents',
  'src/lib/blog',
  'src/lib/platform',
  'src/lib/seo',
  'src/lib/store',
  'src/i18n/messages/en.ts',
];
const TEXT = /\.(tsx?|mdx?)$/;

function files(path: string): string[] {
  const abs = join(ROOT, path);
  if (statSync(abs).isFile()) return [abs];
  return readdirSync(abs).flatMap((name) => files(join(path, name)));
}

const sources = SCAN.flatMap(files)
  .filter((f) => TEXT.test(f))
  .map((f) => ({ file: relative(ROOT, f), text: readFileSync(f, 'utf8') }));

function hits(pattern: RegExp): string[] {
  return sources.flatMap(({ file, text }) =>
    text
      .replace(/source-available/gi, '')
      .split('\n')
      .map((line, i) => ({ line, i }))
      .filter(({ line }) => pattern.test(line))
      .map(({ line, i }) => `${file}:${i + 1}: ${line.trim()}`)
  );
}

describe('marketing copy', () => {
  it('scans the marketing sources', () => {
    expect(sources.length).toBeGreaterThan(50);
    expect(sources.some((s) => s.file.endsWith('licence/en.ts'))).toBe(true);
  });

  it('never says "open source"', () => {
    expect(hits(/open[\s_-]*source/i)).toEqual([]);
  });

  it('calls the product RenderWeld and never shows its old name', () => {
    // Allowed: technical names that still carry it and that a visitor's
    // commands or links depend on. Each goes when its owner renames it.
    const TECHNICAL = [
      /github\.com\/buildbase-app\/reelforge-(studio|selling-public-site)/, // the repositories
      /media\.reelforge\.buildbase\.app/, // the media host
      /'reelforge-(personal|commercial)'/, // BuildBase item slugs
    ];
    const old = hits(/reelforge/i).filter((hit) => {
      const rest = TECHNICAL.reduce(
        (line, name) => line.replace(name, ''),
        hit
      );
      return /reelforge/i.test(rest.replace(/^[^:]+:\d+: /, ''));
    });
    expect(old).toEqual([]);
  });

  it('never describes a locked image or hidden source', () => {
    expect(
      hits(
        /locked\s+(docker\s+)?image|source code is not included|not as source code/i
      )
    ).toEqual([]);
  });

  it("calls the demo reels' studio build a pre-release build", () => {
    // The footnotes under the demo reels name the studio build they were
    // made with. Until the reels are re-rendered on a release build they
    // say "pre-release build" (private site plan, P3).
    expect(hits(/licen[cs]e check (is )?off/i)).toEqual([]);
    const footnotes = [
      'src/components/product/home-sections.tsx',
      'src/app/[locale]/(marketing)/agents/page.tsx',
    ];
    for (const file of footnotes) {
      const source = sources.find((s) => s.file === file);
      expect(source?.text).toContain('(pre-release build)');
    }
  });

  it('names no internal script paths on /agents and links the methods page', () => {
    const agents = sources.find(
      (s) => s.file === 'src/app/[locale]/(marketing)/agents/page.tsx'
    );
    expect(agents?.text).not.toMatch(/scripts\/[\w/-]+\.m?js/);
    expect(agents?.text).toContain('href="/methods"');
    expect(
      sources.some((s) => s.file === 'src/content/pages/methods/en.ts')
    ).toBe(true);
  });
});

// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * ReelForge is source-available, NOT open source (founder decision
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

  it('never describes a locked image or hidden source', () => {
    expect(
      hits(
        /locked\s+(docker\s+)?image|source code is not included|not as source code/i
      )
    ).toEqual([]);
  });
});

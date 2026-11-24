// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));

import manifest from '@/app/manifest';

/**
 * The RenderWeld brand kit's web files (studio docs/brand): the manifest
 * names the product and points at icons that exist, and the proxy leaves
 * the manifest and the self-hosted fonts to the static file server.
 */
const ROOT = join(__dirname, '..', '..');

describe('brand assets', () => {
  it('serves a manifest with the RenderWeld name and real icons', () => {
    const m = manifest();
    expect(m.name).toBe('RenderWeld');
    expect(m.theme_color).toBe('#191b1f');
    expect(m.icons?.some((i) => i.purpose === 'maskable')).toBe(true);
    for (const icon of m.icons ?? []) {
      const file = icon.src.replace(/^\//, '');
      const where =
        file === 'icon.svg'
          ? join(ROOT, 'src/app', file)
          : join(ROOT, 'public', file);
      expect(existsSync(where), icon.src).toBe(true);
    }
  });

  it('ships the kit favicon, touch icon and share images', () => {
    for (const file of [
      'src/app/favicon.ico',
      'src/app/icon.svg',
      'src/app/apple-icon.png',
      'public/og.png',
      'public/twitter-card.png',
    ])
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    expect(readFileSync(join(ROOT, 'src/app/icon.svg'), 'utf8')).toContain(
      '<title>RenderWeld</title>'
    );
  });

  it('keeps the manifest and fonts out of the locale proxy', () => {
    // The matcher as written in src/proxy.ts (importing the proxy would
    // pull in the whole request stack).
    const source = readFileSync(join(ROOT, 'src/proxy.ts'), 'utf8');
    const literal = source.match(/matcher:\s*\[[\s\S]*?\n\s*'([^']+)'/)?.[1];
    expect(literal).toBeTruthy();
    const matcher = new RegExp(`^${literal!.replace(/\\\\/g, '\\')}$`);
    expect(matcher.test('/manifest.webmanifest')).toBe(false);
    expect(matcher.test('/fonts/geist-latin-core.8e4a2f39.woff2')).toBe(false);
    expect(matcher.test('/pricing')).toBe(true);
  });
});

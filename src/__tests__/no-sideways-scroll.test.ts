import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The page must not scroll sideways (studio issue #725). `w-screen` on the
 * body is 100vw, which counts the scrollbar; `overflow-x-hidden` on the
 * shell would break the sticky header. The browser check is in
 * e2e/no-sideways-scroll.spec.ts.
 */
const read = (p: string) =>
  readFileSync(path.resolve(__dirname, '..', p), 'utf8');

describe('no sideways scroll', () => {
  it('the body grows with its content and is never 100vw wide', () => {
    const layout = read('app/layout.tsx');
    expect(layout).toContain('<body className="min-h-dvh antialiased">');
    expect(layout).not.toMatch(/w-screen|h-screen/);
  });

  it('the marketing shell clips sideways overflow without a scroll container', () => {
    const shell = read('components/marketing/marketing-shell.tsx');
    expect(shell).toMatch(/className="[^"]*\boverflow-x-clip\b/);
    expect(shell).not.toMatch(/className="[^"]*\boverflow-x-hidden\b/);
  });
});

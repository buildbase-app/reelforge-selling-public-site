import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@/lib/zod-jitless';
import { z } from 'zod';

/**
 * zod v4 must not probe for eval in the browser (studio issue #193): under
 * the nonce CSP the probe's `new Function("")` is blocked and reported as a
 * `script-src 'eval'` violation.
 */
describe('zod jitless', () => {
  afterEach(() => vi.restoreAllMocks());

  it('turns zod v4 jitless', () => {
    expect(z.config().jitless).toBe(true);
  });

  it('builds and parses object schemas without calling Function', () => {
    const fn = vi.spyOn(globalThis, 'Function');
    const schema = z.object({ email: z.email(), seats: z.number().int() });
    expect(schema.parse({ email: 'buyer@example.com', seats: 2 })).toEqual({
      email: 'buyer@example.com',
      seats: 2,
    });
    expect(schema.safeParse({ email: 'nope', seats: 2 }).success).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  // zod reads the setting when it builds a schema, and the SDK builds some
  // as its module runs, so the setting must come first in every client
  // module that can be the first to load the SDK's React entry (or zod).
  it('comes first in every client module that loads zod', () => {
    const src = path.join(__dirname, '..');
    const offenders: string[] = [];
    let checked = 0;
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__' && entry.name !== 'generated')
            walk(file);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name)) continue;
        const source = fs.readFileSync(file, 'utf8');
        if (!/^['"]use client['"]/.test(source)) continue;
        if (!/from '(@buildbase\/sdk\/(react|data|mcp)|zod)'/.test(source))
          continue;
        checked++;
        const firstImport = source.match(/^import .*$/m)?.[0];
        if (firstImport !== "import '@/lib/zod-jitless';")
          offenders.push(path.relative(src, file));
      }
    };
    walk(src);
    expect(checked).toBeGreaterThan(20);
    expect(offenders).toEqual([]);
  });
});

import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The e2e scripts never save or print a whole licence key (studio issue
 * #261): logs and screenshots are masked to the key's first group, a page
 * that still shows a whole key is not captured, and a saved text artifact
 * with one fails the run.
 */

interface FakePage {
  evaluate: (fn: (source: string) => number, source: string) => unknown;
  screenshot: (options: unknown) => unknown;
}

const keys = createRequire(import.meta.url)(
  '../../scripts/lib/licence-keys.cjs'
) as {
  KEY: RegExp;
  KEY_SOURCE: string;
  MASKED_KEY: RegExp;
  maskText: (text: string) => string;
  maskKeysInDocument: (source: string) => number;
  maskPage: (page: FakePage) => Promise<void>;
  screenshotMasked: (page: FakePage, options: unknown) => Promise<unknown>;
  assertNoKeysInDir: (dir: string) => void;
};

// Made up, and built here so no whole key is written in the repository.
const SAMPLE = ['ABCDE', 'FGHJK', 'LMNPQ', 'RSTUV', 'WXYZ2'].join('-');

/** A page whose `evaluate` runs in this test's jsdom document. */
function jsdomPage(screenshot = vi.fn()): FakePage {
  return {
    evaluate: (fn, source) => fn(source),
    screenshot,
  };
}

const dirs: string[] = [];
afterEach(() => {
  document.body.innerHTML = '';
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true });
});

describe('maskText', () => {
  it('keeps only the first group of every key', () => {
    const text = `key ${SAMPLE} and ${SAMPLE}.`;
    expect(keys.maskText(text)).toBe('key ABCDE-••••• and ABCDE-•••••.');
    expect(keys.KEY.test(keys.maskText(text))).toBe(false);
    expect(keys.MASKED_KEY.test(keys.maskText(text))).toBe(true);
  });

  it('leaves other text alone', () => {
    expect(keys.maskText('Order 6b03e03ef3438a5a2a47b3a9, $149.00')).toBe(
      'Order 6b03e03ef3438a5a2a47b3a9, $149.00'
    );
  });
});

describe('masking the page before a screenshot', () => {
  it('masks text nodes, input values and attributes', async () => {
    document.body.innerHTML = `
      <main>
        <p>Licence key <code>${SAMPLE}</code></p>
        <input id="k" readonly />
        <button data-copy="${SAMPLE}" aria-label="Copy ${SAMPLE}">Copy</button>
      </main>`;
    (document.getElementById('k') as HTMLInputElement).value = SAMPLE;
    const screenshot = vi.fn();
    await keys.screenshotMasked(jsdomPage(screenshot), { path: 'x.png' });
    expect(screenshot).toHaveBeenCalledWith({ path: 'x.png' });
    expect(document.body.innerHTML).not.toMatch(keys.KEY);
    expect(document.querySelector('code')!.textContent).toBe('ABCDE-•••••');
    expect((document.getElementById('k') as HTMLInputElement).value).toBe(
      'ABCDE-•••••'
    );
    expect(document.querySelector('button')!.getAttribute('data-copy')).toBe(
      'ABCDE-•••••'
    );
  });

  it('refuses to capture when a whole key is left', async () => {
    const screenshot = vi.fn();
    const page: FakePage = { evaluate: () => 1, screenshot };
    await expect(keys.screenshotMasked(page, {})).rejects.toThrow(
      /whole licence key/
    );
    expect(screenshot).not.toHaveBeenCalled();
  });
});

describe('saved artifacts', () => {
  function dir(files: Record<string, string>) {
    const d = mkdtempSync(join(tmpdir(), 'rf-keys-'));
    dirs.push(d);
    for (const [name, text] of Object.entries(files)) {
      writeFileSync(join(d, name), text);
    }
    return d;
  }

  it('fail the run when a text file holds a whole key', () => {
    const d = dir({ 'run.log': `6. order page shows: key ${SAMPLE}` });
    expect(() => keys.assertNoKeysInDir(d)).toThrow(/run\.log/);
  });

  it('pass when every key was masked', () => {
    const d = dir({
      'run.log': keys.maskText(`key ${SAMPLE}`),
      'b-6-order.png': 'not text',
    });
    expect(() => keys.assertNoKeysInDir(d)).not.toThrow();
  });
});

describe('the e2e scripts', () => {
  const root = join(__dirname, '..', '..', 'scripts');
  const scripts = readdirSync(root)
    .filter((f) => /^e2e-.*\.cjs$/.test(f))
    .map((f) => ({ f, src: readFileSync(join(root, f), 'utf8') }));

  it('are found', () => {
    expect(scripts.map((s) => s.f)).toEqual(
      expect.arrayContaining([
        'e2e-buyer-journey.cjs',
        'e2e-personal-claim.cjs',
      ])
    );
  });

  it('capture only through screenshotMasked and log only masked text', () => {
    for (const { f, src } of scripts) {
      expect(src, f).not.toMatch(/\.screenshot\(/);
      expect(src, f).toMatch(/screenshotMasked\(page,/);
      // `out` is the one console.log, and it masks.
      expect(src.match(/console\.log\(/g) ?? [], f).toHaveLength(1);
      expect(src, f).toContain('const out = (s) => console.log(maskText(s));');
      expect(src, f).toMatch(/assertNoKeysInDir\(SHOTS\)/);
    }
  });
});

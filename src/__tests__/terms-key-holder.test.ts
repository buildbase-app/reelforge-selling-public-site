// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guest checkout creates no account, so the terms must not say keys go to
 * an account (studio issue #567).
 */
const TERMS = readFileSync(
  join(__dirname, '..', 'content', 'pages', 'terms', 'en.ts'),
  'utf8'
);

describe('terms: who licence keys are issued to', () => {
  it('issues keys to the buyer named on the order, account or not', () => {
    expect(TERMS).toContain(
      'Licence keys are issued to the buyer named on the order, whether or not they have an account.'
    );
  });

  it('no longer says keys go to the account that bought them', () => {
    expect(TERMS).not.toMatch(/issued to the account that/i);
  });
});

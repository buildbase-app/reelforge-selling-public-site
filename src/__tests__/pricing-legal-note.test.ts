// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import en from '@/i18n/messages/en';

const PAGE = join(
  __dirname,
  '..',
  'app',
  '[locale]',
  '(app)',
  '(store)',
  'pricing',
  'page.tsx'
);

describe('pricing legal note', () => {
  it('names the licence and the terms and links the refund policy', () => {
    expect(en.pricing.legal).toBe(
      'Claiming or buying a key means you accept the <licence>licence that applies</licence> and the <terms>terms of service</terms>. See the <refund>refund policy</refund>.'
    );
  });

  it('links each tag in the note to its page', () => {
    const page = readFileSync(PAGE, 'utf8');
    for (const [tag, href] of [
      ['licence', '/licence'],
      ['terms', '/terms'],
      ['refund', '/refund'],
    ]) {
      expect(page).toMatch(
        new RegExp(`${tag}: \\(chunks\\) => \\(\\s*<Link href="${href}"`)
      );
    }
  });
});

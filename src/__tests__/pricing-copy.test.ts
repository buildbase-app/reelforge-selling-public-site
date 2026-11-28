// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));

import messages from '@/i18n/messages/en';
import { copy } from '@/components/store/offer-grid';
import { DEFAULT_BLOCKS } from '@/lib/platform/blocks';
import { DEFAULT_FAQS } from '@/lib/platform/faqs';
import licence from '@/content/pages/licence/en';

/**
 * Pricing copy in plain words (studio issues #627, #656, #659, #661 to
 * #666): the RenderWeld licence key and a free RenderWeld account, never
 * "BuildBase", a hedged Remotion note with its check date, and a store
 * error that says what to do.
 */
const read = (p: string) =>
  readFileSync(join(__dirname, '..', '..', p), 'utf8');

describe('pricing copy', () => {
  it('has the plain subtitle and search description', () => {
    expect(messages.pricing.subtitle).toBe(
      'Free for personal projects. Pay once for commercial use: no subscription and no per-video fees. Your licence key unlocks RenderWeld on your own computer or server.'
    );
    expect(messages.pricing.meta.description).toBe(
      'RenderWeld is free for personal use. Commercial use needs a one-time licence. See what each licence includes.'
    );
  });

  it('has the Personal card note and a store error that says what to do', () => {
    expect(copy.edition.personal.note).toBe(
      'For hobby, study, research, charities and schools. One deployment. Needs a free account on this site.'
    );
    expect(copy.storeUnreachable).toBe(
      "We couldn't load prices just now. Refresh the page in a minute."
    );
  });

  it('names the RenderWeld licence key and account, never BuildBase', () => {
    expect(licence.body).not.toMatch(/BuildBase/);
    expect(licence.body).toContain('free RenderWeld account');
    expect(licence.body).toContain('RenderWeld licence key');
    const guide = read('src/components/store/licence-guide.tsx');
    expect(guide).toMatch(/anyone can read the code/);
    expect(guide).toMatch(/your RenderWeld licence key/);
  });

  it('any FAQ that names a store button uses the label the store shows', () => {
    const answers = Object.values(DEFAULT_FAQS)
      .flat()
      .filter((e) => e.answer.includes('press "'));
    for (const e of answers)
      expect(e.answer).toContain(`press "${copy.getFree}"`);
  });

  it('hedges the Remotion note with the date it was checked', () => {
    expect(DEFAULT_BLOCKS.remotionNotice).toContain(
      'when we last checked, on 28 November 2026'
    );
    expect(DEFAULT_BLOCKS.remotionNotice).toContain(
      'Motion Canvas, HTML and HyperFrames scenes need no Remotion licence.'
    );
  });

  it('sends "Not sure which licence you need?" to /licence', () => {
    const home = read('src/app/[locale]/(marketing)/page.tsx');
    expect(home).toMatch(
      /href="\/licence"[^>]*>\s*Not sure which licence you need\? Compare them/
    );
  });
});

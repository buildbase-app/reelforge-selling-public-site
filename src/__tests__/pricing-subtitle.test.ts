// @vitest-environment node
import { describe, expect, it } from 'vitest';
import en from '@/i18n/messages/en';
import { PRICING_SUBTITLE_KEY } from '@/lib/store/sale-copy';

describe('pricing subtitle per sale state', () => {
  it('names the waitlist, not the store, until a paid licence is on sale', () => {
    for (const state of ['none', 'free'] as const) {
      const text = en.pricing[PRICING_SUBTITLE_KEY[state]];
      expect(text).toContain('<waitlist>join the waitlist</waitlist>');
      expect(text).not.toMatch(/straight from the store|\bbuy\b/i);
    }
    expect(PRICING_SUBTITLE_KEY.paid).toBe('subtitle');
  });
});

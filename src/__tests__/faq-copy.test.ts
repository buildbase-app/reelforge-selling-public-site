// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));
vi.mock('@/lib/platform/content', () => ({
  FAQ_COLLECTIONS: {
    store: 'store-faq',
    home: 'home-faq',
    pricing: 'pricing-faq',
    agents: 'agents-faq',
  },
  getFaqs: vi.fn().mockResolvedValue([]),
}));

const { DEFAULT_FAQS } = await import('@/lib/platform/faqs');

function find(id: string) {
  const all = Object.values(DEFAULT_FAQS).flat();
  const entry = all.find((e) => e.id === id);
  if (!entry) throw new Error(`no FAQ with id ${id}`);
  return entry;
}

describe('default FAQ answers (Content C19, C20, C23, C24)', () => {
  it('C19: says what a buyer gets and where the key shows up', () => {
    const e = find('delivery');
    expect(e.question).toBe('What do I get?');
    expect(e.answer).toBe(
      'A licence key, shown on your order page and in your receipt email. RenderWeld runs on your own computer or server and your key activates it. There is no hosted service to sign up for.'
    );
  });

  it('C20: the free Personal licence covers one deployment', () => {
    const e = find('personal-free');
    expect(e.question).toBe('Is the Personal licence free?');
    expect(e.answer).toContain('Create a free account');
    expect(e.answer).toContain('your key appears straight away');
    expect(e.answer).toContain(
      'It covers one deployment, for noncommercial use.'
    );
    expect(e.answer).not.toMatch(/BuildBase/);
  });

  it('C23: allows free noncommercial sharing and names what is not allowed', () => {
    const e = find('source-code');
    expect(e.answer).toContain(
      'You may share it free for noncommercial use, with the licence notices, and a changed copy must use a new name. You may not sell it, rebrand it or offer it as a paid or hosted service.'
    );
    expect(e.answer).not.toMatch(/may not resell, redistribute/);
  });

  it('C24: adds the four missing answers to the help page', () => {
    const ids = DEFAULT_FAQS.store.map((e) => e.id);
    for (const id of ['online', 'move-server', 'updates', 'seller']) {
      expect(ids).toContain(id);
    }
    expect(find('online').answer).toContain('14 days');
    expect(find('move-server').answer).toContain(
      '`renderweld licence deactivate`'
    );
    expect(find('updates').answer).toContain('12 months after you buy');
    expect(find('seller').answer).toContain('Jagodana LLC');
  });

  it('pricing shows the updates and seller answers too', () => {
    const ids = DEFAULT_FAQS.pricing.map((e) => e.id);
    expect(ids).toEqual(expect.arrayContaining(['updates', 'seller']));
  });

  it('every collection keeps unique ids', () => {
    for (const list of Object.values(DEFAULT_FAQS)) {
      const ids = list.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));

/**
 * No legal page ships a placeholder (studio issue #3): every founder input
 * (entity, address, law, windows, emails) is filled before buyers see it.
 */
const PLACEHOLDER = [
  /\[[A-Z0-9_ ]{3,}\](?!\()/, // [ENTITY], [LEGAL NAME]; not a Markdown link
  /\[[^\]]*\b(to be (confirmed|decided)|tbd|todo|placeholder)\b[^\]]*\]/i,
  /\b(TBD|TODO|FIXME|XXX)\b/,
  /\bto be (confirmed|decided)\b/i,
  /\{\{|\}\}/, // unfilled template variables
  /\$\{/, // a template literal that never ran
  /\blorem ipsum\b/i,
  /\b(undefined|NaN)\b/, // an interpolated value that was missing
];

function placeholders(text: string): string[] {
  return PLACEHOLDER.flatMap((re) => text.match(re)?.[0] ?? []);
}

const PAGES = [
  'about',
  'cookies',
  'licence',
  'privacy',
  'refund',
  'security',
  'terms',
] as const;

describe('legal pages have no placeholders', () => {
  it('the check catches the placeholders the drafts used', () => {
    for (const text of [
      '[ENTITY]',
      '[Legal entity to be confirmed]',
      'Governing law: TBD',
      'Write to {{supportEmail}}',
      'sold by **undefined**',
      'see [ADDRESS] below',
    ])
      expect(placeholders(text), text).not.toEqual([]);
    expect(placeholders('Sold by **Jagodana LLC**, Wyoming law.')).toEqual([]);
    expect(placeholders('See [NOTICE](https://example.com/NOTICE).')).toEqual(
      []
    );
  });

  it.each(PAGES)('%s', async (name) => {
    const { default: page } = await import(`@/content/pages/${name}/en.ts`);
    const text = Object.values(page)
      .filter((v): v is string => typeof v === 'string')
      .join('\n');
    expect(placeholders(text)).toEqual([]);
  });
});

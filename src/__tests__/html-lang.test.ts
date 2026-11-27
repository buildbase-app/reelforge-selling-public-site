// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { defaultLocale, htmlLangAttributes, locales } from '@/i18n/config';

/** <html lang> and dir come from the request's locale (studio issue #7). */
describe('<html lang> and dir', () => {
  it('names each served locale', () => {
    for (const locale of locales)
      expect(htmlLangAttributes(locale).lang).toBe(locale);
  });

  it('falls back to the default locale for anything the site does not serve', () => {
    for (const locale of [undefined, '', 'xx', '../en'])
      expect(htmlLangAttributes(locale)).toEqual({
        lang: defaultLocale,
        dir: 'ltr',
      });
  });

  it('is set by the root layout, not hard-coded', () => {
    const layout = fs.readFileSync(
      path.join(process.cwd(), 'src/app/layout.tsx'),
      'utf8'
    );
    expect(layout).toMatch(/<html lang={lang} dir={dir}/);
    expect(layout).not.toMatch(/<html lang="/);
  });
});

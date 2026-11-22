import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { serializeJsonLd } from '@/lib/seo/json-ld';
import { FAQJsonLd, JsonLdScript } from '@/components/seo/json-ld';
import { notificationLinkTarget } from '@/lib/security/safe-link';

vi.hoisted(() => {
  process.env.SKIP_ENV_VALIDATION = 'true';
});

/**
 * JSON-LD escaping and notification links (private security review SEC-17,
 * SEC-18).
 */

const HOSTILE = [
  '</script><img src=x onerror=alert(1)>',
  '</script ><b>x</b>',
  '</script/x>',
  '</SCRIPT\t>',
  '<!-- comment',
  '--> end',
  'a & b',
  'line\u2028separator\u2029paragraph',
];

describe('serializeJsonLd', () => {
  it.each(HOSTILE)('writes %j inertly and keeps the value', (text) => {
    const out = serializeJsonLd({ text });
    expect(out).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(out)).toEqual({ text });
  });

  it('handles undefined', () => {
    expect(serializeJsonLd(undefined)).toBe('null');
  });
});

describe('JSON-LD components', () => {
  it('a hostile FAQ cannot end its script element', () => {
    const html = renderToStaticMarkup(
      <FAQJsonLd
        items={HOSTILE.map((t) => ({ question: t, answer: `Use ${t}` }))}
      />
    );
    // Exactly one script element: the one we opened.
    expect(html.match(/<\/script/gi)).toHaveLength(1);
    expect(html.match(/<script/gi)).toHaveLength(1);
    expect(html).not.toContain('<!--');
    expect(html).not.toContain('<img');
    const json = html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    const data = JSON.parse(json);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity[0].name).toBe(HOSTILE[0]);
  });

  it('JsonLdScript renders nothing for null', () => {
    expect(
      renderToStaticMarkup(<JsonLdScript data={null} scriptKey="x" />)
    ).toBe('');
  });
});

describe('notificationLinkTarget', () => {
  const SITE = 'https://reelforge.example';

  it.each([
    ['/dashboard/licences', { kind: 'internal', path: '/dashboard/licences' }],
    ['/order?order=1#key', { kind: 'internal', path: '/order?order=1#key' }],
    [
      `${SITE}/dashboard/inbox?x=1`,
      { kind: 'internal', path: '/dashboard/inbox?x=1' },
    ],
    [
      'https://github.com/buildbase-app/reelforge-studio/releases',
      {
        kind: 'external',
        url: 'https://github.com/buildbase-app/reelforge-studio/releases',
      },
    ],
  ])('accepts %s', (link, target) => {
    expect(notificationLinkTarget(link, SITE)).toEqual(target);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.example/x',
    '/\\evil.example/x',
    '/\t/evil.example',
    'http://github.com/x',
    'https://evil.example/x',
    'https://github.com.evil.example/x',
    '',
    null,
    undefined,
  ])('refuses %j', (link) => {
    expect(notificationLinkTarget(link, SITE)).toBeNull();
  });
});

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));

import manifest from '@/app/manifest';
import { OrganizationJsonLd } from '@/components/seo/json-ld';
import { siteConfig } from '@/config/site';
import { seoConfig } from '@/config/seo';
import aboutPage from '@/content/pages/about/en';
import licencePage from '@/content/pages/licence/en';
import messages from '@/i18n/messages/en';
import { authorPersonJsonLd } from '@/lib/blog/authors';

function organizationJsonLd() {
  const { container } = render(<OrganizationJsonLd />);
  const script = container.querySelector('script');
  return JSON.parse(script?.innerHTML ?? '{}') as Record<string, unknown>;
}

describe('SEO copy (Content C45 to C48)', () => {
  it('C45: page titles do not repeat the name the template adds', () => {
    expect(aboutPage.seoTitle).toBe('About');
    expect(licencePage.seoTitle).toBe('Licences');
    expect(messages.waitlist.title).toBe('Join the waitlist');
    for (const title of [
      aboutPage.seoTitle,
      licencePage.seoTitle,
      messages.waitlist.title,
    ]) {
      expect(title).not.toMatch(/RenderWeld/);
    }
  });

  it('C46: the home description matches the plan and stays under 160 characters', () => {
    const description = messages.home.meta.description;
    expect(description).toBe(
      "RenderWeld turns your AI agent's plan into finished video on your own server. Any size, any frame rate, MP4 to ProRes. Free for personal use."
    );
    expect(description.length).toBeLessThan(160);
  });

  it('C47: the organisation in structured data is the company, not the product', () => {
    expect(seoConfig.publisher.name).toBe(siteConfig.company.legalName);
    const data = organizationJsonLd();
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('Jagodana LLC');
    const person = authorPersonJsonLd({
      name: 'Ada',
      username: 'ada',
      links: {},
    } as Parameters<typeof authorPersonJsonLd>[0]);
    expect(person.worksFor.name).toBe('Jagodana LLC');
    // The product itself keeps its name.
    expect(seoConfig.brand.name).toBe('RenderWeld');
  });

  it('C48: the app manifest describes the product plainly', () => {
    expect(manifest().description).toBe(
      'Your AI agent plans the video. RenderWeld renders it.'
    );
  });
});

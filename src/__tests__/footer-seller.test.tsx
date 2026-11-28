import { render, screen } from '@testing-library/react';
import { createTranslator } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import en from '@/i18n/messages/en';
import { siteConfig } from '@/config/site';

/**
 * The footer names the seller, not the platform (studio issue #578), and
 * buyer copy names BuildBase only where the buyer must act on it.
 */

vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));
vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) =>
    createTranslator({ locale: 'en', messages: en, namespace } as never),
}));
vi.mock('@/i18n/link', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('@/components/theme-toggle', () => ({ ThemeToggle: () => null }));
vi.mock('@/components/language-switcher', () => ({
  LanguageSwitcher: () => null,
}));
vi.mock('@/components/brand-logo', () => ({ BrandLogo: () => null }));
vi.mock('@/components/tracking/cookie-settings-button', () => ({
  CookieSettingsButton: () => null,
}));

import { SiteFooter } from '@/components/site-footer';

describe('footer seller line', () => {
  it('names Jagodana LLC as the seller', async () => {
    render(await SiteFooter({ title: 'RenderWeld' }));
    const year = new Date().getFullYear();
    expect(siteConfig.company.legalName).toBe('Jagodana LLC');
    expect(document.body.textContent).toContain(
      `© ${year} Jagodana LLC. RenderWeld is a trademark of Jagodana LLC.`
    );
  });

  it('carries no platform badge', async () => {
    render(await SiteFooter({ title: 'RenderWeld' }));
    expect(document.querySelector('img[alt*="BuildBase"]')).toBeNull();
    expect(document.body.textContent).not.toContain('Built with');
  });

  it('uses the plain tagline and link labels (studio issues #649 to #654)', async () => {
    render(await SiteFooter({ title: 'RenderWeld' }));
    const text = document.body.textContent ?? '';
    expect(text).toContain(
      'Your AI agent plans the video. RenderWeld renders it on your own server. Free for personal use; pay once for commercial use.'
    );
    for (const label of [
      'Connect your agent',
      'Source code',
      'Licence terms',
      'Privacy policy',
      'Terms of service',
      'Cookie policy',
      'Refund policy',
    ])
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    for (const href of ['/gallery', '/blog', '/changelog'])
      expect(document.querySelector(`a[href="${href}"]`)).toBeNull();
  });
});

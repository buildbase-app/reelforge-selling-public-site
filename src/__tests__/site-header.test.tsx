import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * One header on every public page (studio issue #215): the home page's
 * primary action sits in the site header, decided like the page's own
 * buttons, and is the header's only filled button.
 */

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock('@/i18n/link', () => ({
  Link: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/auth/auth-island', () => ({
  requestSignIn: vi.fn(() => new Promise<never>(() => {})),
  preloadAuth: vi.fn(),
  reportSignInFailure: vi.fn(),
  SIGN_IN_TIMEOUT_MS: 10_000,
}));

import { HomeHeader } from '@/components/home-header';
import { HeaderCta, primaryCta } from '@/components/store/store-ctas';
import { LiteAuthButton } from '@/components/auth/lite-auth-button';
import { SessionHintProvider } from '@/components/auth/session-hint';

const labels = {
  waitlist: 'Join the waitlist',
  pricing: 'See pricing',
  buy: 'Buy ReelForge',
  faq: 'Read the FAQ',
};

async function renderHeader(action?: React.ReactNode) {
  const header = await HomeHeader({
    title: 'ReelForge',
    action,
    auth: (
      <LiteAuthButton
        labels={{ signIn: 'Sign In', dashboard: 'Dashboard', loading: '…' }}
      />
    ),
  });
  return render(
    <SessionHintProvider hasSession={false}>{header}</SessionHintProvider>
  );
}

describe('primaryCta', () => {
  it('is the waitlist until the store is on sale, then the buy action', () => {
    expect(primaryCta(labels, false)).toEqual({
      href: '/waitlist',
      label: 'Join the waitlist',
      target: 'waitlist',
    });
    expect(primaryCta(labels, true)).toEqual({
      href: '/pricing',
      label: 'Buy ReelForge',
      target: 'pricing',
    });
  });
});

describe('HeaderCta', () => {
  it.each([
    [false, 'Join the waitlist', '/waitlist'],
    [true, 'Buy ReelForge', '/pricing'],
    // The store read failed: the same fallback as the hero's buttons.
    [undefined, 'Join the waitlist', '/waitlist'],
  ])('onSale=%s shows %s', (onSale, label, href) => {
    render(<HeaderCta labels={labels} onSale={onSale} />);
    const link = screen.getByRole('link', { name: label });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('data-header-cta');
    expect(link).toHaveAttribute('data-bb-goal-section', 'header');
  });
});

describe('HomeHeader', () => {
  it('puts the home page action in the header, with sign-in as a ghost button', async () => {
    await renderHeader(<HeaderCta labels={labels} onSale={false} />);
    const banner = screen.getByRole('banner');
    expect(
      within(banner).getByRole('link', { name: 'Join the waitlist' })
    ).toBeInTheDocument();
    expect(
      within(banner).getByRole('button', { name: 'Sign In' })
    ).toHaveAttribute('data-variant', 'ghost');
    // "Connect your agent" goes to the home page's section of that name.
    for (const link of within(banner).getAllByText('Connect your agent'))
      expect(link.closest('a')).toHaveAttribute('href', '/#connect');
  });

  it('has no primary action on other pages', async () => {
    await renderHeader();
    const banner = screen.getByRole('banner');
    expect(banner.querySelector('[data-header-cta]')).toBeNull();
    expect(
      within(banner).queryByRole('link', { name: /waitlist|buy/i })
    ).toBeNull();
  });

  it('closes the menu when a link in it is followed', async () => {
    const hide = vi.fn();
    HTMLElement.prototype.hidePopover = hide;
    await renderHeader();
    const toggle = screen.getByRole('button', { name: 'nav.menu' });
    expect(toggle).toHaveAttribute('popovertarget', 'site-menu');
    const menu = document.getElementById('site-menu')!;
    expect(menu).toHaveAttribute('popover', 'auto');
    // jsdom cannot navigate; the handler only needs the click.
    menu.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(within(menu).getByText('Gallery'));
    expect(hide).toHaveBeenCalledTimes(1);
  });
});

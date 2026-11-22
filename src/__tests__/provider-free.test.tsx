import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicItemView } from '@buildbase/sdk';

/**
 * The provider-free public pages (studio issue #79): the cookie banner's
 * first view answers exactly as the SDK's banner does, and the home page's
 * offer cards sign in (signed out) or link to /pricing (signed in) without
 * loading the BuildBase provider.
 */

const consent = {
  state: null as null | { analytics: boolean; marketing: boolean },
  set: vi.fn(),
};
let stored: null | { analytics: boolean; marketing: boolean } = null;
const setAnalyticsConsent = vi.fn();

vi.mock('@buildbase/sdk/tracking', () => ({
  useTracking: () => ({ consent }),
  getAnalyticsConsent: () => stored,
  setAnalyticsConsent: (...args: unknown[]) => setAnalyticsConsent(...args),
}));

const requestSignIn = vi.fn();
vi.mock('@/components/auth/auth-island', () => ({
  requestSignIn: (...args: unknown[]) => requestSignIn(...args),
  preloadAuth: vi.fn(),
}));

vi.mock('@/i18n/link', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { LiteCookieBanner } from '@/components/tracking/lite-cookie-banner';
import { LitePricingCatalog } from '@/components/store/pricing-catalog-lite';
import { SessionHintProvider } from '@/components/auth/session-hint';

beforeEach(() => {
  consent.state = null;
  consent.set.mockReset();
  setAnalyticsConsent.mockReset();
  requestSignIn.mockReset();
  stored = null;
});

describe('LiteCookieBanner', () => {
  it('asks once, with the SDK banner copy and buttons', () => {
    render(<LiteCookieBanner privacyHref="/privacy" />);
    expect(
      screen.getByRole('region', { name: 'Cookie consent' })
    ).toBeInTheDocument();
    expect(screen.getByText('Cookies on this site')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Privacy policy' })
    ).toHaveAttribute('href', '/privacy');
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Reject all',
      'Choose',
      'Accept all',
    ]);
  });

  it('records "Accept all" on the tracker and in the bb_consent cookie, then hides', () => {
    render(<LiteCookieBanner privacyHref="/privacy" />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept all' }));
    const all = { analytics: true, marketing: true };
    expect(consent.set).toHaveBeenCalledWith(all, { source: 'banner' });
    expect(setAnalyticsConsent).toHaveBeenCalledWith(all, { source: 'banner' });
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('records "Reject all" as a refusal of both', () => {
    render(<LiteCookieBanner privacyHref="/privacy" />);
    fireEvent.click(screen.getByRole('button', { name: 'Reject all' }));
    expect(setAnalyticsConsent).toHaveBeenCalledWith(
      { analytics: false, marketing: false },
      { source: 'banner' }
    );
  });

  it('stays hidden for a visitor who already answered', () => {
    stored = { analytics: true, marketing: false };
    render(<LiteCookieBanner privacyHref="/privacy" />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});

function items(): PublicItemView[] {
  const variant = (id: string, mode: 'free' | 'fixed', amount?: number) => ({
    id,
    label: id,
    prices: [{ id: `${id}-usd`, currency: 'usd', mode, amount }],
    stock: { mode: 'none' },
  });
  return [
    {
      _id: 'personal',
      title: 'Personal',
      slug: 'reelforge-personal',
      variants: [variant('noncommercial', 'free')],
      benefits: [],
    },
    {
      _id: 'commercial',
      title: 'Commercial',
      slug: 'reelforge-commercial',
      variants: [variant('solo', 'fixed', 4900)],
      benefits: [],
    },
  ] as unknown as PublicItemView[];
}

describe('LitePricingCatalog (home page, no provider)', () => {
  it('signed out: the server prices, and buttons that sign in and return to /pricing', () => {
    render(
      <SessionHintProvider hasSession={false}>
        <LitePricingCatalog serverItems={items()} />
      </SessionHintProvider>
    );
    expect(screen.getByText('Free')).toBeInTheDocument();
    // The amount, then its term in a smaller element of its own.
    const amount = screen.getByText(/^\$49(\.00)?$/);
    expect(amount.parentElement!.textContent).toMatch(/^\$49(\.00)? one-time$/);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Get it free',
      'Sign in to buy',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in to buy' }));
    expect(requestSignIn).toHaveBeenCalledWith(
      `${window.location.origin}/pricing`
    );
  });

  it('signed in: each card links to /pricing, where checkout is', () => {
    render(
      <SessionHintProvider hasSession>
        <LitePricingCatalog serverItems={items()} />
      </SessionHintProvider>
    );
    const links = screen.getAllByRole('link');
    expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Get it free', '/pricing'],
      ['Buy', '/pricing'],
    ]);
    expect(requestSignIn).not.toHaveBeenCalled();
  });
});

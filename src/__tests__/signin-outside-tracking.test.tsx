import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * Sign-in on the provider-free pages loads on its own, whatever happens to
 * analytics (studio issue #596): the sign-in island mounts beside the
 * tracking chunk, not inside it, so a blocker that stops tracking leaves
 * sign-in working.
 */

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined }),
}));
vi.mock('@/lib/buildbase', () => ({ SESSION_COOKIE_NAME: 'bb-session-id' }));
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));
vi.mock('@/components/home-header', () => ({ HomeHeader: () => null }));
vi.mock('@/components/site-footer', () => ({ SiteFooter: () => null }));
vi.mock('@/components/auth/lite-auth-button', () => ({
  LiteAuthButton: () => null,
}));
// Tracking blocked: its chunk never renders anything.
vi.mock('@/components/tracking/site-tracking', () => ({
  SiteTracking: () => null,
}));
vi.mock('@/components/auth/auth-island', () => ({
  AuthIslandHost: () => <div data-auth-island />,
}));

import { MarketingShell } from '@/components/marketing/marketing-shell';

const src = (...parts: string[]) =>
  readFileSync(join(__dirname, '..', ...parts), 'utf8');

describe('sign-in without tracking', () => {
  it('mounts the sign-in island even when tracking renders nothing', async () => {
    render(await MarketingShell({ children: <p>page</p> }));
    expect(document.querySelector('[data-auth-island]')).not.toBeNull();
  });

  it('leaves the island out when the page brings its own provider', async () => {
    render(
      await MarketingShell({ children: <p>page</p>, auth: <span>auth</span> })
    );
    expect(document.querySelector('[data-auth-island]')).toBeNull();
  });

  it('keeps the island out of the tracking chunk', () => {
    const tracking = src('components', 'tracking', 'site-tracking-sdk.tsx');
    expect(tracking).not.toMatch(/auth-island|AuthIslandHost/);
  });
});

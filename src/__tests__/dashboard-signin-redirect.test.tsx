import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import en from '@/i18n/messages/en';

/**
 * A signed-out visitor on the dashboard goes to /signin?next=<this page>,
 * not to the home page (studio issue #598).
 */

const auth = { status: 'unauthenticated', isAuthenticated: false };
const replace = vi.fn();

vi.mock('@buildbase/sdk/react', () => ({
  useSaaSAuth: () => auth,
  WhenAuthenticated: () => null,
  WhenUnauthenticated: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  NotificationBell: () => null,
  WhenPendingInvitations: () => null,
  PendingInvitations: () => null,
}));
vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));
vi.mock('@/components/app-sidebar', () => ({ AppSidebar: () => null }));
vi.mock('@/components/agents/web-mcp-tools', () => ({
  WebMcpTools: () => null,
}));

import {
  DashboardLayoutClient,
  signInPath,
} from '@/components/dashboard-layout-client';

function show() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <DashboardLayoutClient>
        <p>dashboard</p>
      </DashboardLayoutClient>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  replace.mockReset();
  auth.status = 'unauthenticated';
  auth.isAuthenticated = false;
});

describe('signInPath', () => {
  it('keeps the page and its query as next', () => {
    expect(
      signInPath({ pathname: '/dashboard/licences', search: '?tab=keys' })
    ).toBe('/signin?next=%2Fdashboard%2Flicences%3Ftab%3Dkeys');
  });
});

describe('dashboard, signed out', () => {
  it('sends the visitor to /signin?next=/dashboard', () => {
    window.history.pushState({}, '', '/dashboard');
    show();
    expect(replace).toHaveBeenCalledWith('/signin?next=%2Fdashboard');
  });

  it('waits while the sign-in state is loading', () => {
    auth.status = 'loading';
    show();
    expect(replace).not.toHaveBeenCalled();
  });

  it('stays put when signed in', () => {
    auth.status = 'authenticated';
    auth.isAuthenticated = true;
    show();
    expect(replace).not.toHaveBeenCalled();
  });
});

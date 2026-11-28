import { act, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import en from '@/i18n/messages/en';

/**
 * /signin (studio issue #597): starts the hosted sign-in on load, returns
 * to a same-site ?next=, keeps a "Continue to sign in" button, shows the
 * sign-in error (studio issue #595), and /login and /sign-in lead here.
 */

const auth = {
  status: 'unauthenticated' as string,
  signIn: vi.fn<(url?: string) => Promise<void>>(async () => {}),
};
let search = '';
const replace = vi.fn();
const reportSignInFailure = vi.fn();

vi.mock('@buildbase/sdk/react', () => ({ useSaaSAuth: () => auth }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(search),
  useRouter: () => ({ replace }),
}));
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('@/components/auth/auth-island', () => ({
  SIGN_IN_TIMEOUT_MS: 10_000,
  reportSignInFailure: (...args: unknown[]) => reportSignInFailure(...args),
}));

import { SignInPage, signInNext } from '@/components/auth/sign-in-page';

function show() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <SignInPage />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  auth.status = 'unauthenticated';
  auth.signIn.mockReset();
  auth.signIn.mockImplementation(async () => {});
  replace.mockReset();
  reportSignInFailure.mockReset();
  search = '';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('signInNext', () => {
  it('keeps a path on this site', () => {
    expect(signInNext('/pricing?claim=personal')).toBe(
      '/pricing?claim=personal'
    );
  });

  it('refuses other sites and falls back to the dashboard', () => {
    for (const raw of [
      null,
      '',
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      'javascript:alert(1)',
    ]) {
      expect(signInNext(raw)).toBe('/dashboard');
    }
  });
});

describe('/signin', () => {
  it('starts the hosted sign-in on load, back to ?next=', async () => {
    search = 'next=%2Forder%3Fid%3Do1';
    show();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(auth.signIn).toHaveBeenCalledTimes(1);
    expect(auth.signIn.mock.calls[0][0]).toBe(
      `${window.location.origin}/order?id=o1`
    );
    expect(
      screen.getByRole('button', { name: 'Continue to sign in' })
    ).toBeEnabled();
  });

  it('sends a signed-in visitor straight on', () => {
    auth.status = 'authenticated';
    search = 'next=%2Fdashboard%2Flicences';
    show();
    expect(replace).toHaveBeenCalledWith('/dashboard/licences');
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('shows the sign-in error when the start fails, and can try again', async () => {
    auth.signIn.mockImplementationOnce(async () => {
      throw new Error('blocked');
    });
    show();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Sign-in didn't start. Try again, or contact support."
    );
    expect(reportSignInFailure).toHaveBeenCalledWith(
      'error',
      expect.any(Error)
    );
    // The start runs after a microtask, as in the browser.
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Continue to sign in' })
      );
    });
    expect(auth.signIn).toHaveBeenCalledTimes(2);
  });

  it('shows the error when nothing happens within 10 seconds', async () => {
    auth.signIn.mockImplementation(() => new Promise<void>(() => {}));
    show();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_001);
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(reportSignInFailure).toHaveBeenCalledWith('timeout', undefined);
  });
});

describe('/login and /sign-in', () => {
  it('redirect to /signin', () => {
    const config = readFileSync(
      join(__dirname, '..', '..', 'next.config.ts'),
      'utf8'
    );
    expect(config).toMatch(/source: '\/login', destination: '\/signin'/);
    expect(config).toMatch(/source: '\/sign-in', destination: '\/signin'/);
  });
});

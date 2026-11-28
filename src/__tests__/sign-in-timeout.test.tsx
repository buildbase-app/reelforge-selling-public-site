import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A sign-in press ends in a redirect or a visible message with a retry
 * within 10 seconds, and the failure is reported (studio issue #595).
 */

const requestSignIn = vi.fn();
const reportSignInFailure = vi.fn();
vi.mock('@/components/auth/auth-island', () => ({
  SIGN_IN_TIMEOUT_MS: 10_000,
  requestSignIn: (...args: unknown[]) => requestSignIn(...args),
  reportSignInFailure: (...args: unknown[]) => reportSignInFailure(...args),
  preloadAuth: vi.fn(),
}));

vi.mock('@/i18n/link', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { SignInButton } from '@/components/auth/lite-auth-button';

const SIGN_IN_TIMEOUT_MS = 10_000;

beforeEach(() => {
  vi.useFakeTimers();
  requestSignIn.mockReset();
  reportSignInFailure.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

const press = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

describe('SignInButton', () => {
  it('shows a message and a retry when nothing happens for 10 seconds', () => {
    requestSignIn.mockReturnValue(new Promise(() => {}));
    render(<SignInButton loadingLabel="Loading">Sign in</SignInButton>);
    press();
    expect(screen.getByRole('button', { name: 'Loading' })).toBeDisabled();
    expect(screen.queryByRole('alert')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(SIGN_IN_TIMEOUT_MS - 1);
    });
    expect(screen.queryByRole('alert')).toBeNull();
    act(() => {
      vi.advanceTimersByTime(1);
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(
      "Sign-in didn't start. Try again, or contact support."
    );
    expect(screen.getByRole('link', { name: 'contact support' })).toHaveAttribute(
      'href',
      '/contact'
    );
    expect(reportSignInFailure).toHaveBeenCalledWith('timeout', undefined);

    // The button is back and starts a new attempt.
    press();
    expect(requestSignIn).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the message at once when sign-in fails to start', async () => {
    const error = new TypeError('Failed to fetch');
    requestSignIn.mockReturnValue(Promise.reject(error));
    render(<SignInButton>Sign in</SignInButton>);
    press();
    await act(async () => {});

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(reportSignInFailure).toHaveBeenCalledTimes(1);
    expect(reportSignInFailure).toHaveBeenCalledWith('error', error);

    // The timer of the failed attempt does not report it a second time.
    act(() => {
      vi.advanceTimersByTime(SIGN_IN_TIMEOUT_MS);
    });
    expect(reportSignInFailure).toHaveBeenCalledTimes(1);
  });
});

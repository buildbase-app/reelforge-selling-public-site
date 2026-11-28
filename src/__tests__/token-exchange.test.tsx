import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearSignInUnfinished,
  exchangeSignInCode,
  readSessionId,
  SignInExchangeError,
} from '@/components/auth/token-exchange';
import { SignInUnfinished } from '@/components/auth/sign-in-unfinished';

/**
 * A failed code exchange is an error the visitor sees, with a way back to
 * /signin, and a session read that gets something other than JSON counts
 * as signed out (studio issue #600).
 */

function answer(body: unknown, status = 200) {
  return vi.fn(async () =>
    typeof body === 'string'
      ? new Response(body, { status })
      : Response.json(body, { status })
  ) as unknown as typeof fetch;
}

afterEach(() => {
  act(() => clearSignInUnfinished());
});

describe('exchangeSignInCode', () => {
  it('returns the session id the store gives', async () => {
    await expect(
      exchangeSignInCode('code', answer({ sessionId: 's1' }))
    ).resolves.toEqual({ sessionId: 's1' });
  });

  it('throws on a refused exchange and shows the notice', async () => {
    render(<SignInUnfinished />);
    expect(screen.queryByRole('alert')).toBeNull();
    let error: unknown;
    await act(async () => {
      error = await exchangeSignInCode(
        'code',
        answer({ success: false }, 401)
      ).catch((e: unknown) => e);
    });
    expect(error).toBeInstanceOf(SignInExchangeError);
    expect((error as SignInExchangeError).status).toBe(401);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent("Sign-in didn't finish. Please try again.");
    expect(screen.getByRole('link', { name: 'Sign in again' })).toHaveAttribute(
      'href',
      '/signin'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('throws on an answer without a session, or no answer at all', async () => {
    await expect(
      exchangeSignInCode('code', answer({ success: true }))
    ).rejects.toBeInstanceOf(SignInExchangeError);
    await expect(
      exchangeSignInCode('code', answer('<html>Bad gateway</html>', 502))
    ).rejects.toBeInstanceOf(SignInExchangeError);
    const offline = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    await expect(exchangeSignInCode('code', offline)).rejects.toMatchObject({
      status: 0,
    });
  });
});

describe('readSessionId', () => {
  it('reads the session id', async () => {
    await expect(readSessionId(answer({ sessionId: 's1' }))).resolves.toBe(
      's1'
    );
    await expect(readSessionId(answer({ sessionId: null }))).resolves.toBe(
      null
    );
  });

  it('counts an error page or non-JSON answer as signed out', async () => {
    await expect(
      readSessionId(answer('<html>oops</html>', 200))
    ).resolves.toBeNull();
    await expect(readSessionId(answer({}, 500))).resolves.toBeNull();
  });
});

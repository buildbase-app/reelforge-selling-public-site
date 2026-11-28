import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

/**
 * The post-deploy sign-in smoke test and the nightly alert (studio issue
 * #605). The browser part runs in CI; these check what counts as reaching
 * the hosted page and that a failure is reported.
 */

const require = createRequire(import.meta.url);
const { SIGN_IN_DEADLINE_MS, reachedHostedSignIn, sendAlert } =
  require('../../scripts/lib/smoke.cjs') as {
    SIGN_IN_DEADLINE_MS: number;
    reachedHostedSignIn: (
      site: string,
      url: string,
      hostedHost?: string
    ) => boolean;
    sendAlert: (
      text: string,
      env: Record<string, string | undefined>,
      fetchImpl: typeof fetch
    ) => Promise<boolean>;
  };

const SITE = 'https://renderweld.com';

describe('reachedHostedSignIn', () => {
  it('gives Sign In 10 seconds', () => {
    expect(SIGN_IN_DEADLINE_MS).toBe(10_000);
  });

  it('passes once the browser is on another https host', () => {
    expect(
      reachedHostedSignIn(SITE, 'https://auth.example.test/sign-in?x=1')
    ).toBe(true);
  });

  it('fails while the browser is still on the store', () => {
    expect(reachedHostedSignIn(SITE, 'https://renderweld.com/')).toBe(false);
    expect(reachedHostedSignIn(SITE, 'https://renderweld.com/signin')).toBe(
      false
    );
  });

  it('fails on a plain http page or an address it cannot read', () => {
    expect(reachedHostedSignIn(SITE, 'http://auth.example.test/')).toBe(false);
    expect(reachedHostedSignIn(SITE, 'about:blank')).toBe(false);
  });

  it('holds to HOSTED_HOST when it is set', () => {
    expect(
      reachedHostedSignIn(
        SITE,
        'https://id.auth.example.test/',
        'auth.example.test'
      )
    ).toBe(true);
    expect(
      reachedHostedSignIn(
        SITE,
        'https://evil.example.test/',
        'auth.example.test'
      )
    ).toBe(false);
  });
});

describe('sendAlert', () => {
  it('posts the text to ALERT_WEBHOOK_URL', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }));
    const sent = await sendAlert(
      'smoke failed',
      { ALERT_WEBHOOK_URL: 'https://hooks.example.test/x' },
      fetchImpl as unknown as typeof fetch
    );
    expect(sent).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith('https://hooks.example.test/x', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: 'smoke failed' }),
    });
  });

  it('only logs when no webhook is set, and never throws', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchImpl = vi.fn(async () => {
      throw new Error('down');
    });
    await expect(
      sendAlert('x', {}, fetchImpl as unknown as typeof fetch)
    ).resolves.toBe(false);
    await expect(
      sendAlert(
        'x',
        { ALERT_WEBHOOK_URL: 'https://hooks.example.test/x' },
        fetchImpl as unknown as typeof fetch
      )
    ).resolves.toBe(false);
    error.mockRestore();
  });
});

describe('npm scripts', () => {
  it('offers the smoke test and the alerting nightly run', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts['smoke:sign-in']).toBe('node scripts/smoke-sign-in.cjs');
    expect(pkg.scripts['e2e:personal:nightly']).toBe(
      'node scripts/alert-on-failure.cjs e2e:personal'
    );
  });
});

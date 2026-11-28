/* eslint-disable @typescript-eslint/no-require-imports -- a plain Node CommonJS script */
// Post-deploy smoke test (studio issue #605): open the store, press the
// header's Sign In, and pass only if the browser reaches the BuildBase
// hosted sign-in page within 10 seconds. It signs nobody in and creates
// nothing, so it is safe against production.
//
//   node scripts/smoke-sign-in.cjs                         # https://renderweld.com
//   SITE=https://dev.renderweld.com node scripts/smoke-sign-in.cjs
//   HOSTED_HOST=<sign-in host> ...   # also require that host
//
// On failure it exits 1 and posts to ALERT_WEBHOOK_URL when set.
// Needs Playwright's Chromium (or CHROMIUM_PATH). Behind an HTTPS proxy it uses HTTPS_PROXY.
const { chromium } = require('playwright');
const {
  SIGN_IN_DEADLINE_MS,
  reachedHostedSignIn,
  sendAlert,
} = require('./lib/smoke.cjs');

const SITE = (process.env.SITE || 'https://renderweld.com').replace(/\/$/, '');
const HOSTED_HOST = process.env.HOSTED_HOST || '';

(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    ...(process.env.HTTPS_PROXY
      ? { proxy: { server: process.env.HTTPS_PROXY } }
      : {}),
  });
  try {
    const ctx = await browser.newContext();
    await ctx.addCookies([
      { name: 'bb_consent', value: '1', domain: new URL(SITE).host, path: '/' },
    ]);
    const page = await ctx.newPage();
    await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const button = page
      .getByRole('banner')
      .getByRole('button', { name: /^sign in$/i })
      .first();
    await button.waitFor({ timeout: 15_000 });
    const pressed = Date.now();
    await button.click();
    await page.waitForURL(
      (url) => reachedHostedSignIn(SITE, url.href, HOSTED_HOST),
      { timeout: SIGN_IN_DEADLINE_MS, waitUntil: 'commit' }
    );
    console.log(
      `ok: Sign In reached ${new URL(page.url()).host} in ${Date.now() - pressed} ms`
    );
  } finally {
    await browser.close();
  }
})().catch(async (e) => {
  const reason = (e && e.message ? e.message : String(e)).split('\n')[0];
  console.error(`FAILED: ${reason}`);
  await sendAlert(
    `Sign-in smoke test failed on ${SITE}: Sign In did not reach the hosted sign-in page within 10 seconds. ${reason}`
  );
  process.exit(1);
});

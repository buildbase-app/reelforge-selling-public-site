/* eslint-disable @typescript-eslint/no-require-imports -- a plain Node CommonJS script */
// Free Personal licence on the TEST site, end to end, with no person involved:
// sign up a fresh +test account on the BuildBase development environment
// (test mode: no mail is sent and the code is always 424242) from the
// Personal card's "Get it free" button, dismiss the optional sign-in prompts,
// claim the free Personal licence (no payment page), then check the order
// page and Dashboard > Licences show the key labelled Personal, with the
// "noncommercial use only" reminder. Same pattern as e2e-buyer-journey.cjs.
//
//   node scripts/e2e-personal-claim.cjs            # against https://reelforge-dev.buildbase.app
//   SITE=https://reelforge-dev.buildbase.app node scripts/e2e-personal-claim.cjs
//
// Needs Playwright's Chromium (or CHROMIUM_PATH). Behind an HTTPS proxy it uses HTTPS_PROXY.
// Never point it at production: it relies on test mode.
const { chromium } = require('playwright');
const SITE = (
  process.env.SITE || 'https://reelforge-dev.buildbase.app'
).replace(/\/$/, '');
if (!/reelforge-dev\./.test(SITE) && !process.env.ALLOW_NON_TEST_SITE) {
  console.error('Refusing: SITE must be the test site');
  process.exit(2);
}
const crypto = require('crypto');
const EMAIL = `e2e-free-${Date.now().toString(36)}+test@reelforge.dev`;
const PW = crypto.randomBytes(12).toString('base64url') + 'A1!';
const SHOTS = process.env.SHOTS || '/tmp';
const out = (s) => console.log(s);
const clean = (t) =>
  t
    .replace(/\s+/g, ' ')
    .replace(/[A-Z0-9]{5}(-[A-Z0-9]{5}){4}/g, 'XXXXX-…(key)');
const KEY = /XXXXX-…\(key\)/;
const REMINDER = /noncommercial use only/i;
function expect(ok, what) {
  if (!ok) throw new Error(what);
}
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    ...(process.env.HTTPS_PROXY
      ? { proxy: { server: process.env.HTTPS_PROXY } }
      : {}),
  });
  const ctx = await browser.newContext({
    viewport: { width: 1200, height: 1000 },
  });
  await ctx.addCookies([
    { name: 'bb_consent', value: '1', domain: new URL(SITE).host, path: '/' },
  ]);
  const page = await ctx.newPage();
  await page.goto(SITE + '/pricing', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Personal first: the first card is the free Personal licence.
  const firstCard = page.locator('[data-edition]').first();
  expect(
    (await firstCard.getAttribute('data-edition')) === 'personal',
    'the first pricing card is not Personal'
  );
  const cardText = clean(await firstCard.innerText());
  expect(/Free for personal use/.test(cardText), 'no "Free for personal use"');
  expect(/\bFree\b/.test(cardText), 'the Personal card shows no "Free" price');
  out('0. pricing: Personal first | ' + cardText.slice(0, 120));

  await firstCard.getByRole('button', { name: 'Get it free' }).click();
  await page.waitForURL(/auth\.buildbase\.app/, { timeout: 30000 });
  out('1. signed out: "Get it free" sent us to sign in first');
  await page.waitForTimeout(3000);
  await page.getByText('Create account').click();
  await page.waitForTimeout(3000);
  await page.fill('input[name=name]', 'E2E Free');
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PW);
  await page
    .getByRole('button', { name: /Create account/ })
    .last()
    .click();
  await page.waitForTimeout(8000);
  out(
    '2. sign-up submitted → ' +
      new URL(page.url()).host +
      new URL(page.url()).pathname
  );
  const codes = page.locator(
    'input[autocomplete=one-time-code], input[name*=code i], input[inputmode=numeric]'
  );
  const n = await codes.count();
  if (n) {
    if (n === 1) await codes.first().fill('424242');
    else for (let i = 0; i < 6; i++) await codes.nth(i).fill('424242'[i]);
    await page
      .getByRole('button', { name: /Verify|Continue|Confirm/ })
      .first()
      .click({ timeout: 3000 })
      .catch(() => page.keyboard.press('Enter'));
    await page.waitForTimeout(8000);
    out('3. entered test code 424242 → ' + new URL(page.url()).host);
  } else out('3. no code step shown');
  for (let i = 0; i < 5 && /auth\.buildbase\.app/.test(page.url()); i++) {
    const heading = (
      await page
        .locator('h1, h2')
        .first()
        .innerText()
        .catch(() => '')
    ).trim();
    const skip = page
      .getByRole('button', { name: /^(Not now|Skip|Maybe later|Continue)$/ })
      .first();
    if (!(await skip.count())) break;
    await skip.click();
    await page.waitForTimeout(5000);
    out('3b. prompt "' + heading + '" → dismissed');
  }
  await page.waitForURL(/reelforge-dev\.buildbase\.app/, { timeout: 45000 });
  await page.waitForTimeout(6000);
  if (!/\/pricing/.test(page.url())) {
    await page.goto(SITE + '/pricing', { waitUntil: 'load' });
    await page.waitForTimeout(6000);
  }
  out('4. signed in on the site');

  // Signed in: the SDK's BuyButton with `free`, a claim with no payment page.
  await page
    .locator('[data-edition="personal"]')
    .first()
    .getByRole('button', { name: 'Get it free' })
    .click();
  await page.waitForURL(/\/order\?id=/, { timeout: 60000 });
  expect(
    !/checkout\.stripe\.com/.test(page.url()),
    'a payment page opened for a free claim'
  );
  out('5. claimed with no payment page → ' + new URL(page.url()).pathname);
  await page.waitForTimeout(15000);
  const ot = clean(await page.innerText('main'));
  out(
    '6. order page shows: paid=' +
      /paid/i.test(ot) +
      ' personalLabel=' +
      /Personal licence/.test(ot) +
      ' reminder=' +
      REMINDER.test(ot) +
      ' key=' +
      KEY.test(ot) +
      ' | ' +
      ot.slice(0, 260)
  );
  await page.screenshot({ path: SHOTS + '/p-6-order.png', fullPage: true });
  expect(/Personal licence/.test(ot), 'order page: no "Personal licence"');
  expect(REMINDER.test(ot), 'order page: no noncommercial reminder');
  expect(KEY.test(ot), 'order page: no licence key');
  expect(!/Commercial licence(?!s)/.test(ot), 'order page: says Commercial');
  const upgrade = page.getByRole('link', { name: /Commercial licences/ });
  expect(
    (await upgrade.first().getAttribute('href'))?.endsWith('/pricing'),
    'order page: the reminder does not link to pricing'
  );

  await page.goto(SITE + '/dashboard/licences', { waitUntil: 'load' });
  await page.waitForTimeout(10000);
  const lt = clean(await page.innerText('main').catch(() => ''));
  out(
    '7. dashboard licences: personalLabel=' +
      /Personal licence/.test(lt) +
      ' reminder=' +
      REMINDER.test(lt) +
      ' key=' +
      KEY.test(lt) +
      ' | ' +
      lt.slice(0, 200)
  );
  await page.screenshot({ path: SHOTS + '/p-7-licences.png', fullPage: true });
  expect(
    /Personal licence/.test(lt) && REMINDER.test(lt) && KEY.test(lt),
    'Dashboard > Licences does not show the Personal key with its reminder'
  );
  out('PASSED: free Personal claim (' + EMAIL + ')');
  await browser.close();
})().catch((e) => {
  console.error('FAILED:', e.message.split('\n')[0]);
  process.exit(1);
});

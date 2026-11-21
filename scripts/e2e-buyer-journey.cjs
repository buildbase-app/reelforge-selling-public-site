/* eslint-disable @typescript-eslint/no-require-imports -- a plain Node CommonJS script */
// Buyer journey on the TEST site, end to end, with no person involved:
// sign up a fresh +test account on the BuildBase development environment
// (test mode: no mail is sent and the code is always 424242), dismiss the
// optional sign-in prompts, buy the Studio variant with Stripe test card 4242,
// then check the order page and Dashboard > Licences show the licence key,
// labelled Commercial. (scripts/e2e-personal-claim.cjs claims the free one.)
//
//   node scripts/e2e-buyer-journey.cjs            # against https://reelforge-dev.buildbase.app
//   SITE=https://reelforge-dev.buildbase.app node scripts/e2e-buyer-journey.cjs
//
// Needs Playwright's Chromium (or CHROMIUM_PATH). Behind an HTTPS proxy it uses HTTPS_PROXY.
// Never point it at production: it relies on test mode and Stripe test keys.
const { chromium } = require('playwright');
const SITE = (
  process.env.SITE || 'https://reelforge-dev.buildbase.app'
).replace(/\/$/, '');
if (!/reelforge-dev\./.test(SITE) && !process.env.ALLOW_NON_TEST_SITE) {
  console.error('Refusing: SITE must be the test site');
  process.exit(2);
}
const crypto = require('crypto');
const EMAIL = `e2e-${Date.now().toString(36)}+test@reelforge.dev`;
const PW = crypto.randomBytes(12).toString('base64url') + 'A1!';
const out = (s) => console.log(s);
const clean = (t) =>
  t
    .replace(/\s+/g, ' ')
    .replace(/[A-Z0-9]{5}(-[A-Z0-9]{5}){4}/g, 'XXXXX-…(key)');
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
  await page.getByText('Sign in to buy').first().click();
  await page.waitForURL(/auth\.buildbase\.app/, { timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.getByText('Create account').click();
  await page.waitForTimeout(3000);
  await page.fill('input[name=name]', 'E2E Buyer');
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PW);
  await page
    .getByRole('button', { name: /Create account/ })
    .last()
    .click();
  await page.waitForTimeout(8000);
  out(
    '1. sign-up submitted → ' +
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
    out('2. entered test code 424242 → ' + new URL(page.url()).host);
  } else out('2. no code step shown');
  await page.screenshot({ path: (process.env.SHOTS || '/tmp') + '/b-2.png' });
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
    out('2b. prompt "' + heading + '" → dismissed');
  }
  await page.waitForURL(/reelforge-dev\.buildbase\.app/, { timeout: 45000 });
  await page.waitForTimeout(6000);
  if (!/\/pricing/.test(page.url())) {
    await page.goto(SITE + '/pricing', { waitUntil: 'load' });
    await page.waitForTimeout(6000);
  }
  out(
    '3. signed in on the site; pricing buttons: ' +
      JSON.stringify(
        (
          clean(await page.innerText('main')).match(
            /(Buy[^.]{0,12}|Sign in to buy)/g
          ) || []
        ).slice(0, 3)
      )
  );
  // The Studio tier's own card (Personal comes first, so never count buttons).
  await page
    .locator('[data-edition="commercial"]')
    .filter({ hasText: 'Studio' })
    .getByRole('button', { name: /^Buy/ })
    .click();
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 45000 });
  out('4. Stripe Checkout opened (Studio)');
  await page.waitForTimeout(15000);
  await page.mouse.click(770, 318);
  await page.waitForTimeout(4000);
  let f = null;
  for (const fr of page.frames())
    if (await fr.$('#payment-numberInput').catch(() => null)) {
      f = fr;
      break;
    }
  if (!f) {
    await page.screenshot({ path: (process.env.SHOTS || '/tmp') + '/b-4.png' });
    throw new Error('card frame not found');
  }
  await f.fill('#payment-numberInput', '4242424242424242');
  await f.fill('#payment-expiryInput', '12 / 34');
  await f.fill('#payment-cvcInput', '123');
  await f.fill('#payment-nameInput', 'E2E Buyer').catch(() => {});
  await f.selectOption('#payment-countryInput', 'US').catch(() => {});
  await f.fill('#payment-postalCodeInput', '10001').catch(() => {});
  await page.setViewportSize({ width: 1200, height: 1500 });
  await page.waitForTimeout(1500);
  const opt = await f.$('#payment-linkOptInInput');
  if (opt && (await opt.isChecked().catch(() => false))) {
    await opt.click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(1500);
  out(
    '4a. Link opt-in now checked=' +
      (opt ? await opt.isChecked().catch(() => 'n/a') : 'none')
  );
  await page.screenshot({
    path: (process.env.SHOTS || '/tmp') + '/b-4-filled.png',
  });
  const btn = page
    .locator(
      'button.SubmitButton, button[data-testid=hosted-payment-submit-button]'
    )
    .first();
  const box = (await btn.count()) ? await btn.boundingBox() : null;
  if (box)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  else {
    let b2 = await page
      .getByText('Pay', { exact: true })
      .last()
      .boundingBox()
      .catch(() => null);
    if (!b2)
      for (const fr of page.frames()) {
        b2 = await fr
          .getByText('Pay', { exact: true })
          .last()
          .boundingBox()
          .catch(() => null);
        if (b2) break;
      }
    out(
      '4b. Pay label box ' +
        JSON.stringify(b2 && { x: Math.round(b2.x), y: Math.round(b2.y) })
    );
    if (!b2) throw new Error('Pay button not found');
    await page.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2);
  }
  await page.waitForURL(/reelforge-dev\.buildbase\.app/, { timeout: 120000 });
  out('5. paid → back on ' + new URL(page.url()).pathname);
  await page.waitForTimeout(15000);
  const ot = clean(await page.innerText('main'));
  out(
    '6. order page shows: paid=' +
      /paid/i.test(ot) +
      ' studio=' +
      /Studio/.test(ot) +
      ' key=' +
      /XXXXX-…\(key\)/.test(ot) +
      ' commercialLabel=' +
      /Commercial licence/.test(ot) +
      ' | ' +
      ot.slice(0, 260)
  );
  if (!/Commercial licence/.test(ot) || /noncommercial use only/i.test(ot))
    throw new Error('order page does not label the key Commercial');
  await page.screenshot({
    path: (process.env.SHOTS || '/tmp') + '/b-6-order.png',
    fullPage: true,
  });
  await page.goto(SITE + '/dashboard/licences', { waitUntil: 'load' });
  await page.waitForTimeout(10000);
  const lt = clean(await page.innerText('main').catch(() => ''));
  out(
    '7. dashboard licences: key=' +
      /XXXXX-…\(key\)/.test(lt) +
      ' | ' +
      lt.slice(0, 200)
  );
  await page.screenshot({
    path: (process.env.SHOTS || '/tmp') + '/b-7-licences.png',
    fullPage: true,
  });
  out('PASSED: buyer journey (' + EMAIL + ')');
  await browser.close();
})().catch((e) => {
  console.error('FAILED:', e.message.split('\n')[0]);
  process.exit(1);
});

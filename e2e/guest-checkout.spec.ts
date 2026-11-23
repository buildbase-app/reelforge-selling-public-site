import { test, expect, type Frame, type Page } from '@playwright/test';
import {
  LICENCE_KEY,
  expectNoLicenceKey,
  maskLicenceKeys,
  screenshotMasked,
} from './licence-keys';

/**
 * A guest buys the Solo licence without an account (studio issue #257):
 * home page "Buy now", then the guest form on /pricing, then Stripe Checkout
 * with test card 4242, then `/order?order=&token=` shows Paid and the key.
 *
 * It makes a real (test mode) purchase, so it runs only when asked:
 * `E2E_GUEST_CHECKOUT=1`, against a store built for the BuildBase
 * development environment (the test site's public values). It refuses to
 * enter a card anywhere but a Stripe test-mode Checkout (`cs_test_`).
 * Keys are masked in the page before every screenshot and in the log.
 */

test.skip(
  !process.env.E2E_GUEST_CHECKOUT,
  'makes a Stripe test-mode purchase: set E2E_GUEST_CHECKOUT=1'
);

test.setTimeout(240_000);

async function recordCsp(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] };
    w.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__csp.push(`${e.effectiveDirective} blocked ${e.blockedURI}`);
    });
  });
}

const cspReports = (page: Page) =>
  page.evaluate(() => (window as unknown as { __csp: string[] }).__csp ?? []);

/** The first frame (the page itself included) where `fn` finds something. */
async function inFrames<T>(
  page: Page,
  fn: (frame: Frame) => Promise<T | null>
): Promise<T | null> {
  for (const frame of page.frames()) {
    // A frame can detach while Stripe swaps its forms: skip it.
    const found = await fn(frame).catch(() => null);
    if (found) return found;
  }
  return null;
}

const visible = async (frame: Frame, selector: string) =>
  (await frame.locator(selector).first().isVisible()) ? frame : null;

/**
 * Stripe Checkout's card form. Its payment form is in a frame: open the
 * "Card" method, then use the frame with the card number field (or the
 * classic page's own fields).
 */
async function cardFrame(
  page: Page
): Promise<{ frame: Frame; classic: boolean }> {
  for (let attempt = 0; attempt < 45; attempt++) {
    const classic = await inFrames(page, (f) => visible(f, '#cardNumber'));
    if (classic) return { frame: classic, classic: true };
    const element = await inFrames(page, (f) =>
      visible(f, '#payment-numberInput')
    );
    if (element) return { frame: element, classic: false };
    await inFrames(page, async (f) => {
      const card = f.getByRole('button', { name: 'Card', exact: true });
      if (!(await card.first().isVisible())) return null;
      await card.first().click();
      return true;
    });
    await page.waitForTimeout(1000);
  }
  throw new Error('Stripe card form not found');
}

async function payWithTestCard(page: Page) {
  const { frame: f, classic } = await cardFrame(page);
  const id = (a: string, b: string) => (classic ? a : b);
  await f.fill(id('#cardNumber', '#payment-numberInput'), '4242424242424242');
  // Typed, not filled: the expiry field formats as it goes.
  await f
    .locator(id('#cardExpiry', '#payment-expiryInput'))
    .pressSequentially('1234');
  await f.fill(id('#cardCvc', '#payment-cvcInput'), '123');
  const optional = async (action: Promise<unknown>) => action.catch(() => {});
  if (!classic) {
    await optional(
      f.fill('#payment-nameInput', 'E2E Guest', { timeout: 3000 })
    );
  }
  await optional(
    inFrames(page, async (fr) =>
      (await visible(fr, '#billingName'))
        ? fr.fill('#billingName', 'E2E Guest').then(() => true)
        : null
    )
  );
  await optional(
    f.selectOption(id('#billingCountry', '#payment-countryInput'), 'US', {
      timeout: 3000,
    })
  );
  await optional(
    f.fill(id('#billingPostalCode', '#payment-postalCodeInput'), '10001', {
      timeout: 3000,
    })
  );
  // Never save the test card to Link.
  await inFrames(page, async (fr) => {
    const link = fr.locator('#enableStripePass, #payment-linkOptInInput');
    if (!(await link.first().isChecked({ timeout: 1000 }))) return null;
    await link.first().click({ force: true });
    return true;
  });
  const pay = await inFrames(page, async (fr) => {
    const submit = fr
      .locator(
        'button.SubmitButton, button[data-testid="hosted-payment-submit-button"]'
      )
      .or(fr.getByRole('button', { name: 'Pay', exact: true }))
      .first();
    return (await submit.isVisible()) ? submit : null;
  });
  if (!pay) throw new Error('Stripe Pay button not found');
  await pay.click();
}

test('a guest buys Solo and /order shows the key', async ({
  page,
  baseURL,
}, testInfo) => {
  const shot = (name: string) => testInfo.outputPath(name);
  const email = `e2e-guest-${Date.now().toString(36)}+test@reelforge.dev`;
  await page
    .context()
    .addCookies([{ name: 'bb_consent', value: '1', url: baseURL! }]);
  await recordCsp(page);

  // Home: the Solo card's "Buy now" opens its guest checkout on /pricing.
  await page.goto('/');
  const homeSolo = page
    .locator('[data-edition="commercial"]')
    .filter({ hasText: 'Solo' });
  await expect(homeSolo.getByRole('link', { name: 'Buy now' })).toBeVisible();
  await expect(
    homeSolo.getByRole('button', { name: 'Sign in to buy' })
  ).toBeVisible();
  // The free licence stays account-only.
  await expect(
    page.locator('[data-edition="personal"]').getByText('Buy now')
  ).toHaveCount(0);
  expect(await cspReports(page)).toEqual([]);
  await homeSolo.getByRole('link', { name: 'Buy now' }).click();

  await page.waitForURL(/\/pricing\?buy=/);
  const solo = page
    .locator('[data-edition="commercial"]')
    .filter({ hasText: 'Solo' });
  await expect(solo.getByLabel('Email')).toBeVisible({ timeout: 30_000 });
  await solo.getByLabel('Name').fill('E2E Guest');
  await solo.getByLabel('Email').fill(email);
  await page.screenshot({ path: shot('g-1-pricing-form.png'), fullPage: true });
  expect(await cspReports(page)).toEqual([]);
  await solo.getByRole('button', { name: 'Continue to payment' }).click();

  // Stripe, test mode only.
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });
  expect(page.url(), 'not a Stripe test-mode Checkout').toMatch(/cs_test_/);
  await payWithTestCard(page);

  // Back on the store with the order's token.
  await page.waitForURL(/\/order\?.*order=.*token=/, { timeout: 120_000 });
  await expect(page.getByRole('heading', { name: 'Paid' })).toBeVisible({
    timeout: 90_000,
  });
  const main = page.locator('main');
  await expect(main).toContainText('Solo');
  await expect(main.locator('[data-edition="commercial"]')).toBeVisible({
    timeout: 60_000,
  });
  await expect
    .poll(async () => LICENCE_KEY.test(await main.innerText()), {
      timeout: 60_000,
    })
    .toBe(true);
  console.log(
    'order page:',
    maskLicenceKeys((await main.innerText()).replace(/\s+/g, ' ')).slice(0, 300)
  );
  expect(await cspReports(page)).toEqual([]);

  await screenshotMasked(page, shot('g-2-order.png'));
  await expectNoLicenceKey(page);
});

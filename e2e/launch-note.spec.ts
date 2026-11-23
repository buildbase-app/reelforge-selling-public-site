import { test, expect } from '@playwright/test';
import {
  LAUNCH_PRICE_ENDS_LABEL,
  isLaunchPriceActive,
} from '../src/lib/store/launch';

/**
 * Wherever the launch prices are shown, the end date is too (studio issue
 * #260), whether or not the server can read the `launch-price-note` content
 * block: a local preview has no BuildBase token, so it shows the built-in
 * note. After the end date there is no launch note to look for.
 */
for (const path of ['/', '/pricing']) {
  test(`${path} states when the launch price ends`, async ({ page }) => {
    test.skip(!isLaunchPriceActive(), 'the launch price has ended');
    const res = await page.request.get(path);
    // In the server HTML, not only after hydration.
    expect(await res.text()).toContain(LAUNCH_PRICE_ENDS_LABEL);
    await page.goto(path);
    await expect(
      page.getByRole('note').filter({ hasText: LAUNCH_PRICE_ENDS_LABEL })
    ).toBeVisible();
  });
}

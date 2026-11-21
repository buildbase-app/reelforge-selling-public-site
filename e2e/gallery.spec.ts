import { test, expect } from '@playwright/test';

/**
 * /gallery renders server-side from the BuildBase Collection `gallery`. Without
 * an org API token (a fresh checkout) it shows its empty state; with dev-env
 * data it shows the grid, the filters and the detail pages.
 */
test.describe('Gallery', () => {
  test('is linked from the header and renders', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Gallery' }).first().click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Reels an agent planned'
    );
  });

  test('filters by URL parameters and opens a reel', async ({ page }) => {
    await page.goto('/gallery?engine=hyperframes');
    const cards = page.locator('[data-gallery-card] a');
    if ((await cards.count()) === 0) {
      await expect(
        page.getByText('The gallery is being rendered')
      ).toBeVisible();
      return;
    }
    await expect(
      page.getByRole('link', { name: /HyperFrames/ }).first()
    ).toHaveAttribute('aria-current', 'true');
    await cards.first().click();
    await expect(page).toHaveURL(/\/gallery\/[a-z0-9-]+$/);
    await expect(
      page.getByRole('heading', { name: 'The prompt the agent was given' })
    ).toBeVisible();
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(ld.some((t) => t.includes('"VideoObject"'))).toBe(true);
  });
});

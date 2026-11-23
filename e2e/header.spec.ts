import { test, expect, type Page } from '@playwright/test';

/**
 * One header on every public page (studio issue #215). The home page used
 * to stack a sticky product sub-nav under the site header; anchors on `/`
 * must land just below the one header that is left.
 */

/** Sticky or fixed elements whose top edge sits within the top band. */
async function stuckAtTop(page: Page) {
  return page.evaluate(() => {
    const banner = document.querySelector('header')!.getBoundingClientRect();
    return [...document.querySelectorAll('body *')]
      .filter((el) => {
        const { position } = getComputedStyle(el);
        if (position !== 'sticky' && position !== 'fixed') return false;
        const r = el.getBoundingClientRect();
        // A bar stacked right under the header counts as "at the top" too.
        return r.height > 0 && r.bottom > 0 && r.top <= banner.bottom + 1;
      })
      .map((el) => el.tagName.toLowerCase());
  });
}

for (const width of [390, 1440]) {
  test.describe(`at ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const path of ['/', '/pricing']) {
      test(`exactly one sticky element at the top of ${path}`, async ({
        page,
      }) => {
        await page.goto(path);
        expect(await stuckAtTop(page)).toEqual(['header']);
        await page.mouse.wheel(0, 2400);
        await page.waitForTimeout(300);
        expect(await stuckAtTop(page)).toEqual(['header']);
      });
    }

    test('/#how puts "How it works" just below the header', async ({
      page,
    }) => {
      await page.goto('/#how');
      const header = await page.getByRole('banner').boundingBox();
      const section = await page.locator('#how').boundingBox();
      const heading = page.getByRole('heading', {
        name: 'Three steps to your first reel',
      });
      const box = await heading.boundingBox();
      expect(header && section && box).toBeTruthy();
      // The section starts at the header's bottom edge (scroll-margin-top
      // equals the header height), so its heading is below the header and
      // in view, not under it.
      expect(Math.abs(section!.y - (header!.y + header!.height))).toBeLessThan(
        2
      );
      expect(box!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
      expect(box!.y + box!.height).toBeLessThan(900);
      await expect(heading).toBeInViewport();
    });

    test('the home header has one primary action and "Connect your agent"', async ({
      page,
    }) => {
      await page.goto('/');
      const banner = page.getByRole('banner');
      await expect(banner.locator('[data-header-cta]')).toHaveCount(1);
      await expect(banner.locator('[data-header-cta]')).toBeVisible();
      const connect = banner.getByRole('link', { name: 'Connect your agent' });
      if (width >= 1280) {
        await expect(connect).toBeVisible();
      } else {
        await banner.getByRole('button', { name: 'Menu' }).click();
        await expect(connect).toBeVisible();
      }
      // Nothing in the header spills past the viewport.
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBe(width);
    });
  });
}

test('other pages have no header action', async ({ page }) => {
  await page.goto('/pricing');
  await expect(
    page.getByRole('banner').locator('[data-header-cta]')
  ).toHaveCount(0);
});

test('a client-side navigation away from / drops the header action', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const banner = page.getByRole('banner');
  await expect(banner.locator('[data-header-cta]')).toHaveCount(1);
  await banner.getByRole('link', { name: 'Gallery' }).first().click();
  await expect(page).toHaveURL(/\/gallery$/);
  await expect(banner.locator('[data-header-cta]')).toHaveCount(0);
});

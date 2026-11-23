import { test, expect, type Locator } from '@playwright/test';

/**
 * Keyboard focus on the public site (studio issue #284): one visible ring
 * on every control, the skip link above the sticky header, and a menu
 * button that says whether its menu is open.
 */

async function outlineOf(locator: Locator) {
  return locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      style: s.outlineStyle,
      width: s.outlineWidth,
      offset: s.outlineOffset,
      color: s.outlineColor,
    };
  });
}

/** The answer is already given, so the cookie banner stays out of the way. */
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: 'bb_consent', value: '1', url: baseURL! }]);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`a focused link shows the 2px accent ring (${scheme})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/pricing');
    await page.keyboard.press('Tab'); // the skip link
    await page.keyboard.press('Tab'); // the header's logo link
    const logo = page.getByRole('banner').getByRole('link').first();
    await expect(logo).toBeFocused();
    const ring = await outlineOf(logo);
    expect(ring.style).not.toBe('none');
    expect(ring.width).toBe('2px');
    expect(ring.offset).toBe('2px');
    // #c2410c on light, #ff4f00 on dark.
    expect(ring.color).toBe(
      scheme === 'light' ? 'rgb(194, 65, 12)' : 'rgb(255, 79, 0)'
    );
  });
}

test('a mouse press shows no ring', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pricing');
  const link = page.getByRole('banner').getByRole('link', { name: 'Docs' });
  await link.hover();
  await page.mouse.down();
  await expect(link).toBeFocused();
  expect(await link.evaluate((el) => el.matches(':focus-visible'))).toBe(false);
  expect((await outlineOf(link)).style).toBe('none');
});

test('the skip link shows above the sticky header and moves focus to main', async ({
  page,
}) => {
  await page.goto('/pricing');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport({ ratio: 1 });
  // Nothing covers it: the topmost element at its centre is the link.
  const onTop = await skip.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(
      r.left + r.width / 2,
      r.top + r.height / 2
    );
    return hit === el || el.contains(hit);
  });
  expect(onTop).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test.describe('the phone menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('keeps aria-expanded in step and Escape returns focus', async ({
    page,
  }) => {
    await page.goto('/pricing');
    const button = page.getByRole('banner').getByRole('button', {
      name: 'Menu',
    });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', 'site-menu');
    await expect(page.locator('#site-menu')).toHaveCount(1);

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#site-menu')).toBeVisible();

    // Into the menu, then Escape: it closes and focus is back on the button.
    await page.locator('#site-menu a').first().focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('#site-menu')).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });
});

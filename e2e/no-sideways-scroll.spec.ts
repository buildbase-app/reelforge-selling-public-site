import { test, expect } from '@playwright/test';

/**
 * No page scrolls sideways (studio issue #725): `w-screen` on the body
 * counted the scrollbar and made every page about 15px too wide.
 */
const pages = ['/', '/pricing', '/contact', '/waitlist', '/no-such-page'];
const widths = [375, 768, 1440];

for (const scheme of ['light', 'dark'] as const) {
  for (const width of widths) {
    test(`no sideways scroll at ${width}px (${scheme})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: scheme });
      for (const path of pages) {
        await page.goto(path);
        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(scrollWidth, path).toBeLessThanOrEqual(innerWidth);
      }
    });
  }
}

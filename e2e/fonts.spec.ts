import { test, expect, type Page } from '@playwright/test';
import { fakeSignIn } from './fake-sign-in';

/**
 * Body text is set in Geist (studio issue #189). Tailwind resolves the
 * default font family on <html>, so the variable has to be defined there:
 * when next/font set it on <body>, every page fell back to the system font.
 * Checked on every public page and on dashboard pages.
 */
const publicPages = [
  '/',
  '/agents',
  '/pricing',
  '/waitlist',
  '/gallery',
  '/docs',
  '/blog',
  '/changelog',
  '/help',
  '/contact',
  '/licence',
  '/privacy',
  '/refund',
  '/terms',
];
const dashboardPages = ['/dashboard', '/dashboard/licences'];

async function fontsOf(page: Page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const family = (el: Element | null) =>
      el ? getComputedStyle(el).fontFamily : null;
    // A paragraph inside the main content when there is one, else <body>.
    const text =
      document.querySelector('main p, #main-content p') ?? document.body;
    return {
      html: family(document.documentElement),
      body: family(document.body),
      text: family(text),
      loaded: [...document.fonts].some(
        (f) =>
          f.family.replace(/["']/g, '') === 'Geist' && f.status === 'loaded'
      ),
    };
  });
}

function expectGeist(result: Awaited<ReturnType<typeof fontsOf>>) {
  for (const value of [result.html, result.body, result.text])
    expect(value).toMatch(/^"?Geist"?,/);
  expect(result.loaded).toBe(true);
}

for (const path of publicPages) {
  test(`body text on ${path} is set in Geist`, async ({ page }) => {
    await page.goto(path);
    expectGeist(await fontsOf(page));
  });
}

for (const path of dashboardPages) {
  test(`body text on ${path} is set in Geist`, async ({ page }) => {
    await fakeSignIn(page);
    await page.goto(path);
    await expect(page.getByText('Sample workspace').first()).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(path);
    expectGeist(await fontsOf(page));
  });
}

test('the Geist core is preloaded from <head>', async ({ page }) => {
  await page.goto('/');
  const href = await page
    .locator(
      'head link[rel="preload"][as="font"][href*="/fonts/geist-latin-core."]'
    )
    .getAttribute('href');
  expect(href).toMatch(/\.woff2$/);
});

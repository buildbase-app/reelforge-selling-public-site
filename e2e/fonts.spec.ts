import { test, expect, type Page } from '@playwright/test';

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

/**
 * A signed-in dashboard without an account: the session endpoint and the
 * BuildBase API answer with made-up data, so the account pages render
 * instead of redirecting a signed-out visitor home.
 */
async function fakeSignIn(page: Page) {
  const user = {
    _id: 'u_e2e',
    name: 'Sample Buyer',
    email: 'buyer@example.com',
    emailVerified: true,
  };
  const workspace = {
    _id: 'w_e2e',
    name: 'Sample workspace',
    createdBy: user._id,
    users: [{ user, role: 'owner' }],
    roles: ['owner'],
    features: {},
  };
  await page.route(/\/api\/auth\/session$/, (route) =>
    route.fulfill({ json: { sessionId: 'e2e-session' } })
  );
  await page.route(/\/api\/v1\/public\//, (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = /\/profile$/.test(path)
      ? user
      : /\/workspaces$/.test(path)
        ? [workspace]
        : /\/workspaces\/[^/]+$/.test(path)
          ? workspace
          : /\/(notifications|invitations|holdings|orders)$/.test(path)
            ? []
            : {};
    return route.fulfill({
      json,
      headers: {
        'access-control-allow-origin': request.headers()['origin'] ?? '*',
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers':
          request.headers()['access-control-request-headers'] ?? '*',
      },
    });
  });
}

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

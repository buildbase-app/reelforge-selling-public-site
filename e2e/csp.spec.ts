import { test, expect, type Page } from '@playwright/test';
import { fakeSignIn } from './fake-sign-in';

/**
 * The strict nonce CSP (store #17) must produce no violation reports. zod
 * v4's eval probe used to report a `script-src 'eval'` violation on every
 * page that loads zod (studio issue #193); `z.config({ jitless: true })` in
 * src/instrumentation-client.ts turns the probe off.
 */
const publicPages = ['/', '/pricing', '/order'];
const dashboardPages = [
  '/dashboard',
  '/dashboard/licences',
  '/dashboard/invoices',
  '/dashboard/profile',
  '/dashboard/settings',
];

async function recordViolations(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __cspViolations: string[] };
    w.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__cspViolations.push(
        `${e.effectiveDirective} blocked ${e.blockedURI} in ${e.sourceFile}:${e.lineNumber}`
      );
    });
  });
}

async function violationsAfterLoad(page: Page) {
  // The dashboard keeps a connection open, so network idle may never come.
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  // Violation events are dispatched as tasks: let queued ones run first.
  return page.evaluate(
    () =>
      new Promise<string[]>((resolve) =>
        setTimeout(() =>
          resolve(
            (window as unknown as { __cspViolations: string[] }).__cspViolations
          )
        )
      )
  );
}

for (const path of publicPages) {
  test(`no CSP violations on ${path}`, async ({ page }) => {
    await recordViolations(page);
    await page.goto(path);
    expect(await violationsAfterLoad(page)).toEqual([]);
  });
}

for (const path of dashboardPages) {
  test(`no CSP violations on ${path}`, async ({ page }) => {
    await recordViolations(page);
    await fakeSignIn(page);
    await page.goto(path);
    await expect(page.getByText('Sample workspace').first()).toBeVisible();
    expect(await violationsAfterLoad(page)).toEqual([]);
  });
}

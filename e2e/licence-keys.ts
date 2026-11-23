import { expect, type Page } from '@playwright/test';

/**
 * Real licence keys never appear in screenshots, logs or files (studio
 * issues #253, #261). A key is five groups of five (`XXXXX-XXXXX-…`); these
 * helpers keep its first group only, as the capture tool does.
 */
export const LICENCE_KEY = /[A-Z0-9]{5}(?:-[A-Z0-9]{5}){4}/;

/** A text with every licence key cut to its first group. */
export function maskLicenceKeys(text: string): string {
  return text.replace(
    new RegExp(LICENCE_KEY.source, 'g'),
    (key) => `${key.slice(0, 5)}-•••••`
  );
}

/**
 * Masks every key in the page's text nodes, input values and attributes,
 * then checks none is left. Call it before every screenshot.
 */
export async function maskKeysInPage(page: Page): Promise<void> {
  await page.evaluate((source) => {
    const re = new RegExp(source, 'g');
    const mask = (s: string) =>
      s.replace(re, (key) => `${key.slice(0, 5)}-•••••`);
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeValue && re.test(n.nodeValue)) n.nodeValue = mask(n.nodeValue);
      re.lastIndex = 0;
    }
    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      for (const attr of [...el.attributes]) {
        if (re.test(attr.value)) el.setAttribute(attr.name, mask(attr.value));
        re.lastIndex = 0;
      }
      if (
        (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
        re.test(el.value)
      ) {
        el.value = mask(el.value);
      }
      re.lastIndex = 0;
    }
  }, LICENCE_KEY.source);
  await expectNoLicenceKey(page);
}

/** Fails when the page still shows a whole key anywhere. */
export async function expectNoLicenceKey(page: Page): Promise<void> {
  const found = await page.evaluate((source) => {
    const re = new RegExp(source);
    const values = [...document.querySelectorAll('input, textarea')].map(
      (el) => (el as HTMLInputElement).value
    );
    return [document.body.innerText, document.body.innerHTML, ...values].some(
      (s) => re.test(s)
    );
  }, LICENCE_KEY.source);
  expect(found, 'a whole licence key is still on the page').toBe(false);
}

/** A screenshot with the keys masked first. */
export async function screenshotMasked(
  page: Page,
  path: string
): Promise<void> {
  await maskKeysInPage(page);
  await page.screenshot({ path, fullPage: true });
}

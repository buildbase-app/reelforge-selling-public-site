/* eslint-disable @typescript-eslint/no-require-imports -- a plain Node CommonJS module */
// Licence keys never appear in full in a screenshot, a log or a saved file
// (studio issues #253, #261). The e2e scripts (scripts/e2e-*.cjs) use these
// helpers: every log line goes through `maskText`, every screenshot through
// `screenshotMasked` (it masks the page first and refuses to capture while a
// whole key is left), and `assertNoKeysInDir` fails the run if a saved text
// artifact still holds one. A masked key keeps its first group only, as the
// capture tool does: `ABCDE-•••••`.
const fs = require('fs');
const path = require('path');

/** A whole licence key: five groups of five. */
const KEY_SOURCE = '[A-Z0-9]{5}(?:-[A-Z0-9]{5}){4}';
const KEY = new RegExp(KEY_SOURCE);
/** What a key looks like once masked (`maskText`). */
const MASKED_KEY = /[A-Z0-9]{5}-•••••/;

/** The text with every key cut to its first group. */
function maskText(text) {
  return String(text).replace(
    new RegExp(KEY_SOURCE, 'g'),
    (key) => `${key.slice(0, 5)}-•••••`
  );
}

/**
 * Runs in the page (Playwright's `page.evaluate`): masks every key in text
 * nodes, input and textarea values and attributes (a TreeWalker over the
 * text nodes, as the #253 run did), then answers how many whole keys are
 * left in the page's text, markup and field values. Self-contained, so it
 * can be serialised to the browser.
 */
function maskKeysInDocument(source) {
  const re = new RegExp(source, 'g');
  const mask = (s) => s.replace(re, (key) => `${key.slice(0, 5)}-•••••`);
  const has = (s) => new RegExp(source).test(s);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeValue && has(n.nodeValue)) n.nodeValue = mask(n.nodeValue);
  }
  for (const el of document.querySelectorAll('*')) {
    for (const attr of Array.from(el.attributes)) {
      if (has(attr.value)) el.setAttribute(attr.name, mask(attr.value));
    }
    if ('value' in el && typeof el.value === 'string' && has(el.value)) {
      el.value = mask(el.value);
    }
  }
  const values = Array.from(document.querySelectorAll('input, textarea')).map(
    (el) => el.value
  );
  return [document.body.innerText, document.body.innerHTML, ...values].filter(
    has
  ).length;
}

/** Masks the keys in the page; throws if a whole key is still there. */
async function maskPage(page) {
  const left = await page.evaluate(maskKeysInDocument, KEY_SOURCE);
  if (left > 0) {
    throw new Error('a whole licence key is still on the page; not captured');
  }
}

/** `page.screenshot(options)`, after `maskPage`. The only way to capture. */
async function screenshotMasked(page, options) {
  await maskPage(page);
  return page.screenshot(options);
}

const TEXT_FILE = /\.(txt|log|json|html?|md|csv|ya?ml)$/i;

/**
 * Throws when a text file in `dir` (not recursive into node_modules) holds
 * a whole key. Images are covered by `screenshotMasked`, which refuses to
 * capture a page that still shows one.
 */
function assertNoKeysInDir(dir) {
  if (!dir || !fs.existsSync(dir)) return;
  const offenders = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const file = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules') walk(file);
      } else if (TEXT_FILE.test(entry.name)) {
        if (KEY.test(fs.readFileSync(file, 'utf8'))) offenders.push(file);
      }
    }
  };
  walk(dir);
  if (offenders.length) {
    throw new Error(
      `a whole licence key was saved in: ${offenders.join(', ')} (delete these files)`
    );
  }
}

module.exports = {
  KEY,
  KEY_SOURCE,
  MASKED_KEY,
  maskText,
  maskKeysInDocument,
  maskPage,
  screenshotMasked,
  assertNoKeysInDir,
};

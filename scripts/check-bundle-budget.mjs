#!/usr/bin/env node
/**
 * First-load JavaScript budget for the public site (studio issue #79).
 *
 * Reads the build output in `.next` (run after `next build` or
 * `opennextjs-cloudflare build`) and, for every App Router page, adds up the
 * gzip size of the JavaScript a browser loads before the page is
 * interactive: the shared runtime (`rootMainFiles`) plus every chunk the
 * page's layouts, error and not-found boundaries and the page itself list in
 * their client reference manifest. Chunks loaded later with `import()` or
 * `next/dynamic` are not counted: that is the point of loading them later.
 *
 * Pages in the provider-free route group `(marketing)` must stay within the
 * budget (AGENTS.md, "Budgets"); every other page is reported only.
 *
 *   node scripts/check-bundle-budget.mjs            # table, exit 1 over budget
 *   node scripts/check-bundle-budget.mjs --json     # machine-readable
 *   BUDGET_KB=150 node scripts/check-bundle-budget.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const root = process.cwd();
const nextDir = path.join(root, '.next');
const budgetKb = Number(process.env.BUDGET_KB ?? 150);
const budgetedGroup = '/(marketing)/';
const json = process.argv.includes('--json');

if (!fs.existsSync(path.join(nextDir, 'build-manifest.json'))) {
  console.error('No build in .next: run `npm run build` first.');
  process.exit(2);
}

const buildManifest = JSON.parse(
  fs.readFileSync(path.join(nextDir, 'build-manifest.json'), 'utf8')
);

const gzCache = new Map();
function gzipBytes(file) {
  if (!gzCache.has(file)) {
    const abs = path.join(nextDir, file.replace(/^\/?_next\//, ''));
    gzCache.set(file, zlib.gzipSync(fs.readFileSync(abs)).length);
  }
  return gzCache.get(file);
}

function findManifests(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findManifests(full));
    else if (entry.name === 'page_client-reference-manifest.js') out.push(full);
  }
  return out;
}

/** The manifest is a script that assigns globalThis.__RSC_MANIFEST[route]. */
function readManifest(file) {
  const sandbox = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
  return Object.entries(sandbox.globalThis.__RSC_MANIFEST ?? {});
}

const shared = (buildManifest.rootMainFiles ?? []).map((f) =>
  f.replace(/^\/?_next\//, '')
);

const rows = [];
for (const file of findManifests(path.join(nextDir, 'server', 'app'))) {
  for (const [route, manifest] of readManifest(file)) {
    const chunks = new Set(shared);
    for (const list of Object.values(manifest.entryJSFiles ?? {})) {
      for (const chunk of list) chunks.add(chunk.replace(/^\/?_next\//, ''));
    }
    const bytes = [...chunks].reduce((sum, c) => sum + gzipBytes(c), 0);
    const budgeted = route.includes(budgetedGroup);
    rows.push({
      route,
      kb: Math.round(bytes / 1024),
      chunks: chunks.size,
      budgeted,
      over: budgeted && bytes > budgetKb * 1024,
    });
  }
}
rows.sort((a, b) => a.route.localeCompare(b.route));

const over = rows.filter((r) => r.over);
if (json) {
  console.log(JSON.stringify({ budgetKb, rows }, null, 2));
} else {
  console.log(
    `First-load JS per page (gzip). Budget for ${budgetedGroup}: ${budgetKb} KB`
  );
  for (const r of rows) {
    const mark = r.over ? 'OVER' : r.budgeted ? 'ok' : '-';
    console.log(
      `${String(r.kb).padStart(6)} KB  ${mark.padEnd(4)}  ${r.route}`
    );
  }
  if (over.length) {
    console.error(
      `\n${over.length} page(s) in ${budgetedGroup} are over ${budgetKb} KB of first-load JS.`
    );
  }
}
process.exit(over.length ? 1 : 0);

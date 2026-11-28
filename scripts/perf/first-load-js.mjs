#!/usr/bin/env node
/**
 * First-load JavaScript of a page, gzipped: fetches the page's HTML from a
 * running server (`npm run build && npm start`, or the OpenNext preview),
 * collects every same-origin <script src> it loads, and sums their gzip sizes
 * (level 9, close to what Cloudflare serves). Inline scripts (RSC payload) are
 * reported separately. Budget for `/` (the private site plan §B.6): 150 KB gz.
 *
 *   node scripts/perf/first-load-js.mjs http://localhost:3000 / /agents
 */
import { gzipSync } from 'node:zlib';

const [base = 'http://localhost:3000', ...paths] = process.argv.slice(2);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

for (const path of paths.length ? paths : ['/']) {
  const html = await (await fetch(new URL(path, base))).text();
  const srcs = [
    ...new Set(
      [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1])
    ),
  ].filter((s) => s.startsWith('/'));
  let total = 0;
  const rows = [];
  for (const src of srcs) {
    const buf = Buffer.from(
      await (await fetch(new URL(src, base))).arrayBuffer()
    );
    const gz = gzipSync(buf, { level: 9 }).length;
    total += gz;
    rows.push([gz, src]);
  }
  const inline = [
    ...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g),
  ]
    .map((m) => m[1])
    .join('');
  rows.sort((a, b) => b[0] - a[0]);
  console.log(
    `\n${path}: ${srcs.length} scripts, ${kb(total)} gz (inline: ${kb(gzipSync(inline).length)} gz)`
  );
  for (const [gz, src] of rows.slice(0, 12))
    console.log(`  ${kb(gz).padStart(9)}  ${src}`);
}

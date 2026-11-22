#!/usr/bin/env node
/**
 * Builds src/data/reels.json, the reels the homepage and /agents show, from
 * renders made by render-demo-reels.mjs and the web files transcode.sh wrote
 * to public/reels. Every number on the page about a reel (duration, frames,
 * render time, versions, hardware) is copied from the studio's own
 * render-manifest.json and meta.json here, never typed by hand.
 *
 *   node scripts/reels/build-index.mjs <renders-dir> [slug ...]
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, ...slugs] = process.argv.slice(2);
if (!dir) {
  console.error(
    'Usage: node scripts/reels/build-index.mjs <renders-dir> [slug ...]'
  );
  process.exit(1);
}
const ORDER = slugs.length
  ? slugs
  : ['agent-directs', 'hook-tips', 'release-notes'];
const TITLES = {
  'agent-directs': 'Explainer, four engines',
  'hook-tips': 'Tips reel',
  'release-notes': 'Release notes, custom brand colour',
};

/** The words a scene shows, for the video's text alternative. */
function onScreenText(scene) {
  if (!scene) return '';
  const p = scene.props ?? {};
  const parts = [p.kicker, p.headline, p.title, ...(p.points ?? []), p.subline];
  if (scene.html)
    parts.push(...scene.html.replace(/<[^>]+>/g, '\n').split('\n'));
  return parts
    .map((t) => (t ?? '').trim())
    .filter(Boolean)
    .join(' / ');
}

const reels = ORDER.map((slug) => {
  const read = (f) => JSON.parse(readFileSync(join(dir, slug, f), 'utf8'));
  const meta = read('meta.json');
  const rm = read('render-manifest.json');
  const master = readFileSync(join(dir, slug, 'final.mp4'));
  const hash = createHash('sha256').update(master).digest('hex').slice(0, 8);
  const file = (ext, suffix = '') => {
    const path = `public/reels/${slug}.${hash}${suffix}.${ext}`;
    if (!existsSync(path)) throw new Error(`${path} missing: run transcode.sh`);
    return `/reels/${slug}.${hash}${suffix}.${ext}`;
  };
  // The poster at the widths the pages show it (transcode.sh writes them).
  const srcSet = (ext) =>
    [360, 540]
      .map((w) => `${file(ext, `-${w}`)} ${w}w`)
      .concat(`${file(ext)} 720w`)
      .join(', ');
  return {
    slug,
    title: TITLES[slug] ?? slug,
    prompt: meta.prompt,
    theme: typeof meta.theme === 'string' ? meta.theme : 'custom',
    scenes: rm.scenes.map((s) => ({
      id: s.sceneId,
      engine: s.engine,
      template: s.template ?? null,
      frames: s.frames,
      text: onScreenText(meta.scenes.find((m) => m.id === s.sceneId)),
    })),
    output: {
      width: rm.output.width,
      height: rm.output.height,
      fps: rm.output.fps,
      frames: rm.output.frames,
      durationSeconds: rm.output.durationSeconds,
      videoCodec: rm.output.videoCodec,
      audioCodec: rm.output.audioCodec,
    },
    checks: rm.checks ?? {},
    renderSeconds: Math.round(rm.wallClockMillis / 100) / 10,
    renderedAt: rm.createdAt,
    versions: {
      studio: rm.versions?.server,
      engines: rm.versions?.engines,
      ffmpeg: String(rm.versions?.ffmpeg ?? '').split(' ')[2],
      browser: Array.isArray(rm.versions?.browser)
        ? rm.versions.browser[0]
        : rm.versions?.browser,
    },
    hardware: meta.hardware,
    toolCalls: meta.toolsCalled.map((c) => ({
      tool: c.tool,
      ms: c.ms,
      note: c.summary,
    })),
    files: {
      mp4: file('mp4'),
      webm: file('webm'),
      avif: file('avif'),
      jpg: file('jpg'),
      webp: file('webp'),
      avifSrcSet: srcSet('avif'),
      webpSrcSet: srcSet('webp'),
      width: 720,
      height: 1280,
    },
  };
});

writeFileSync('src/data/reels.json', `${JSON.stringify({ reels }, null, 2)}\n`);
console.log(`Wrote ${reels.length} reels to src/data/reels.json`);

#!/usr/bin/env node
/**
 * Renders the homepage demo reels with a real RenderWeld server, over MCP,
 * and records the tool calls each one took (shown on / and /agents).
 *
 *   RENDERWELD_URL=http://127.0.0.1:4321 RENDERWELD_KEY=rf_... \
 *     node scripts/reels/render-demo-reels.mjs <out-dir> [slug]
 *
 * Writes <out-dir>/<slug>/final.mp4, meta.json (prompt, scenes, tool calls,
 * hardware) and render-manifest.json (the studio's own record: wall-clock
 * time, versions, ffprobe checks). Then run transcode.sh on each final.mp4
 * and build-index.mjs to refresh src/data/reels.json.
 *
 * The calls come from this script, not from an LLM: it follows the studio's
 * MCP workflow guide (resource renderweld://guide/workflow) step by step.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';

const BASE = (process.env.RENDERWELD_URL ?? 'http://127.0.0.1:4321').replace(
  /\/$/,
  ''
);
const KEY = process.env.RENDERWELD_KEY;
const [OUT, only] = process.argv.slice(2);
if (!KEY || !OUT) {
  console.error(
    'Usage: RENDERWELD_KEY=rf_... node scripts/reels/render-demo-reels.mjs <out-dir> [slug]'
  );
  process.exit(1);
}

let id = 0;
async function rpc(method, params) {
  const res = await fetch(`${BASE}/mcp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      authorization: `Bearer ${KEY}`,
      'mcp-protocol-version': '2025-06-18',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
  });
  const text = await res.text();
  const body = /^(event|data):/m.test(text)
    ? text
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5))
        .join('')
    : text;
  const json = JSON.parse(body);
  if (json.error) throw new Error(`${method}: ${JSON.stringify(json.error)}`);
  return json.result;
}
async function tool(name, args = {}) {
  const result = await rpc('tools/call', { name, arguments: args });
  const text = result.content?.[0]?.text;
  if (result.isError) throw new Error(`${name}: ${text}`);
  return text ? JSON.parse(text) : result;
}
async function download(path, file) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

const reels = {
  'agent-directs': {
    prompt:
      'Make a 10-second vertical reel that explains RenderWeld: hook first, then three steps, then an end card. Midnight theme. Use all four engines.',
    theme: 'midnight',
    scenes: [
      {
        id: 'hook',
        engine: 'remotion',
        template: 'kinetic-title',
        durationSeconds: 2.5,
        props: {
          headline: 'Your agent directs.',
          subline: 'Your server renders.',
        },
      },
      {
        id: 'steps',
        engine: 'motion-canvas',
        template: 'animated-explainer',
        durationSeconds: 3.5,
        props: {
          title: 'One prompt, one reel',
          points: [
            'The agent plans every scene',
            'The studio renders it',
            'Every MP4 is checked',
          ],
        },
      },
      {
        id: 'proof',
        engine: 'html',
        template: 'html-title',
        durationSeconds: 2,
        props: {
          kicker: 'Four engines',
          headline: 'One vertical MP4',
          subline: 'Remotion · Motion Canvas · HTML · HyperFrames',
        },
      },
      {
        id: 'end',
        engine: 'hyperframes',
        template: 'hyperframes-title',
        durationSeconds: 2,
        props: {
          headline: 'RenderWeld',
          subline: 'Self-hosted. Driven over MCP.',
        },
      },
    ],
  },
  'hook-tips': {
    prompt:
      'Make an 8-second reel with three tips for writing a better hook. Default theme, bold title first, end on a call to follow.',
    theme: 'default',
    scenes: [
      {
        id: 'hook',
        engine: 'remotion',
        template: 'kinetic-title',
        durationSeconds: 2,
        props: {
          headline: '3 rules for a better hook',
          subline: 'Say it in the first second',
        },
      },
      {
        id: 'tips',
        engine: 'motion-canvas',
        template: 'animated-explainer',
        durationSeconds: 4,
        props: {
          title: 'Write hooks that land',
          points: [
            'Lead with the payoff',
            'About 3 words per second',
            'One idea per scene',
          ],
        },
      },
      {
        id: 'cta',
        engine: 'html',
        template: 'html-title',
        durationSeconds: 2,
        props: {
          kicker: 'Part 1 of 5',
          headline: 'Follow for part 2',
          subline: 'Made by an agent, rendered locally',
        },
      },
    ],
  },
  'release-notes': {
    prompt:
      'Turn our release notes into a 7-second reel: a custom HTML title card in our teal brand colour, the three changes as a list, and a HyperFrames end card.',
    theme: { base: 'midnight', tokens: { colors: { accent: '#00d1b2' } } },
    scenes: [
      {
        id: 'title',
        engine: 'html',
        durationSeconds: 2,
        html: "<div class='w'><p class='k'>Release notes</p><h1 class='t'>What changed this week</h1></div>",
        css: '.w{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 9%;font-family:var(--rf-font)}.k{color:var(--rf-accent);font-size:calc(var(--rf-unit)*4.4);letter-spacing:.2em;text-transform:uppercase;font-weight:700;margin:0 0 3%;animation:a .5s both}.t{color:var(--rf-text);font-size:calc(var(--rf-unit)*11);line-height:1.02;margin:0;font-weight:800;animation:b .7s .15s both}@keyframes a{from{opacity:0;transform:translateY(30px)}}@keyframes b{from{opacity:0;transform:translateY(60px)}}',
      },
      {
        id: 'changes',
        engine: 'motion-canvas',
        template: 'animated-explainer',
        durationSeconds: 3.5,
        props: {
          title: 'Three changes',
          points: ['Faster exports', 'New dark theme', 'Bug fixes in sync'],
        },
      },
      {
        id: 'end',
        engine: 'hyperframes',
        template: 'hyperframes-title',
        durationSeconds: 1.5,
        props: {
          headline: 'Update today',
          subline: 'Full notes in the changelog',
        },
      },
    ],
  },
};

for (const [slug, r] of Object.entries(reels)) {
  if (only && only !== slug) continue;
  const log = [];
  const rec = async (name, args, summarize) => {
    const t0 = Date.now();
    const out = await tool(name, args);
    log.push({
      tool: name,
      ms: Date.now() - t0,
      summary: summarize ? summarize(out) : undefined,
    });
    return out;
  };
  await rec(
    'get_capabilities',
    {},
    (o) => `${o.engines.filter((e) => e.available).length} engines available`
  );
  await rec('list_templates', {}, (o) => `${o.templates.length} templates`);
  const projectId = `store-${slug}-${Date.now().toString(36)}`;
  const manifest = {
    schemaVersion: '0.2',
    projectId,
    title: slug,
    theme: typeof r.theme === 'string' ? r.theme : 'midnight',
    output: { width: 1080, height: 1920, fps: 30, format: 'mp4' },
    scenes: [r.scenes[0]],
  };
  await rec('create_project', { manifest }, () => `project ${projectId}`);
  for (const s of r.scenes.slice(1))
    await rec(
      'add_scene',
      { projectId, scene: s },
      () => `scene ${s.id} (${s.engine}, ${s.durationSeconds} s)`
    );
  if (typeof r.theme !== 'string')
    await rec(
      'set_theme',
      { projectId, theme: r.theme },
      () => 'custom accent'
    );
  const v = await rec(
    'validate_project',
    { projectId },
    (o) =>
      `ok: ${o.ok}, ${o.errors?.length ?? 0} errors, ${o.warnings?.length ?? 0} warnings`
  );
  if (!v.ok) {
    console.error(JSON.stringify(v, null, 1));
    process.exit(1);
  }
  const job = await rec(
    'render_project',
    { projectId },
    (o) => `job ${o.job?.status ?? o.status}`
  );
  const jobId = job.job?.id ?? job.id ?? job.jobId;
  let j;
  for (;;) {
    j = await rec(
      'get_job',
      { jobId, waitSeconds: 45 },
      (o) => `${(o.job ?? o).status}`
    );
    const st = (j.job ?? j).status;
    if (st !== 'queued' && st !== 'running') break;
  }
  const out = await rec(
    'get_render_output',
    { jobId, includePoster: false },
    () => 'download URL + checks'
  );
  const dir = `${OUT}/${slug}`;
  mkdirSync(dir, { recursive: true });
  await download(out.outputUrl, `${dir}/final.mp4`);
  await download(out.manifestUrl, `${dir}/render-manifest.json`);
  writeFileSync(
    `${dir}/meta.json`,
    JSON.stringify(
      {
        slug,
        prompt: r.prompt,
        projectId,
        scenes: r.scenes,
        theme: r.theme,
        toolsCalled: log,
        hardware: {
          cpu: os.cpus()[0].model,
          cores: os.cpus().length,
          ramGB: Math.round(os.totalmem() / 2 ** 30),
        },
        renderedAt: new Date().toISOString(),
      },
      null,
      1
    )
  );
  console.log(
    `${slug}: ${out.output.width}x${out.output.height}, ${out.output.frames} frames, checks ${JSON.stringify(out.checks)}`
  );
}

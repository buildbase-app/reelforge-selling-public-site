#!/usr/bin/env node
/**
 * Refreshes src/data/mcp-tools.json, the tool list on /agents, from a running
 * ReelForge Studio. It asks the studio's own MCP server (`tools/list`), so the
 * page shows exactly what the product registers, not what a doc says.
 *
 *   REELFORGE_URL=http://127.0.0.1:4321 REELFORGE_KEY=rf_... \
 *     node scripts/agents/refresh-mcp-tools.mjs
 *
 * Any key with the `read` scope works. Start a local studio with, e.g.,
 * `REELFORGE_LICENCE_MODE=off REELFORGE_BOOTSTRAP_KEY=rf_... pnpm start` in the
 * reelforge-studio repo (tools/list needs no licence). Tools the GROUPS map
 * below does not know land in "Other" and are reported, so a new tool is
 * never dropped silently: add it to a group and run the script again.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'src',
  'data',
  'mcp-tools.json'
);

/** Tools grouped by the job an agent is doing. Order is display order. */
const GROUPS = [
  {
    id: 'discover',
    title: 'Discover what this server can do',
    tools: [
      'get_capabilities',
      'get_project_schema',
      'list_templates',
      'list_themes',
      'get_theme',
      'list_providers',
    ],
  },
  {
    id: 'build',
    title: 'Build and edit a reel',
    tools: [
      'create_project',
      'list_projects',
      'get_project',
      'update_project',
      'delete_project',
      'list_project_versions',
      'add_scene',
      'update_scene',
      'remove_scene',
      'reorder_scenes',
      'validate_project',
    ],
  },
  {
    id: 'look',
    title: 'Look, sound and assets',
    tools: [
      'set_theme',
      'create_theme',
      'update_theme',
      'delete_theme',
      'set_audio',
      'add_asset_from_url',
      'upload_asset',
      'list_assets',
      'get_asset',
      'generate_voice',
      'run_provider',
    ],
  },
  {
    id: 'render',
    title: 'Render and deliver',
    tools: [
      'preview_scene',
      'render_project',
      'get_job',
      'list_jobs',
      'cancel_job',
      'retry_job',
      'get_job_logs',
      'get_render_output',
      'list_renders',
    ],
  },
  {
    id: 'operate',
    title: 'Run the server (admin keys)',
    tools: [
      'configure_provider',
      'get_config',
      'update_config',
      'get_licence',
      'activate_licence',
      'deactivate_licence',
      'get_storage',
      'run_storage_cleanup',
      'list_keys',
      'get_key',
      'create_key',
      'update_key',
      'rotate_key',
      'revoke_key',
      'delete_key',
      'list_audit_events',
    ],
  },
];

const url = (process.env.REELFORGE_URL ?? 'http://127.0.0.1:4321').replace(
  /\/$/,
  ''
);
const key = process.env.REELFORGE_KEY;
if (!key) {
  console.error(
    'Set REELFORGE_KEY to a ReelForge Studio API key (read scope).'
  );
  process.exit(1);
}

let id = 0;
async function rpc(method, params) {
  const res = await fetch(`${url}/mcp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      authorization: `Bearer ${key}`,
      'mcp-protocol-version': '2025-06-18',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
  });
  if (!res.ok) throw new Error(`${method}: HTTP ${res.status}`);
  const text = await res.text();
  // Streamable HTTP may answer as an SSE stream; take its data lines.
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

/** The first sentence (two if the first is a stub like "Start here."). */
function summary(description = '') {
  const parts = description.split(
    /(?<=[.!?])(?<!\be\.g\.|\bi\.e\.)\s+(?=[A-Z])/
  );
  let first = parts[0].trim();
  if (first.length < 25 && parts[1]) first = `${first} ${parts[1].trim()}`;
  return first.length > 180 ? `${first.slice(0, 177).trimEnd()}...` : first;
}

const init = await rpc('initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'reelforge-store-refresh', version: '1' },
});
const tools = [];
let cursor;
do {
  const page = await rpc('tools/list', cursor ? { cursor } : {});
  tools.push(...page.tools);
  cursor = page.nextCursor;
} while (cursor);

const byName = new Map(tools.map((t) => [t.name, t]));
const entry = (t) => ({
  name: t.name,
  title: t.title ?? t.annotations?.title ?? t.name,
  summary: summary(t.description),
  readOnly: t.annotations?.readOnlyHint === true,
});
const groups = GROUPS.map((g) => ({
  id: g.id,
  title: g.title,
  tools: g.tools.filter((n) => byName.has(n)).map((n) => entry(byName.get(n))),
}));
const known = new Set(GROUPS.flatMap((g) => g.tools));
const other = tools.filter((t) => !known.has(t.name));
if (other.length) {
  groups.push({ id: 'other', title: 'Other', tools: other.map(entry) });
  console.warn(
    `Not in a group yet (shown under "Other"): ${other.map((t) => t.name).join(', ')}`
  );
}
const gone = [...known].filter((n) => !byName.has(n));
if (gone.length) console.warn(`No longer served: ${gone.join(', ')}`);

const data = {
  source: {
    server: init.serverInfo?.name,
    version: init.serverInfo?.version,
    method: 'MCP tools/list',
    fetchedOn: new Date().toISOString().slice(0, 10),
  },
  count: tools.length,
  groups,
};
writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${tools.length} tools in ${groups.length} groups to ${OUT}`);

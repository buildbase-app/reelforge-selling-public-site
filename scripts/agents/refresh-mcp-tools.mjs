#!/usr/bin/env node
/**
 * Refreshes src/data/mcp-tools.json, the tool list (and the tool count) on /,
 * /agents and /agents.md. The store never hard-codes the count: pages read
 * `count` from that file, and this script writes it from one of two sources
 * that both come from the studio's own tool registry:
 *
 * 1. The studio's generated reference, docs/public/mcp/tools.md (written by
 *    the studio's `pnpm docs:reference` from the server's registry). Default
 *    source: the file on the studio's `main` branch on GitHub, or a local path.
 *
 *      node scripts/agents/refresh-mcp-tools.mjs
 *      node scripts/agents/refresh-mcp-tools.mjs --reference ../reelforge-studio/docs/public/mcp/tools.md
 *
 * 2. A running studio's MCP server (`tools/list`). Any key with the `read`
 *    scope works; tools/list needs no licence.
 *
 *      REELFORGE_URL=http://127.0.0.1:4321 REELFORGE_KEY=rf_... \
 *        node scripts/agents/refresh-mcp-tools.mjs --live
 *
 * `--check` writes nothing: it compares the tool names in mcp-tools.json with
 * the source and exits 1 when they differ (`npm run check:mcp-tools`).
 *
 * Tools the GROUPS map below does not know land in "Other" and are reported,
 * so a new tool is never dropped silently: add it to a group and run the
 * script again (a unit test fails while "Other" exists).
 */
import { readFileSync, writeFileSync } from 'node:fs';
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
  {
    id: 'webhooks',
    title: 'Webhooks and notifications (admin keys)',
    tools: [
      'list_webhooks',
      'get_webhook',
      'create_webhook',
      'update_webhook',
      'delete_webhook',
      'test_webhook',
      'list_webhook_deliveries',
      'replay_webhook_delivery',
    ],
  },
];

const STUDIO_REPO = 'buildbase-app/reelforge-studio';
const REFERENCE_PATH = 'docs/public/mcp/tools.md';
const args = process.argv.slice(2);
const check = args.includes('--check');
const live = args.includes('--live');
const refArg = args[args.indexOf('--reference') + 1];
const reference = args.includes('--reference') ? refArg : null;

/** The first sentence (two if the first is a stub like "Start here."). */
function summary(description = '') {
  const parts = description.split(
    /(?<=[.!?])(?<!\be\.g\.|\bi\.e\.)\s+(?=[A-Z])/
  );
  let first = parts[0].trim();
  if (first.length < 25 && parts[1]) first = `${first} ${parts[1].trim()}`;
  return first.length > 180 ? `${first.slice(0, 177).trimEnd()}...` : first;
}

async function github(path) {
  const res = await fetch(
    `https://api.github.com/repos/${STUDIO_REPO}/${path}`,
    {
      headers: { accept: 'application/vnd.github+json' },
    }
  );
  if (!res.ok) throw new Error(`GitHub ${path}: HTTP ${res.status}`);
  return res.json();
}

/**
 * Tools from the generated reference. Each tool is a `### \`name\`` heading,
 * then `**Title**. Scope: \`read\`, read-only. REST: ...`, then its
 * description paragraph.
 */
export function parseReference(md) {
  const tools = [];
  const blocks = md.split(/^### `/m).slice(1);
  for (const block of blocks) {
    const name = block.slice(0, block.indexOf('`'));
    const lines = block.split('\n');
    const scopeAt = lines.findIndex((l) => /^\*\*.+\*\*\. Scope:/.test(l));
    if (scopeAt < 0) throw new Error(`${name}: no "**Title**. Scope:" line`);
    const scopeLine = lines[scopeAt];
    const title = scopeLine.slice(2, scopeLine.indexOf('**. Scope:'));
    const para = [];
    for (const l of lines.slice(scopeAt + 1)) {
      if (!l.trim()) {
        if (para.length) break;
        continue;
      }
      if (/^(\||No arguments)/.test(l)) break;
      para.push(l.trim());
    }
    tools.push({
      name,
      title,
      description: para.join(' ').replace(/\\([|*_`])/g, '$1'),
      readOnly: /\bread-only\b/.test(scopeLine.split('REST:')[0]),
    });
  }
  const stated = md.match(/offers \*\*(\d+) tools\*\*/);
  if (stated && Number(stated[1]) !== tools.length)
    throw new Error(
      `the reference says ${stated[1]} tools but lists ${tools.length}`
    );
  return tools;
}

async function fromReference() {
  if (reference && !/^https?:/.test(reference)) {
    return {
      tools: parseReference(readFileSync(reference, 'utf8')),
      source: { method: 'reference', reference: REFERENCE_PATH },
    };
  }
  const [commit] = await github(
    `commits?path=${encodeURIComponent(REFERENCE_PATH)}&per_page=1`
  );
  const sha = commit.sha;
  const raw = (path) =>
    fetch(
      `https://raw.githubusercontent.com/${STUDIO_REPO}/${sha}/${path}`
    ).then((r) => {
      if (!r.ok) throw new Error(`${path}@${sha}: HTTP ${r.status}`);
      return r.text();
    });
  const md = await raw(REFERENCE_PATH);
  const server = JSON.parse(await raw('apps/server/package.json'));
  return {
    tools: parseReference(md),
    source: {
      server: STUDIO_REPO.split('/')[1],
      version: server.version,
      method: 'reference',
      reference: REFERENCE_PATH,
      commit: sha,
    },
  };
}

async function fromLive() {
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

  const init = await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'reelforge-store-refresh', version: '1' },
  });
  const listed = [];
  let cursor;
  do {
    const page = await rpc('tools/list', cursor ? { cursor } : {});
    listed.push(...page.tools);
    cursor = page.nextCursor;
  } while (cursor);
  return {
    tools: listed.map((t) => ({
      name: t.name,
      title: t.title ?? t.annotations?.title ?? t.name,
      description: t.description,
      readOnly: t.annotations?.readOnlyHint === true,
    })),
    source: {
      server: init.serverInfo?.name,
      version: init.serverInfo?.version,
      method: 'tools/list',
    },
  };
}

const { tools, source } = live ? await fromLive() : await fromReference();
const byName = new Map(tools.map((t) => [t.name, t]));

if (check) {
  const current = JSON.parse(readFileSync(OUT, 'utf8'));
  const have = new Set(
    current.groups.flatMap((g) => g.tools.map((t) => t.name))
  );
  const missing = tools.filter((t) => !have.has(t.name)).map((t) => t.name);
  const extra = [...have].filter((n) => !byName.has(n));
  if (current.count !== tools.length || missing.length || extra.length) {
    console.error(
      `mcp-tools.json lists ${current.count} tools; the studio has ${tools.length}.` +
        (missing.length ? ` Missing: ${missing.join(', ')}.` : '') +
        (extra.length ? ` No longer served: ${extra.join(', ')}.` : '') +
        ' Run node scripts/agents/refresh-mcp-tools.mjs.'
    );
    process.exit(1);
  }
  console.log(`mcp-tools.json matches the studio: ${tools.length} tools.`);
  process.exit(0);
}

const entry = (t) => ({
  name: t.name,
  title: t.title,
  summary: summary(t.description),
  readOnly: t.readOnly,
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
  source: { ...source, fetchedOn: new Date().toISOString().slice(0, 10) },
  count: tools.length,
  groups,
};
writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${tools.length} tools in ${groups.length} groups to ${OUT}`);

/**
 * How each agent client connects to a ReelForge Studio, shown on / and
 * /agents (and in /agents.md). Only clients we can show a checked config for
 * are listed; `checked` says exactly what was checked and when. Placeholders
 * only: `rf_...` for the key, 127.0.0.1:4321 (the studio's default address)
 * for the host. Never put a real key here.
 *
 * Checked on 2026-11-21 against ReelForge Studio 0.1.0 running locally:
 * - Claude Code 2.1.330: `claude mcp add` as below, then `claude mcp list`
 *   reported "Connected". Separately, the studio's Docker test (#16) had
 *   headless Claude Code make a reel over MCP only.
 * - Codex CLI 0.171.0: both forms below write the same config, and
 *   `codex mcp get reelforge` reads it back (streamable_http, bearer token
 *   from REELFORGE_KEY). No Codex agent run has been recorded yet.
 * - REST: every curl below, in order, rendered a 1080x1920 H.264 + AAC MP4.
 */

export type AgentClientId = 'claude-code' | 'codex' | 'mcp-json' | 'rest';

export interface Snippet {
  /** Shown above the block, e.g. a file name. */
  label: string;
  language: 'bash' | 'toml' | 'json';
  code: string;
}

export interface AgentClient {
  id: AgentClientId;
  name: string;
  /** One line under the tab title. */
  summary: string;
  snippets: Snippet[];
  /** What was verified, in plain words. */
  checked: string;
}

export const LOCAL_URL = 'http://127.0.0.1:4321';

const KEY_LINE =
  'export REELFORGE_KEY=rf_...   # a key from: reelforge keys create --name agent';

export const AGENT_CLIENTS: AgentClient[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    summary: 'Add the studio as an HTTP MCP server, then ask for a reel.',
    snippets: [
      {
        label: 'Terminal',
        language: 'bash',
        code: `${KEY_LINE}
claude mcp add --transport http reelforge ${LOCAL_URL}/mcp \\
  --header "Authorization: Bearer $REELFORGE_KEY"
claude mcp list   # reelforge: ${LOCAL_URL}/mcp (HTTP) - Connected`,
      },
    ],
    checked:
      'Checked on 2026-11-21 with Claude Code 2.1.330: "Connected". In the studio\'s Docker test, headless Claude Code made a reel over MCP only.',
  },
  {
    id: 'codex',
    name: 'Codex',
    summary: 'One command, or two lines in ~/.codex/config.toml.',
    snippets: [
      {
        label: 'Terminal',
        language: 'bash',
        code: `${KEY_LINE}
codex mcp add reelforge --url ${LOCAL_URL}/mcp --bearer-token-env-var REELFORGE_KEY`,
      },
      {
        label: '~/.codex/config.toml (the same, by hand)',
        language: 'toml',
        code: `[mcp_servers.reelforge]
url = "${LOCAL_URL}/mcp"
bearer_token_env_var = "REELFORGE_KEY"`,
      },
    ],
    checked:
      'Config checked on 2026-11-21 with Codex CLI 0.171.0 (codex mcp get). A full Codex agent run is not recorded yet.',
  },
  {
    id: 'mcp-json',
    name: 'Any MCP client',
    summary:
      'Streamable HTTP with a Bearer key. Most clients read this mcpServers shape; check yours for the exact field names.',
    snippets: [
      {
        label: 'mcp.json',
        language: 'json',
        code: `{
  "mcpServers": {
    "reelforge": {
      "type": "http",
      "url": "${LOCAL_URL}/mcp",
      "headers": { "Authorization": "Bearer rf_..." }
    }
  }
}`,
      },
    ],
    checked:
      'This is the file Claude Code writes for the command in its tab. Other clients are not tested yet.',
  },
  {
    id: 'rest',
    name: 'REST',
    summary:
      'Every MCP tool has a REST route under /v1, for scripts, n8n or cron.',
    snippets: [
      {
        label: 'Terminal',
        language: 'bash',
        code: `${KEY_LINE}
H="Authorization: Bearer $REELFORGE_KEY"
curl -s -H "$H" ${LOCAL_URL}/v1/capabilities
curl -s -X POST -H "$H" -H 'content-type: application/json' \\
  -d @manifest.json ${LOCAL_URL}/v1/projects
curl -s -X POST -H "$H" ${LOCAL_URL}/v1/projects/my-reel/renders    # -> job.id
curl -s -H "$H" "${LOCAL_URL}/v1/jobs/JOB_ID?wait=45"               # -> result.renderId
curl -s -H "$H" -o reel.mp4 ${LOCAL_URL}/v1/renders/RENDER_ID/output`,
      },
      {
        label: 'manifest.json',
        language: 'json',
        code: `{
  "schemaVersion": "0.2",
  "projectId": "my-reel",
  "title": "My reel",
  "theme": "midnight",
  "output": { "width": 1080, "height": 1920, "fps": 30, "format": "mp4" },
  "scenes": [
    { "id": "hook", "engine": "remotion", "template": "kinetic-title",
      "durationSeconds": 3, "props": { "headline": "Made over REST" } }
  ]
}`,
      },
    ],
    checked:
      'Run in this order on 2026-11-21: it rendered a 1080×1920 H.264 + AAC MP4.',
  },
];

/** The four scopes an API key can carry (studio docs/AGENT_PLATFORM.md §8). */
export const KEY_SCOPES = [
  { scope: 'read', what: 'Read capabilities, projects, jobs and renders.' },
  { scope: 'write', what: 'Create and edit projects, scenes, themes, assets.' },
  { scope: 'render', what: 'Start, cancel and retry renders and previews.' },
  {
    scope: 'admin',
    what: 'Keys, configuration, licence, storage, audit log.',
  },
] as const;

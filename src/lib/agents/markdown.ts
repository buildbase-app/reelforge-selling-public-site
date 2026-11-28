import { siteConfig } from '@/config/site';
import {
  collapsedCalls,
  enginesOf,
  reels,
  toolCatalog,
  toolCatalogSource,
} from './catalog';
import { AGENT_CLIENTS, KEY_SCOPES } from './snippets';
import { agentsVideoSlugs } from '@/lib/gallery/showcase';

/**
 * /agents as Markdown, for agents (served at /agents.md and listed in
 * llms.txt). Built from the same data as the page, so the two never differ.
 */
export function buildAgentsMarkdown(): string {
  const base = siteConfig.url.replace(/\/$/, '');
  const clients = AGENT_CLIENTS.map(
    (c) => `### ${c.name}

${c.summary}

${c.snippets.map((s) => `${s.label}:\n\n\`\`\`${s.language}\n${s.code}\n\`\`\``).join('\n\n')}

What we checked: ${c.checked}`
  ).join('\n\n');

  // Videos and render facts follow the gallery bar (studio issue #807).
  const withVideo = agentsVideoSlugs();
  const cookbook = reels
    .map((r) => {
      const lines = [
        `- Prompt: "${r.prompt}"`,
        `- Tools called: ${collapsedCalls(r)
          .map((c) => (c.times > 1 ? `${c.tool} x${c.times}` : c.tool))
          .join(' -> ')}`,
      ];
      if (withVideo.has(r.slug))
        lines.push(
          `- Result: ${r.output.width}x${r.output.height}, ${r.output.durationSeconds} s, ${enginesOf(r).join(' + ')}, rendered in ${r.renderSeconds} s (RenderWeld ${r.versions.studio}, ${r.renderedAt.slice(0, 10)}; times vary)`,
          `- Video: ${base}${r.files.mp4}`
        );
      return `### ${r.title}\n\n${lines.join('\n')}`;
    })
    .join('\n\n');

  const tools = toolCatalog.groups
    .map(
      (g) =>
        `### ${g.title}\n\n${g.tools
          .map(
            (t) =>
              `- \`${t.name}\`${t.readOnly ? ' (read-only)' : ''}: ${t.summary}`
          )
          .join('\n')}`
    )
    .join('\n\n');

  return `# Connect your agent to RenderWeld

> RenderWeld serves an MCP server at \`/mcp\` (Streamable HTTP) and a REST API at \`/v1\` on your own machine (default \`http://127.0.0.1:4321\`). Add it to your agent with an API key, then ask for a reel. Page: ${base}/agents

## Clients

Only clients with a checked config are listed. Placeholders: \`rf_...\` is your key.

${clients}

## Keys

Create one per agent on your studio: \`docker compose exec renderweld renderweld keys create --name agent --scopes read,write,render\`. Shown once, stored hashed.

${KEY_SCOPES.map((s) => `- \`${s.scope}\`: ${s.what}`).join('\n')}

The studio binds 127.0.0.1 by default; for remote agents put it behind TLS (compose profile \`tls\`) and use \`https://YOUR-HOST/mcp\`.

## Prompt cookbook

${withVideo.size > 0 ? 'Recipes with a video are real renders. ' : ''}The calls were sent by a script that follows the studio's workflow guide (MCP resource \`renderweld://guide/workflow\`, prompt \`make_reel\`).

${cookbook}

## Tools (${toolCatalog.count}, from ${toolCatalogSource()})

Every REST route has a tool with the same scope. Tool names are experimental until v1.0.

${tools}
`;
}

import { contactUri, siteConfig } from '@/config/site';

/**
 * Agent-facing prose: llms.txt, llms-full.txt and the installable SKILL.md.
 * Generated from one page inventory so agents and people see the same store.
 * Only list pages that exist; say "not on sale yet" rather than invent
 * products or prices (prices come from BuildBase items at runtime).
 */

export interface PageEntry {
  title: string;
  path: string;
  summary: string;
}

export const PAGES: PageEntry[] = [
  {
    title: 'Home',
    path: '/',
    summary:
      'What RenderWeld is: a source-available video renderer that an AI agent drives over REST and MCP, rendering with Remotion, Motion Canvas, HTML and HyperFrames at any size and frame rate. Free for personal use; one-time Commercial licence.',
  },
  {
    title: 'Pricing',
    path: '/pricing',
    summary:
      'The free Personal licence (noncommercial use, claimed with no payment page) first, then the Commercial licence tiers and their prices, read from the store and rendered on the server. Also: which licence you need. While nothing is on sale, it says so and links to the waitlist.',
  },
  {
    title: 'Connect your agent',
    path: '/agents',
    summary:
      'How to connect Claude Code, Codex, any MCP client or plain REST to a self-hosted RenderWeld server: checked configs, API key scopes, a prompt cookbook with real renders, and every MCP tool grouped by job. As Markdown: /agents.md.',
  },
  {
    title: 'Order',
    path: '/order',
    summary:
      'Where a buyer lands after checkout or a free claim: order status and the licence key, labelled Personal or Commercial. Guests open it with the link from their receipt.',
  },
  {
    title: 'Waitlist',
    path: '/waitlist',
    summary: 'Leave a name and email to hear when RenderWeld can be bought.',
  },
  {
    title: 'Docs',
    path: '/docs',
    summary:
      'RenderWeld documentation, published from the source repository to BuildBase Docs: quick start (Docker, first API key, connecting an agent over MCP), install and licence, the REST API, every MCP tool, providers, manifest v0.2, a prompt cookbook, privacy and network egress, troubleshooting. Every page also as Markdown (add .md to its URL; index at /docs.md).',
  },
  {
    title: 'Help',
    path: '/help',
    summary:
      'Frequently asked questions: what you get, using RenderWeld with an AI agent, what is not ready yet, Remotion licensing.',
  },
  {
    title: 'Account',
    path: '/dashboard',
    summary:
      'Signed-in customers: licence keys (Personal or Commercial), recent orders, invoices, notification settings, security (sessions, devices, connected agents).',
  },
  {
    title: 'Licences',
    path: '/licence',
    summary:
      'Summary of the two licences: Personal (PolyForm Noncommercial 1.0.0) and the RenderWeld Commercial License (draft), with the trademark policy.',
  },
  {
    title: 'Blog',
    path: '/blog',
    summary: 'News and how-to guides.',
  },
  {
    title: 'Changelog',
    path: '/changelog',
    summary: 'Release notes for the store and the product.',
  },
];

/**
 * What RenderWeld is and what is verified, in plain lines. Keep it to facts
 * true today (the private design brief, §7); say what is not verified
 * rather than leave it implied.
 */
export const PRODUCT_FACTS = [
  '- RenderWeld is a source-available video renderer that the buyer self-hosts on their own machine or cloud server. The code is public to read; the licence limits how it may be used.',
  `- Source: ${siteConfig.repo.url} (licensing: ${siteConfig.repo.licensing}).`,
  '- Personal use is free under the PolyForm Noncommercial License 1.0.0, with a free Personal licence key claimed with a BuildBase account. Any commercial use needs a paid RenderWeld Commercial License (one-time; tiers and prices read from the store).',
  '- Every released Docker image activates with a licence key from BuildBase. No resale, redistribution, rebranding or competing hosted service under either licence; forks must be renamed.',
  "- The buyer's own AI agent drives it over a REST API and an MCP server running on the buyer's machine (any MCP client; tested with Claude Code). The agent plans every scene and its timing.",
  '- Four rendering engines: Remotion, Motion Canvas, HTML and HyperFrames, mixed per scene in one project.',
  '- Output: any even width and height from 16 to 4096 px, frame rates 23.976 to 60 including exact NTSC rates; MP4, ProRes MOV (with alpha), WebM (VP9, AV1), GIF, PNG sequence, or audio only (M4A, WAV). One render call can produce several variants (sizes and formats) with one batch id. Layouts: split screen, picture-in-picture, lower thirds, grids.',
  '- Captions: off, burned in, sidecar files (SRT, WebVTT, ASS) or both, per render.',
  '- Workspaces: one install can host several teams; each key sees only its own workspace (scopes read, write, render, admin, owner).',
  '- Storage: local disk, S3-compatible, Google Cloud Storage, Azure Blob. Database: SQLite, PostgreSQL, MySQL/MariaDB. Queue dispatch: poll, PostgreSQL notify, Redis, SQS. Deployment guides for AWS, Google Cloud, Azure and other platforms.',
  '- Isolation: the only outside service an install needs is the BuildBase licence check; installs never talk to each other; no telemetry.',
  '- Media providers today: ElevenLabs text-to-speech and faster-whisper speech-to-text. AI image and video providers are not shipped.',
  '- Verified: an end-to-end run in Docker, and headless Claude Code making an 18-second reel with all four engines over MCP only.',
  '- Not verified yet, so not offered as features: rendering on serverless functions (Remotion Lambda), live ElevenLabs voice-over (tested against a mock), hundreds of workers rendering at once on cloud machines (not measured), Codex and Cursor as clients.',
  '- No per-video fees to RenderWeld. Remotion is not covered by either RenderWeld licence and requires its own licence for companies over 3 people (https://www.remotion.dev/license).',
].join('\n');

const base = () => siteConfig.url.replace(/\/$/, '');

/** Where the source and the licence texts are, for llms.txt and llms-full.txt. */
function licensingLinks(b: string): string {
  return [
    `- [Source on GitHub](${siteConfig.repo.url}): source-available, default branch \`main\`.`,
    `- [LICENSING.md](${siteConfig.repo.licensing}): which licence you need.`,
    `- [Personal licence: PolyForm Noncommercial 1.0.0](${siteConfig.repo.license}) (canonical text: ${siteConfig.polyformNoncommercial}).`,
    `- [RenderWeld Commercial License (draft)](${siteConfig.repo.commercialLicense}).`,
    `- [Trademark policy](${siteConfig.repo.trademark}): forks must be renamed.`,
    `- [Licences summary](${b}/licence) and [pricing](${b}/pricing) on this site.`,
  ].join('\n');
}

function contactLines(): string {
  return siteConfig.contact.support
    ? `Support: ${siteConfig.contact.support}`
    : `Support: ${siteConfig.contact.page}`;
}

export function buildLlmsTxt(): string {
  const b = base();
  return `# ${siteConfig.name}

> ${siteConfig.description}

This is the ${siteConfig.name} store: where people learn about RenderWeld, claim a free Personal licence key or buy a Commercial licence, and manage their keys. The source itself is on GitHub. RenderWeld is early access; nothing here should be read as a promise of features that are not listed.

## The product

${PRODUCT_FACTS}

## Licensing

${licensingLinks(b)}

## For agents

- [MCP server](${b}/api/mcp): Streamable HTTP, OAuth 2.1 + PKCE. Read-only access to the signed-in customer's account.
- [MCP server card](${b}/.well-known/mcp/server-card.json): endpoint, transport, capabilities.
- [Auth instructions](${b}/auth.md): how to register a client and get a token.
- [OpenAPI](${b}/openapi.json): the REST routes this site exposes.
- [Full guide](${b}/llms-full.txt): every page, route and tool.
- [Connect your agent to RenderWeld](${b}/agents.md): client configs, prompt cookbook and the studio's MCP tools, as Markdown.

## Pages

${PAGES.map((p) => `- [${p.title}](${b}${p.path}): ${p.summary}`).join('\n')}

## Optional

- [Privacy](${b}/privacy)
- [Terms](${b}/terms)
- [Security contact](${b}/security.txt)
`;
}

export function buildLlmsFullTxt(): string {
  const b = base();
  const pages = PAGES.map(
    (p) => `### ${p.title}

Path: ${b}${p.path}

${p.summary}`
  ).join('\n\n');

  return `# ${siteConfig.name}: full guide

> ${siteConfig.description}

## The product

${PRODUCT_FACTS}

## What this site is

The RenderWeld store. RenderWeld itself runs on the buyer's own computer or cloud server; this site does not render video. Here people claim the free Personal licence key or buy a Commercial licence, then find their keys on the order page and under Dashboard, Licences. The store runs on BuildBase (${siteConfig.buildbase.url}) for sign-in, checkout and downloads. Prices and what each option includes are read from the store's items at runtime; while none are published, the pricing page says RenderWeld is not on sale yet.

## Licensing

${licensingLinks(b)}

Remotion note: RenderWeld includes Remotion-based templates. Remotion is free for individuals and companies of up to 3 people; larger companies need their own Remotion licence (https://www.remotion.dev/license).

## How an agent connects

1. POST ${b}/api/mcp with no token: 401 with \`WWW-Authenticate: Bearer resource_metadata="${b}/.well-known/oauth-protected-resource/mcp"\`.
2. GET that metadata: \`authorization_servers\` and \`scopes_supported\`.
3. Register a public client (RFC 7591, \`token_endpoint_auth_method: none\`), authorize with PKCE, exchange the code.
4. Call ${b}/api/mcp with \`Authorization: Bearer <token>\`.

Scopes: \`account:read\`. Every tool is read-only; purchases happen on the website.

## REST API

See ${b}/openapi.json. Highlights:

- GET /api/health: liveness (add ?deep=true for a database ping)
- GET /api/content/blog/{slug}: blog post as markdown
- GET /api/user/export, DELETE /api/user/delete: personal data export and erasure (signed in)

## Pages

${pages}

## Discovery documents

${[
  '/llms.txt',
  '/llms-full.txt',
  '/auth.md',
  '/security.txt',
  '/openapi.json',
  '/.well-known/agent-card.json',
  '/.well-known/mcp/server-card.json',
  '/.well-known/oauth-protected-resource/mcp',
  '/.well-known/api-catalog',
]
  .map((p) => `- ${b}${p}`)
  .join('\n')}

## Contact

${contactLines()}
Security: ${contactUri()}
`;
}

export function buildSkillMarkdown(): string {
  const b = base();
  return `---
name: renderweld-store
description: Read a RenderWeld customer's account over MCP (read-only).
---

# RenderWeld store skill

## When to use
The user asks about their RenderWeld account on ${b}: invoices, workspaces, profile.

## Connect
1. Add the MCP server \`${b}/api/mcp\` to your client (Streamable HTTP).
2. Complete the OAuth flow when prompted.

## Guardrails
- Every tool is read-only; purchases, downloads and billing changes happen on the website.
- Never paste tokens into chats or files.

## References
- Full guide: ${b}/llms-full.txt
- OpenAPI: ${b}/openapi.json
`;
}

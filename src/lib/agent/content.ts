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
      'What ReelForge is: a self-hosted studio that turns a storyboard into vertical video with Remotion and Motion Canvas.',
  },
  {
    title: 'Pricing',
    path: '/pricing',
    summary:
      'What can be bought, read live from the store. While nothing is on sale, it says so and links to the waitlist.',
  },
  {
    title: 'Order',
    path: '/order',
    summary:
      'Where a buyer lands after checkout: order status, downloads and licence keys. Guests open it with the link from their receipt.',
  },
  {
    title: 'Waitlist',
    path: '/waitlist',
    summary: 'Leave a name and email to hear when ReelForge can be bought.',
  },
  {
    title: 'Help',
    path: '/help',
    summary: 'Frequently asked questions, including Remotion licensing.',
  },
  {
    title: 'Account',
    path: '/dashboard',
    summary:
      'Signed-in customers: licences (downloads and keys), recent orders, invoices, notification settings, security (sessions, devices, connected agents).',
  },
  {
    title: 'Blog',
    path: '/blog',
    summary: 'Announcements and guides.',
  },
  {
    title: 'Changelog',
    path: '/changelog',
    summary: 'Release notes for the store and the product.',
  },
];

const base = () => siteConfig.url.replace(/\/$/, '');

function contactLines(): string {
  return siteConfig.contact.support
    ? `Support: ${siteConfig.contact.support}`
    : `Support: ${siteConfig.contact.page}`;
}

export function buildLlmsTxt(): string {
  const b = base();
  return `# ${siteConfig.name}

> ${siteConfig.description}

This is the ${siteConfig.name} store: where people learn about ReelForge, join the waitlist and, once it is on sale, buy it and download it. ReelForge is early access; nothing here should be read as a promise of features that are not listed.

## For agents

- [MCP server](${b}/api/mcp): Streamable HTTP, OAuth 2.1 + PKCE. Read-only access to the signed-in customer's account.
- [MCP server card](${b}/.well-known/mcp/server-card.json): endpoint, transport, capabilities.
- [Auth instructions](${b}/auth.md): how to register a client and get a token.
- [OpenAPI](${b}/openapi.json): the REST routes this site exposes.
- [Full guide](${b}/llms-full.txt): every page, route and tool.

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

## What this site is

The ReelForge store. ReelForge itself is software the buyer runs on their own computer or server; this site does not render video. The store runs on BuildBase (${siteConfig.buildbase.url}) for sign-in, checkout and downloads. Prices and what each option includes are read from the store's items at runtime; while none are published, the pricing page says ReelForge is not on sale yet.

Licensing note: ReelForge includes Remotion-based templates. Remotion is free for individuals and companies of up to 3 people; larger companies need their own Remotion licence (https://www.remotion.dev/license).

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
name: reelforge-store
description: Read a ReelForge customer's account over MCP (read-only).
---

# ReelForge store skill

## When to use
The user asks about their ReelForge account on ${b}: invoices, workspaces, profile.

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

import 'server-only';
import { createAgentStack } from '@buildbase/sdk/mcp';
import { env, siteUrl, buildbaseEnvironment, isNoindexSite } from '@/env';
import { contactUri, siteConfig } from '@/config/site';
import { logger } from '@/lib/logger';
import { robotsConfig } from '@/lib/seo/robots';
import { SCOPES, storeTools, storeResources, storePrompts } from './tools';
import { buildLlmsTxt, buildLlmsFullTxt, buildSkillMarkdown } from './content';
import { buildOpenApiSpec } from './openapi';

/**
 * The agent stack: MCP server + every discovery document, from one config.
 *
 *   /api/mcp                         ← agent.routes
 *   /.well-known/*  /llms.txt  /auth.md  /security.txt  /openapi.json
 *                                    ← agent.serveAgentPath
 *
 * `secret` wires `buildbaseAuth`: every MCP request must carry a token this
 * app minted in /api/auth/oauth2-token, with `aud` bound to <site>/mcp, and
 * the encrypted `sid` claim is turned back into the user's BuildBase session
 * so tools run with the user's real permissions.
 */
export const agent = createAgentStack({
  serverUrl: env.NEXT_PUBLIC_BUILDBASE_SERVER_URL,
  orgId: env.NEXT_PUBLIC_BUILDBASE_ORG_ID,
  environment: buildbaseEnvironment,
  siteUrl,
  site: {
    name: siteConfig.name,
    description: siteConfig.description,
    documentationUrl: `${siteUrl}/llms-full.txt`,
    ...(siteConfig.contact.support
      ? { contactEmail: siteConfig.contact.support }
      : {}),
    provider: { name: siteConfig.name, url: siteUrl },
  },
  secret: env.SYSTEM_SECRET,
  scopes: [...SCOPES],
  mcp: {
    serverInfo: { name: 'renderweld-store', version: '0.1.0' },
    builtinTools: 'readonly',
    tools: [...storeTools],
    handler: {
      instructions:
        "This is the RenderWeld store. Built-in tools read the signed-in customer's account (workspaces, invoices, profile). There are no write tools; purchases happen on the website. Ask for a workspaceId when the user has several workspaces.",
      builtinResources: true,
      resources: storeResources,
      prompts: storePrompts,
      onError: (error, ctx) => {
        logger.error('MCP error', {
          error: error instanceof Error ? error.message : String(error),
          ...(ctx as Record<string, unknown>),
        });
      },
      formatToolError: (error) =>
        error instanceof Error ? error.message : 'Tool failed',
    },
  },
  discovery: {
    // /robots.txt (src/app/robots.txt/route.ts): allow on production,
    // `Disallow: /` on the test copy (src/lib/seo/robots.ts).
    robots: robotsConfig(isNoindexSite, siteUrl),
    llmsTxt: buildLlmsTxt(),
    llmsFullTxt: buildLlmsFullTxt(),
    skills: [
      {
        name: 'renderweld-store',
        description:
          "Read a RenderWeld customer's account over MCP (read-only).",
        content: buildSkillMarkdown(),
      },
    ],
    security: {
      contact: contactUri(),
      expires: '2027-09-01T00:00:00.000Z',
    },
    apiCatalog: [
      {
        anchor: `${siteUrl}/api`,
        title: `${siteConfig.name} API`,
        serviceDesc: `${siteUrl}/openapi.json`,
        serviceDoc: `${siteUrl}/llms-full.txt`,
        status: `${siteUrl}/api/health`,
      },
    ],
    extraPaths: {
      '/openapi.json': {
        body: JSON.stringify(buildOpenApiSpec(), null, 2),
        contentType: 'application/json; charset=utf-8',
        cacheControl: 'public, max-age=300',
      },
    },
  },
});

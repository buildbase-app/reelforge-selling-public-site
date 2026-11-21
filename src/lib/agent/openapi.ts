import { siteConfig } from '@/config/site';

/**
 * OpenAPI 3.1 description of the routes THIS app serves (not the BuildBase
 * platform API — that lives behind the SDK). Served at /openapi.json and
 * linked from /.well-known/api-catalog so API-consuming agents find it.
 */
export function buildOpenApiSpec() {
  const b = siteConfig.url.replace(/\/$/, '');
  const workspaceParam = {
    name: 'workspaceId',
    in: 'query',
    required: true,
    schema: { type: 'string' },
    description: 'BuildBase workspace id the caller belongs to.',
  };
  const unauthorized = {
    description: 'Not signed in or not a workspace member.',
  };
  const ok = (schema: unknown, description = 'OK') => ({
    description,
    content: { 'application/json': { schema } },
  });
  const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

  return {
    openapi: '3.1.0',
    info: {
      title: `${siteConfig.name} API`,
      version: '0.3.0',
      description:
        'Routes exposed by the BuildBase demo app. Authenticate with the httpOnly session cookie (browser) or a bearer token minted by /api/auth/oauth2-token (agents and integrations). The MCP server at /api/mcp exposes the same capabilities as tools.',
      contact: { email: siteConfig.contact.support },
      license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
    },
    externalDocs: {
      description: 'Full guide for agents',
      url: `${b}/llms-full.txt`,
    },
    servers: [{ url: b, description: 'Production' }],
    security: [{ bearerAuth: [] }, { sessionCookie: [] }],
    tags: [
      { name: 'billing', description: 'Public plans.' },
      { name: 'events', description: 'SDK events and platform webhooks.' },
      {
        name: 'auth',
        description: 'OAuth2 application bridge used by BuildBase.',
      },
      { name: 'agents', description: 'MCP endpoint.' },
      { name: 'content', description: 'Markdown content for agents.' },
      { name: 'account', description: 'GDPR endpoints.' },
      { name: 'system' },
    ],
    paths: {
      '/api/health': {
        get: {
          tags: ['system'],
          summary: 'Health check',
          operationId: 'getHealth',
          security: [],
          parameters: [
            {
              name: 'deep',
              in: 'query',
              schema: { type: 'boolean', default: false },
              description: 'Also ping the database.',
            },
          ],
          responses: {
            '200': ok({
              type: 'object',
              properties: {
                status: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            }),
          },
        },
      },
      '/api/plans': {
        get: {
          tags: ['billing'],
          summary: 'Public pricing plans',
          description:
            'The plan group shown on /pricing, straight from the BuildBase console. No auth.',
          operationId: 'getPublicPlans',
          security: [],
          parameters: [
            {
              name: 'slug',
              in: 'query',
              schema: { type: 'string', default: 'main-pricing' },
            },
          ],
          responses: {
            '200': ok({ type: 'object', additionalProperties: true }),
            '404': { description: 'No public plan group with that slug.' },
          },
        },
      },
      '/api/events': {
        get: {
          tags: ['events'],
          summary: 'Recent events for a workspace',
          description:
            'Client SDK lifecycle events (persisted via POST) and signed platform webhooks, newest first.',
          operationId: 'listEvents',
          parameters: [
            workspaceParam,
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 50, maximum: 200 },
            },
          ],
          responses: { '200': ok(ref('EventList')), '401': unauthorized },
        },
        post: {
          tags: ['events'],
          summary: 'Persist a client SDK event',
          operationId: 'recordEvent',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    eventType: { type: 'string' },
                    data: { type: 'object' },
                  },
                  required: ['eventType', 'data'],
                },
              },
            },
          },
          responses: { '200': { description: 'Stored.' } },
        },
      },
      '/api/webhooks/buildbase': {
        post: {
          tags: ['events'],
          summary: 'BuildBase webhook receiver',
          description:
            'Verifies `x-buildbase-signature` / `x-buildbase-timestamp` with the SDK and stores the event. Configure the URL in the console under Settings → Webhooks.',
          operationId: 'receiveWebhook',
          security: [],
          responses: {
            '200': { description: 'Accepted.' },
            '401': { description: 'Bad signature or stale timestamp.' },
          },
        },
      },
      '/api/auth/oauth2-token': {
        post: {
          tags: ['auth'],
          summary: 'applicationTokenUrl',
          description:
            "Called by BuildBase on every grant to mint this app's access token. Not for direct use.",
          operationId: 'mintAppToken',
          security: [],
          responses: {
            '200': ok({
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                token: { type: 'string' },
                expiresIn: { type: 'integer' },
              },
            }),
            '401': { description: 'Platform signature invalid.' },
          },
        },
      },
      '/api/auth/oauth2-profile': {
        get: {
          tags: ['auth'],
          summary: 'applicationProfileUrl (userinfo)',
          operationId: 'getProfile',
          responses: {
            '200': ok(ref('User')),
            '401': { description: 'Invalid token.' },
          },
        },
      },
      '/api/mcp': {
        post: {
          tags: ['agents'],
          summary: 'MCP endpoint (JSON-RPC over Streamable HTTP)',
          description:
            'Unauthenticated calls receive a 401 with RFC 9728 `WWW-Authenticate` pointing at /.well-known/oauth-protected-resource/mcp.',
          operationId: 'mcp',
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', description: 'JSON-RPC 2.0 request' },
              },
            },
          },
          responses: {
            '200': { description: 'JSON-RPC response.' },
            '401': { description: 'Bearer challenge.' },
          },
        },
      },
      '/api/content/blog/{slug}': {
        get: {
          tags: ['content'],
          summary: 'Blog post as markdown',
          operationId: 'getBlogMarkdown',
          security: [],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'text/markdown' },
            '404': { description: 'Not found.' },
          },
        },
      },
      '/api/content/changelog/{slug}': {
        get: {
          tags: ['content'],
          summary: 'Changelog entry as markdown',
          operationId: 'getChangelogMarkdown',
          security: [],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'text/markdown' },
            '404': { description: 'Not found.' },
          },
        },
      },
      '/api/user/export': {
        get: {
          tags: ['account'],
          summary: 'GDPR data export (Art. 15)',
          operationId: 'exportUserData',
          responses: {
            '200': ok({ type: 'object', additionalProperties: true }),
            '401': unauthorized,
          },
        },
      },
      '/api/user/delete': {
        delete: {
          tags: ['account'],
          summary: 'GDPR erasure (Art. 17)',
          operationId: 'deleteUserData',
          responses: {
            '200': { description: 'Anonymised.' },
            '401': unauthorized,
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'App token minted by /api/auth/oauth2-token (agents) or /api/auth/token (web).',
        },
        sessionCookie: { type: 'apiKey', in: 'cookie', name: 'bb-session-id' },
      },
      schemas: {
        EventList: {
          type: 'object',
          properties: {
            sdkEvents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  eventType: { type: 'string' },
                  payload: { type: 'object' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            webhooks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  event: { type: 'string' },
                  payload: { type: 'object' },
                  receivedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            image: { type: 'string', nullable: true },
            role: { type: 'string' },
            emailVerified: { type: 'boolean' },
          },
        },
      },
    },
  };
}

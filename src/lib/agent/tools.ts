import 'server-only';
import { z } from 'zod';
import {
  defineMcpResource,
  defineMcpPrompt,
  mcpText,
  type McpToolContext,
} from '@buildbase/sdk/mcp';
import { resolveMemberGrants } from '@/lib/server-auth';
import { buildLlmsFullTxt } from './content';

/**
 * The store's MCP surface. An agent signed in as a customer can read their
 * account through the built-in BuildBase tools (workspaces, subscription,
 * invoices, ...), which `createAgentStack` adds in read-only mode. This file
 * adds a guide resource and a workspace summary prompt; there are no write
 * tools.
 */

export const SCOPES = [
  {
    name: 'account:read',
    description: 'Read your RenderWeld account, workspaces and purchases',
  },
] as const;

class ToolError extends Error {}

/**
 * Pick the workspace to act on: explicit argument, then the workspace pinned
 * in the token, then - if the user has exactly one - that. Always confirms
 * membership with the platform.
 */
async function resolveWorkspace(
  ctx: McpToolContext,
  workspaceId?: string
): Promise<string> {
  const userId = ctx.auth.userId;
  if (!userId) throw new ToolError('Token has no user - re-authenticate.');
  let id = workspaceId ?? ctx.workspaceId;
  if (!id) {
    const all = await ctx.bb.workspace.list();
    if (all.length === 1) id = all[0]._id;
    else
      throw new ToolError(
        `workspaceId is required. Your workspaces: ${
          all.map((w) => `${w.name} (${w._id})`).join(', ') || 'none'
        }`
      );
  }
  const grants = await resolveMemberGrants(ctx.bb, id, userId);
  if (!grants) throw new ToolError(`You are not a member of workspace ${id}.`);
  return id;
}

export const storeTools = [] as const;

export const storeResources = [
  defineMcpResource({
    uri: 'reelforge://guide',
    name: 'reelforge-guide',
    title: 'RenderWeld store - what this site is and how to use it',
    description: 'The same content served at /llms-full.txt.',
    mimeType: 'text/markdown',
    read: () => buildLlmsFullTxt(),
  }),
];

export const storePrompts = [
  defineMcpPrompt({
    name: 'summarize_workspace',
    title: 'Summarise a workspace',
    description:
      'Pulls plan, seats and subscription state, then asks for a short status summary.',
    arguments: [{ name: 'workspaceId', required: false }],
    get: async (args, ctx) => {
      const workspaceId = await resolveWorkspace(
        ctx,
        z.string().optional().parse(args.workspaceId)
      );
      const [workspace, subscription] = await Promise.all([
        ctx.bb.workspace.get(workspaceId),
        ctx.bb.subscription.get(workspaceId).catch(() => null),
      ]);
      const facts = {
        workspace: {
          id: workspace._id,
          name: workspace.name,
          members: workspace.users?.length ?? 0,
        },
        subscription,
      };
      return [
        {
          role: 'user',
          content: mcpText(
            `Write a short status summary of this RenderWeld workspace for its owner: plan, seats and anything that needs action.\n\n\`\`\`json\n${JSON.stringify(facts, null, 2)}\n\`\`\``
          ),
        },
      ];
    },
  }),
];

'use client';

import { useEffect } from 'react';
import { provideWebMcpTools } from '@buildbase/sdk';
import { useSaaSWorkspaces } from '@buildbase/sdk/react';
import { useRouter } from '@/i18n/routing';

/**
 * WebMCP: the same actions an agent gets over /api/mcp, offered to an agent
 * running inside the browser (`navigator.modelContext`). They run as the
 * signed-in person, through the app's own API routes, so the server applies
 * the same permission checks. A no-op in browsers without WebMCP.
 */
export function WebMcpTools() {
  const { currentWorkspace } = useSaaSWorkspaces();
  const router = useRouter();
  const workspaceId = currentWorkspace?._id;

  useEffect(() => {
    if (!workspaceId) return;
    provideWebMcpTools([
      {
        name: 'open_page',
        description:
          'Open a page of this app, for example /dashboard/invoices or /dashboard/team.',
        inputSchema: {
          type: 'object',
          properties: { path: { type: 'string', pattern: '^/dashboard' } },
          required: ['path'],
        },
        execute: ({ path }: { path: string }) => {
          if (!path.startsWith('/dashboard')) throw new Error('Not allowed');
          router.push(path);
          return { opened: path };
        },
      },
    ]);
  }, [workspaceId, router]);

  return null;
}

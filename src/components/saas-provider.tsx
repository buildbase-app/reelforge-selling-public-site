'use client';

import '@/lib/zod-jitless';
import { ApiVersion, type EventType, type EventData } from '@buildbase/sdk';
import React from 'react';
import { buildbaseEnvironment, env } from '@/env';
import { SaaSOSProvider } from '@buildbase/sdk/react';
import { useParams } from 'next/navigation';
import { defaultLocale, type Locale } from '@/i18n/config';
import { clearLegacyAuthToken, setClientAuthToken } from '@/lib/auth-client';
import { TRACKING } from '@/lib/tracking-config';

const config = {
  serverUrl: env.NEXT_PUBLIC_BUILDBASE_SERVER_URL,
  orgId: env.NEXT_PUBLIC_BUILDBASE_ORG_ID,
  clientId: env.NEXT_PUBLIC_BUILDBASE_CLIENT_ID,
  redirectUrl: env.NEXT_PUBLIC_BUILDBASE_REDIRECT_URL,
};

clearLegacyAuthToken();

/**
 * Ask the server for a workspace-scoped app token. Only the workspace id is
 * sent — the server identifies the user from the httpOnly session cookie and
 * asks BuildBase for their real role (see src/lib/server-auth.ts).
 */
async function updateAuthToken(workspaceId: string) {
  try {
    const response = await fetch('/api/auth/workspace-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });
    const data = await response.json();
    if (data.success && data.token) {
      setClientAuthToken(data.token);
      return data.token;
    }
  } catch (error) {
    console.error('Failed to update auth token:', error);
  }
  return null;
}

export function SaaSProvider({
  children,
  tracking = true,
}: {
  children: React.ReactNode;
  /**
   * false inside a page that already mounts `BuildBaseTracking` (the
   * provider-free public pages' sign-in island), so tags and page views
   * are not installed twice; the SDK's events reach that tracker instead.
   */
  tracking?: boolean;
}) {
  // From the `[locale]` segment, not next-intl: the sign-in island mounts
  // this provider on public pages, which have no intl provider (#79).
  const params = useParams<{ locale?: string }>();
  const locale = (params?.locale ?? defaultLocale) as Locale;
  return (
    <SaaSOSProvider
      serverUrl={config.serverUrl}
      version={ApiVersion.V1}
      orgId={config.orgId}
      environment={buildbaseEnvironment}
      locale={locale}
      // Analytics and ad tags come from the console (Settings → Tracking)
      // and load only after consent.
      tracking={tracking ? TRACKING : undefined}
      auth={{
        clientId: config.clientId,
        redirectUrl: config.redirectUrl,
        callbacks: {
          // Called on page refresh to restore session from httpOnly cookie.
          // The SDK (1.8) needs the session id in the browser to call
          // BuildBase; /api/auth/session answers only same-origin reads.
          getSession: async () => {
            const res = await fetch('/api/auth/session');
            const data = await res.json();
            return data.sessionId ?? null;
          },
          handleAuthentication: async (code: string) => {
            const response = await fetch('/api/auth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code }),
            });
            const data = await response.json();
            return { sessionId: data.sessionId };
          },
          onSignOut: async () => {
            setClientAuthToken(null);
            // JSON, same-origin: the store refuses anything else (SEC-14).
            await fetch('/api/auth/signout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: '{}',
            });
          },
          handleEvent: async (eventType: EventType, data: EventData) => {
            try {
              // Sync event to database
              await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType, data }),
              });

              // Generate new workspace token on workspace change
              if (eventType === 'workspace:changed') {
                const eventData = data as unknown as {
                  workspace: { _id: string };
                  user: { _id: string; id?: string };
                  userRole?: string;
                };
                if (eventData.workspace?._id) {
                  await updateAuthToken(eventData.workspace._id);
                }
              }

              // Generate token when user is added to workspace
              if (eventType === 'workspace:user-added') {
                const eventData = data as unknown as {
                  workspace: { _id: string };
                };
                if (eventData.workspace?._id) {
                  await updateAuthToken(eventData.workspace._id);
                }
              }
            } catch (error) {
              console.error('Failed to handle event:', error);
            }
          },
          onWorkspaceChange: async ({ workspace }) => {
            if (!workspace?._id) return;
            await updateAuthToken(workspace._id);
          },
        },
      }}
    >
      {children}
    </SaaSOSProvider>
  );
}

/**
 * BuildBase tracking options, the same for `SaaSProvider` (pages with the
 * provider) and `SiteTracking` (`BuildBaseTracking` on the provider-free
 * public pages, studio issue #79). Analytics and ad tags come from the
 * console (Settings → Tracking) and load only after consent.
 */
export const TRACKING = {
  enabled: true,
  consent: 'auto',
  autoPageview: true,
  events: { mode: 'auto' },
  debug: process.env.NODE_ENV !== 'production',
} as const;

/**
 * What `BuildBaseTracking` needs to find this app's tags without the
 * provider. Read from process.env directly, not `@/env`: that module brings
 * zod into the browser bundle of every page that imports it.
 */
export const TRACKING_APP = {
  serverUrl:
    process.env.NEXT_PUBLIC_BUILDBASE_SERVER_URL ||
    'https://api.console.buildbase.app',
  orgId: process.env.NEXT_PUBLIC_BUILDBASE_ORG_ID ?? '',
  clientId: process.env.NEXT_PUBLIC_BUILDBASE_CLIENT_ID ?? '',
  environment: process.env.NEXT_PUBLIC_BUILDBASE_ENVIRONMENT || undefined,
};

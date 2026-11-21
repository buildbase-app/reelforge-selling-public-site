import { siteUrl } from '@/env';

/**
 * Store identity: the one place that says what this site is. Everything
 * agent-facing (llms.txt, agent cards, OpenAPI, security.txt) reads from here.
 */

/**
 * The support address, from NEXT_PUBLIC_SUPPORT_EMAIL (inlined at build
 * time). Unset until the founder chooses one: pages then point to /contact
 * and /help instead of showing an address. Never hard-code a guess here.
 */
const supportEmail: string | null =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || null;

const REPO = 'https://github.com/buildbase-app/reelforge-studio';

export const siteConfig = {
  name: 'ReelForge',
  shortName: 'ReelForge',
  description:
    'ReelForge: a source-available, agent-driven short-form video studio. Free for personal use; one-time commercial licence. Self-host it on your own machine or a cloud server you run, and drive it from your AI agent over REST and MCP (any MCP client; tested with Claude Code). Renders vertical MP4s with Remotion, Motion Canvas, HTML and HyperFrames.',
  url: siteUrl,
  /**
   * The product's public source repository (source-available under the
   * PolyForm Noncommercial License 1.0.0 plus a paid Commercial licence;
   * always say "source-available") and the licensing documents in it.
   * Founder decision 2026-11-21.
   */
  repo: {
    url: REPO,
    licensing: `${REPO}/blob/main/LICENSING.md`,
    license: `${REPO}/blob/main/LICENSE.md`,
    commercialLicense: `${REPO}/blob/main/COMMERCIAL-LICENSE.md`,
    trademark: `${REPO}/blob/main/TRADEMARK.md`,
    notice: `${REPO}/blob/main/NOTICE`,
  },
  /** The canonical text of the licence Personal use is under. */
  polyformNoncommercial:
    'https://polyformproject.org/licenses/noncommercial/1.0.0/',
  /** The platform the store runs on (sign-in, checkout, downloads). */
  buildbase: {
    url: 'https://buildbase.app',
    docs: 'https://buildbase.app/docs',
    sdkDocs: 'https://www.npmjs.com/package/@buildbase/sdk',
    agentGuide:
      'https://github.com/buildbase-app/sdk/blob/main/docs/MCP-AND-AGENT-READINESS.md',
  },
  contact: {
    /** Support email, or null when NEXT_PUBLIC_SUPPORT_EMAIL is not set. */
    support: supportEmail,
    /** Public contact page; works whether or not an email is configured. */
    page: `${siteUrl.replace(/\/$/, '')}/contact`,
  },
} as const;

/**
 * Shown in place of the support address in development builds only, so a
 * missing NEXT_PUBLIC_SUPPORT_EMAIL is obvious before deploying. Production
 * never shows it.
 */
export const SUPPORT_EMAIL_TODO =
  'TODO: set NEXT_PUBLIC_SUPPORT_EMAIL (no support address configured)';

/** A contact URI for machine-readable documents: mailto: or the contact page. */
export function contactUri(): string {
  return siteConfig.contact.support
    ? `mailto:${siteConfig.contact.support}`
    : siteConfig.contact.page;
}

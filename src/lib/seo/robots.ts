import { AI_BOT_USER_AGENTS } from '@buildbase/sdk';

/** Never crawled: the API, signed-in pages and per-buyer order pages. */
export const DISALLOW = ['/api/', '/dashboard/', '/order'];

/**
 * robots.txt for the agent stack (`discovery.robots`, served at /robots.txt).
 *
 * Production: every crawler, AI crawlers included, may read the public pages;
 * Content Signals allow search and AI answers (`aiTrain` stays unset until
 * the founder decides it); the sitemap is listed.
 *
 * The test copy (dev.renderweld.com, `isNoindexSite`): `Disallow: /` for
 * everyone, signals off and no sitemap, beside the `X-Robots-Tag: noindex`
 * header and the robots meta tag every page already carries there.
 */
export function robotsConfig(noindex: boolean, siteUrl: string) {
  if (noindex) {
    return {
      policies: [{ userAgent: '*', disallow: ['/'] }],
      aiBots: [],
      contentSignals: { search: false, aiInput: false },
      sitemaps: [],
      comment: ['Test copy of the RenderWeld store: not for indexing.'],
    };
  }
  return {
    policies: [{ userAgent: '*', allow: ['/'], disallow: DISALLOW }],
    aiBots: AI_BOT_USER_AGENTS.map((userAgent) => ({
      userAgent,
      allow: ['/'],
      disallow: DISALLOW,
    })),
    contentSignals: { search: true, aiInput: true },
    sitemaps: [`${siteUrl}/sitemap.xml`],
  };
}

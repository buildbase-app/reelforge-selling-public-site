import { siteUrl } from '@/env';
import { siteConfig } from '@/config/site';

/**
 * Central SEO / brand config.
 *
 * Single source of truth for brand name, URLs, author, publisher, social
 * handles, and schema.org defaults. Both Next.js Metadata API code (titles,
 * OG, Twitter) and the JSON-LD wrapper components in `@/components/seo` read
 * from here, so changing brand identity means editing this one file.
 *
 * i18n remains authoritative for translatable display copy. This config is
 * locale-agnostic — organization name, legalName, and social handles are the
 * same regardless of language.
 */

/** Shown wherever the seller's legal name belongs until it is confirmed. */
export const LEGAL_ENTITY_PLACEHOLDER = '[Legal entity to be confirmed]';

type ContactPoint = {
  telephone?: string;
  contactType?: string;
  email?: string;
  areaServed?: string;
};

export const seoConfig = {
  brand: {
    /** Product / company name used everywhere (JSON-LD, OG, Twitter). */
    name: siteConfig.name,
    /** The company that sells RenderWeld (src/config/site.ts). */
    legalName: siteConfig.company.legalName as string,
    description: siteConfig.description,
    tagline: 'Agents write the manifest. RenderWeld renders the video.',
    /** The product's public, source-available repository. */
    repository: siteConfig.repo.url,
    /** Licensing overview (Personal: PolyForm Noncommercial; Commercial). */
    license: siteConfig.repo.licensing,
    url: siteUrl,
    /** Path relative to public/ or absolute URL. Used for Organization JSON-LD. */
    logo: '/logo.png',
    foundingDate: undefined as string | undefined,
  },
  author: {
    name: 'RenderWeld team',
    url: siteUrl,
  },
  publisher: {
    name: siteConfig.name,
    logo: '/logo.png',
  },
  social: {
    /**
     * Twitter / X handle, including the leading `@` (e.g. `@myapp`).
     * When set, used for `twitter.site` / `twitter.creator` meta tags.
     */
    twitter: '' as string,
    /**
     * Profile URLs for the same entity. Emitted under Organization
     * JSON-LD `sameAs[]` so search engines link the brand to its
     * official off-site profiles. Add only URLs you actually own.
     */
    sameAs: [] as readonly string[],
  },
  contactPoint: (siteConfig.contact.support
    ? {
        contactType: 'customer support',
        email: siteConfig.contact.support,
      }
    : undefined) as ContactPoint | undefined,
  /**
   * Search engine verification tokens, from the environment (public values:
   * the content of each engine's verification meta tag). Empty or unset
   * means the tag is omitted. Set them in `.env.production` (production) or
   * the `deploy:dev` script; they are inlined at build time.
   *
   * - NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: Google Search Console
   * - NEXT_PUBLIC_BING_SITE_VERIFICATION: Bing Webmaster Tools (msvalidate.01)
   * - NEXT_PUBLIC_YANDEX_SITE_VERIFICATION: Yandex Webmaster
   */
  verification: {
    google: (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '').trim(),
    bing: (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? '').trim(),
    yandex: (process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION ?? '').trim(),
  },
  defaults: {
    twitterCard: 'summary_large_image' as const,
  },
} as const;

export type SeoConfig = typeof seoConfig;

/** Resolve a relative path against the brand URL; pass through absolute URLs. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = seoConfig.brand.url.replace(/\/$/, '');
  const suffix = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${suffix}`;
}

/** Absolute URL for the brand logo — needed by JSON-LD. */
export function brandLogoUrl(): string {
  return absoluteUrl(seoConfig.brand.logo);
}

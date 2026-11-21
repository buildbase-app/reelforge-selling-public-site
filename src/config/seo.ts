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
    /**
     * PLACEHOLDER: the legal entity that sells ReelForge is not confirmed
     * yet (founder decision). Replace this string once it is; the legal
     * pages show the same placeholder.
     */
    legalName: LEGAL_ENTITY_PLACEHOLDER,
    description: siteConfig.description,
    tagline: 'Polished Reels, rendered on your own machine.',
    url: siteUrl,
    /** Path relative to public/ or absolute URL. Used for Organization JSON-LD. */
    logo: '/logo.png',
    foundingDate: undefined as string | undefined,
  },
  author: {
    name: 'ReelForge team',
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
  contactPoint: undefined as ContactPoint | undefined,
  /**
   * Search engine verification tokens. Leave empty until you own the
   * property in the respective console — empty values are skipped.
   */
  verification: {
    google: '' as string,
    bing: '' as string,
    yandex: '' as string,
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

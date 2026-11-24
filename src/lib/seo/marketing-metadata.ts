import type { Metadata } from 'next';
import {
  defaultLocale,
  getOgLocale,
  locales as allLocales,
  type Locale,
} from '@/i18n/config';
import { siteUrl } from '@/env';
import { seoConfig } from '@/config/seo';
import { localeUrl } from '@/lib/i18n-url';

interface MarketingMetadataOptions {
  /** Unprefixed path, e.g. `/pricing`, `/blog/my-post`. */
  path: string;
  /** Locale from `await params`. */
  locale: Locale;
  title: string;
  description: string;
  /**
   * When true, the `<title>` tag renders `title` as-is instead of
   * appending the brand template (`%s | Brand`). Use this when the
   * title already includes the brand to avoid duplication.
   */
  titleAbsolute?: boolean;
  /** `og:type`. Defaults to `website`; use `article` for blog / changelog entries. */
  type?: 'website' | 'article';
  /**
   * Absolute URL or path (relative to the site root) for the OG / Twitter
   * card image. Defaults to the shared `/og.png`.
   */
  image?: string;
  /**
   * Locales this specific URL exists in — used to emit accurate
   * `hreflang` alternates. Defaults to every configured locale (right
   * for UI-only pages that translate via next-intl). Pass a narrower
   * set for content-backed detail pages that only exist in certain locales.
   */
  supportedLocales?: readonly Locale[];
  /**
   * Extra entries merged into `alternates.types` — e.g. the RSS feed
   * advertised on `/blog` and `/changelog`.
   */
  alternatesTypes?: Record<string, string>;
  /** ISO date for `article:published_time`. Only used when `type` is `article`. */
  publishedTime?: string;
  /** ISO date for `article:modified_time`. Only used when `type` is `article`. */
  modifiedTime?: string;
  /** Author name(s) for `article:author`. Only used when `type` is `article`. */
  authors?: string[];
  /** Article tags for `article:tag`. Only used when `type` is `article`. */
  articleTags?: string[];
}

/**
 * Build complete SEO metadata for a marketing page.
 *
 * Why this exists: Next.js does NOT deep-merge `metadata.openGraph`,
 * `metadata.twitter`, or `metadata.alternates` across parent/child
 * layouts — a partial override in a child replaces the parent's
 * entire object. Pages that only set `{ title, description }` silently
 * lose `og:image`, `og:type`, `og:url`, and locale alternates.
 * This helper fills in the full shape every time.
 */
export function buildMarketingMetadata({
  path,
  locale,
  title,
  description,
  titleAbsolute = false,
  type = 'website',
  image,
  supportedLocales = allLocales,
  alternatesTypes,
  publishedTime,
  modifiedTime,
  authors: articleAuthors,
  articleTags,
}: MarketingMetadataOptions): Metadata {
  const canonicalUrl = localeUrl(siteUrl, locale, path);

  // hreflang only when the page exists in more than one served language:
  // with English alone, alternates would just repeat the canonical.
  const servedLocales = supportedLocales.filter((l) =>
    (allLocales as readonly string[]).includes(l)
  );
  const languages: Record<string, string> = {};
  if (servedLocales.length > 1) {
    for (const loc of servedLocales) {
      languages[loc] = localeUrl(siteUrl, loc, path);
    }
    const xDefaultLocale = servedLocales.includes(defaultLocale)
      ? defaultLocale
      : servedLocales[0];
    languages['x-default'] = localeUrl(siteUrl, xDefaultLocale, path);
  }

  const resolvedImage = resolveImage(image);
  // The brand kit's share images (studio docs/brand) carry the tagline, so
  // their alt text says that; a page's own image is described by its title.
  const imageAlt = image
    ? `${seoConfig.brand.name}: ${title}`
    : BRAND_IMAGE_ALT;
  const twitterImage = image ? resolvedImage : `${siteUrl}/twitter-card.png`;

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalUrl,
      ...(Object.keys(languages).length > 0 ? { languages } : {}),
      ...(alternatesTypes ? { types: alternatesTypes } : {}),
    },
    openGraph: {
      title,
      description,
      type,
      locale: getOgLocale(locale),
      url: canonicalUrl,
      siteName: seoConfig.brand.name,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime: modifiedTime ?? publishedTime,
        authors: articleAuthors,
        tags: articleTags,
      }),
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: seoConfig.defaults.twitterCard,
      title,
      description,
      images: [{ url: twitterImage, alt: imageAlt }],
      ...(seoConfig.social.twitter && {
        site: seoConfig.social.twitter,
        creator: seoConfig.social.twitter,
      }),
    },
  };
}

/** What the default share images show: the logo and the tagline. */
const BRAND_IMAGE_ALT = `${seoConfig.brand.name}: ${seoConfig.brand.tagline}`;

function resolveImage(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return `${siteUrl}/og.png`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const suffix = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${siteUrl}${suffix}`;
}

import {
  absoluteUrl,
  brandLogoUrl,
  LEGAL_ENTITY_PLACEHOLDER,
  seoConfig,
} from '@/config/seo';
import { serializeJsonLd } from '@/lib/seo/json-ld';
import type { SchemaOffer } from '@/lib/store/offers';

/**
 * JSON-LD Structured Data Components
 *
 * They pre-fill brand / publisher / author defaults from `@/config/seo`,
 * resolve relative paths to absolute URLs, and keep a simple prop shape for
 * callers. Every one renders through `JsonLdScript` below, which serialises
 * with our own escaping (`serializeJsonLd`) rather than a library's.
 *
 * Prefer these wrappers so that brand identity stays centralised.
 */

// =============================================================================
// Script element
// =============================================================================

export interface JsonLdScriptProps {
  data: unknown;
  scriptKey: string;
  id?: string;
}

/** A `<script type="application/ld+json">` with HTML-safe JSON. */
export function JsonLdScript({ data, scriptKey, id }: JsonLdScriptProps) {
  if (data === null || data === undefined) return null;
  return (
    <script
      key={scriptKey}
      type="application/ld+json"
      id={id || scriptKey}
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

// =============================================================================
// Organization
// =============================================================================

export interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
}

export function OrganizationJsonLd({
  name = seoConfig.brand.name,
  url = seoConfig.brand.url,
  logo,
  description = seoConfig.brand.description,
  sameAs,
  contactPoint = seoConfig.contactPoint,
}: OrganizationJsonLdProps = {}) {
  const mergedSameAs = [...seoConfig.social.sameAs, ...(sameAs ?? [])].filter(
    Boolean
  );
  const legalName =
    // Not emitted while the legal entity is still a placeholder.
    seoConfig.brand.legalName === LEGAL_ENTITY_PLACEHOLDER
      ? undefined
      : seoConfig.brand.legalName;
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    ...(name && { name }),
    ...(url && { url }),
    logo: logo ? absoluteUrl(logo) : brandLogoUrl(),
    ...(description && { description }),
    ...(mergedSameAs.length > 0 && { sameAs: mergedSameAs }),
    ...(contactPoint && {
      contactPoint: [{ '@type': 'ContactPoint', ...contactPoint }],
    }),
    ...(seoConfig.brand.foundingDate
      ? { foundingDate: seoConfig.brand.foundingDate }
      : {}),
    ...(legalName ? { legalName } : {}),
  };
  return <JsonLdScript data={data} scriptKey="organization-jsonld" />;
}

// =============================================================================
// WebSite (next-seo has no dedicated component — use raw JSON-LD)
// =============================================================================

export interface WebSiteJsonLdProps {
  name?: string;
  url?: string;
  description?: string;
  searchUrl?: string;
  searchQueryInput?: string;
}

export function WebSiteJsonLd({
  name = seoConfig.brand.name,
  url = seoConfig.brand.url,
  description = seoConfig.brand.description,
  searchUrl,
  searchQueryInput = 'search_term_string',
}: WebSiteJsonLdProps = {}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
  };
  if (searchUrl) {
    data.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluteUrl(searchUrl),
      },
      'query-input': `required name=${searchQueryInput}`,
    };
  }
  return <JsonLdScript data={data} scriptKey="website" />;
}

// =============================================================================
// WebPage (next-seo has no dedicated component — use raw JSON-LD)
// =============================================================================

export interface WebPageJsonLdProps {
  title: string;
  description?: string;
  url?: string;
  datePublished?: string;
  dateModified?: string;
  author?: { name: string; url?: string };
  image?: string;
}

export function WebPageJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  author,
  image,
}: WebPageJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: url ? absoluteUrl(url) : seoConfig.brand.url,
  };
  if (description) data.description = description;
  if (datePublished) data.datePublished = datePublished;
  if (dateModified) data.dateModified = dateModified;
  if (author) {
    data.author = {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    };
  }
  if (image) data.image = absoluteUrl(image);
  return <JsonLdScript data={data} scriptKey={`webpage-${title}`} />;
}

// =============================================================================
// Breadcrumb
// =============================================================================

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((i, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      ...(i.name && { name: i.name }),
      item: absoluteUrl(i.url),
    })),
  };
  return <JsonLdScript data={data} scriptKey="breadcrumb-jsonld" />;
}

// =============================================================================
// FAQ
// =============================================================================

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQJsonLdProps {
  items: FAQItem[];
}

export function FAQJsonLd({ items }: FAQJsonLdProps) {
  if (items.length === 0) return null;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
  return <JsonLdScript data={data} scriptKey="faq-jsonld" />;
}

// =============================================================================
// Article
// =============================================================================

export interface ArticleJsonLdProps {
  /** `BlogPosting` (default) for posts, `TechArticle` for release notes. */
  type?: 'BlogPosting' | 'TechArticle';
  title: string;
  description?: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    type?: 'Person' | 'Organization';
    name: string;
    url?: string;
    sameAs?: string[];
  };
  publisher?: { name: string; logo?: string };
  /** Word count for schema.org `wordCount`. */
  wordCount?: number;
  /** Category for `articleSection`. */
  articleSection?: string;
  /** Tags/keywords for `keywords`. */
  keywords?: string[];
  /** ISO language code for `inLanguage`. */
  inLanguage?: string;
}

export function ArticleJsonLd({
  type = 'BlogPosting',
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
  publisher = seoConfig.publisher,
  wordCount,
  articleSection,
  keywords,
  inLanguage,
}: ArticleJsonLdProps) {
  // Build a richer schema than next-seo's built-in to include
  // wordCount, articleSection, keywords, inLanguage, thumbnailUrl.
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    headline: title,
    url: absoluteUrl(url),
    datePublished,
    dateModified: dateModified ?? datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(url),
    },
    author: {
      '@type': author.type ?? 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
      ...(author.sameAs &&
        author.sameAs.length > 0 && { sameAs: author.sameAs }),
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: publisher.logo ? absoluteUrl(publisher.logo) : brandLogoUrl(),
      },
    },
  };

  if (description) data.description = description;
  if (image) {
    const imageUrl = absoluteUrl(image);
    data.image = imageUrl;
    data.thumbnailUrl = imageUrl;
  }
  if (wordCount) data.wordCount = wordCount;
  if (articleSection) data.articleSection = articleSection;
  if (keywords && keywords.length > 0) data.keywords = keywords.join(', ');
  if (inLanguage) data.inLanguage = inLanguage;

  return <JsonLdScript data={data} scriptKey={`article-${title}`} />;
}

// =============================================================================
// SoftwareApplication
// =============================================================================

export interface SoftwareApplicationJsonLdProps {
  name?: string;
  description?: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  /**
   * The offers on sale now (`buildOffers` from `@/lib/store/offers`). Render
   * this component only when there is at least one: without an offer it
   * returns null, so a page never claims something is for sale when it is
   * not (and never invents a price).
   */
  offers: SchemaOffer[];
}

export function SoftwareApplicationJsonLd({
  name = seoConfig.brand.name,
  description = seoConfig.brand.description,
  url = seoConfig.brand.url,
  applicationCategory = 'MultimediaApplication',
  operatingSystem = 'Linux (Docker)',
  offers,
}: SoftwareApplicationJsonLdProps) {
  if (offers.length === 0) return null;
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    // Source-available: the public repository and the licence it is under.
    sameAs: [seoConfig.brand.repository],
    license: seoConfig.brand.license,
    offers: offers.length === 1 ? offers[0] : offers,
  };
  return <JsonLdScript data={data} scriptKey="software-application" />;
}

// =============================================================================
// Blog (collection) — no next-seo built-in, use raw JSON-LD
// =============================================================================

export interface BlogPostingSummary {
  slug: string;
  title: string;
  description?: string;
  datePublished: string;
  dateModified?: string;
  author?: { name: string; url?: string };
  image?: string;
}

export interface BlogJsonLdProps {
  url?: string;
  name?: string;
  description?: string;
  posts: BlogPostingSummary[];
}

export function BlogJsonLd({
  url = '/blog',
  name = `${seoConfig.brand.name} Blog`,
  description = seoConfig.brand.description,
  posts,
}: BlogJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name,
    url: absoluteUrl(url),
    description,
    publisher: {
      '@type': 'Organization',
      name: seoConfig.publisher.name,
      logo: { '@type': 'ImageObject', url: brandLogoUrl() },
    },
  };

  if (posts.length > 0) {
    data.blogPost = posts.map((post) => {
      const postUrl = absoluteUrl(`/blog/${post.slug}`);
      const item: Record<string, unknown> = {
        '@type': 'BlogPosting',
        headline: post.title,
        url: postUrl,
        mainEntityOfPage: postUrl,
        datePublished: post.datePublished,
        dateModified: post.dateModified ?? post.datePublished,
      };
      if (post.description) item.description = post.description;
      if (post.image) item.image = absoluteUrl(post.image);
      if (post.author) {
        item.author = {
          '@type': 'Person',
          name: post.author.name,
          ...(post.author.url && { url: post.author.url }),
        };
      }
      return item;
    });
  }

  return <JsonLdScript data={data} scriptKey="blog" />;
}

// =============================================================================
// ItemList (collection / listing pages) — no next-seo built-in
// =============================================================================

export interface ItemListEntry {
  name: string;
  url: string;
  description?: string;
}

export interface ItemListJsonLdProps {
  name?: string;
  items: ItemListEntry[];
  url?: string;
}

export function ItemListJsonLd({ name, items, url }: ItemListJsonLdProps) {
  if (items.length === 0) return null;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.url),
      ...(item.description ? { description: item.description } : {}),
    })),
  };
  if (name) data.name = name;
  if (url) data.url = absoluteUrl(url);

  return <JsonLdScript data={data} scriptKey={`itemlist-${name ?? 'list'}`} />;
}

// =============================================================================
// VideoObject (gallery watch pages)
// =============================================================================

export interface VideoObjectJsonLdProps {
  /** A complete schema.org VideoObject (see `videoObject()` in `@/lib/gallery`). */
  data: Record<string, unknown>;
  id: string;
}

export function VideoObjectJsonLd({ data, id }: VideoObjectJsonLdProps) {
  return <JsonLdScript data={data} scriptKey={`video-${id}`} />;
}

import { JsonLdScript } from 'next-seo';
import { absoluteUrl, brandLogoUrl, seoConfig } from '@/config/seo';
import {
  BreadcrumbJsonLd,
  type BreadcrumbItem,
} from '@/components/seo/json-ld';

/**
 * Structured data for a docs page: `TechArticle` (schema.org) built from the
 * BuildBase doc (title, description, dates, tags), plus `BreadcrumbList`
 * (Docs > section > page). Only real values: no date is invented when the
 * API gives none.
 */
export function DocsJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  section,
  keywords,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
  section?: string | null;
  keywords?: string[];
  breadcrumbs: BreadcrumbItem[];
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    url: absoluteUrl(url),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(url) },
    inLanguage: 'en',
    isAccessibleForFree: true,
    proficiencyLevel: 'Beginner',
    publisher: {
      '@type': 'Organization',
      name: seoConfig.publisher.name,
      logo: { '@type': 'ImageObject', url: brandLogoUrl() },
    },
    about: {
      '@type': 'SoftwareApplication',
      name: 'ReelForge Studio',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Linux (Docker)',
    },
  };
  if (description) data.description = description;
  if (datePublished) data.datePublished = datePublished;
  if (dateModified ?? datePublished)
    data.dateModified = dateModified ?? datePublished;
  if (section) data.articleSection = section;
  if (keywords?.length) data.keywords = keywords.join(', ');

  return (
    <>
      <JsonLdScript data={data} scriptKey={`techarticle-${url}`} />
      <BreadcrumbJsonLd items={breadcrumbs} />
    </>
  );
}

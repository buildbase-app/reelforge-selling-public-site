import { absoluteUrl, seoConfig } from '@/config/seo';
import type { BlogAuthor, BlogPost } from './posts';

/** An author's links as full URLs (handles become profile URLs). */
export function authorSameAs(author: BlogAuthor): string[] {
  const { website, twitter, linkedin } = author.links;
  const links: string[] = [];
  if (website) links.push(website);
  if (twitter) {
    links.push(
      /^https?:\/\//.test(twitter)
        ? twitter
        : `https://x.com/${twitter.replace(/^@/, '')}`
    );
  }
  if (linkedin) {
    links.push(
      /^https?:\/\//.test(linkedin)
        ? linkedin
        : `https://www.linkedin.com/in/${linkedin}`
    );
  }
  return links.filter((l) => /^https:\/\//.test(l));
}

/** The author block of a post's BlogPosting JSON-LD. */
export function postAuthorJsonLd(post: BlogPost): {
  type: 'Person' | 'Organization';
  name: string;
  url?: string;
  sameAs?: string[];
} {
  const author = post.authors[0];
  // No named author (every release note): the organisation wrote it.
  if (!author) {
    return {
      type: 'Organization',
      name: seoConfig.brand.name,
      url: absoluteUrl('/'),
    };
  }
  const sameAs = authorSameAs(author);
  return {
    type: 'Person',
    name: post.authors.map((a) => a.name).join(', '),
    url: absoluteUrl(`/blog/authors/${author.username}`),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/** Person JSON-LD for an author's page. */
export function authorPersonJsonLd(author: BlogAuthor) {
  const sameAs = authorSameAs(author);
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Person' as const,
    name: author.name,
    url: absoluteUrl(`/blog/authors/${author.username}`),
    ...(author.image && { image: author.image }),
    ...(sameAs.length > 0 && { sameAs }),
    worksFor: {
      '@type': 'Organization' as const,
      name: seoConfig.publisher.name,
      url: seoConfig.brand.url,
    },
  };
}

/** Initials for an author without a picture. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

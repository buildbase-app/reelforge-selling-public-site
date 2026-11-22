import RSS from 'rss';
import type { BlogPost } from './posts';

export interface FeedOptions {
  title: string;
  description: string;
  /** Absolute URL of the listing page (`https://…/blog`). */
  siteUrl: string;
  /** Absolute URL of the feed itself. */
  feedUrl: string;
  /** Absolute URL of a post, from its slug. */
  postUrl: (slug: string) => string;
  /** Absolute URL of the site's logo. */
  imageUrl: string;
  language: string;
}

/** Cover images by extension; anything unknown is not enclosed. */
const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

function enclosureFor(image: string | undefined) {
  if (!image) return undefined;
  const ext = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(image)?.[1]?.toLowerCase();
  const type = ext ? IMAGE_TYPES[ext] : undefined;
  return type ? { url: image, type } : undefined;
}

/**
 * RSS 2.0 for the blog or the changelog: one item per published post, newest
 * first, with its summary, date, authors and tags. The guid is the post's
 * URL, so a republish under the same slug is the same item.
 */
export function buildFeed(posts: readonly BlogPost[], options: FeedOptions) {
  const feed = new RSS({
    title: options.title,
    description: options.description,
    site_url: options.siteUrl,
    feed_url: options.feedUrl,
    language: options.language,
    image_url: options.imageUrl,
    ...(posts[0] && { pubDate: new Date(posts[0].updated ?? posts[0].date) }),
  });

  for (const post of posts) {
    const url = options.postUrl(post.slug);
    const enclosure = enclosureFor(post.image);
    feed.item({
      title: post.version ? `${post.title} (v${post.version})` : post.title,
      description: post.description,
      url,
      guid: url,
      date: new Date(post.date),
      ...(post.authors.length > 0 && {
        author: post.authors.map((a) => a.name).join(', '),
      }),
      categories: post.tags.map((t) => t.title),
      ...(enclosure && { enclosure }),
    });
  }

  return feed.xml({ indent: true });
}

export const FEED_HEADERS = {
  'Content-Type': 'application/rss+xml; charset=utf-8',
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
} as const;

import 'server-only';
import { cache } from 'react';
import { getBlogPosts } from '@/lib/platform/content';
import { toBlogPosts, type BlogKind, type BlogPost } from './posts';

/**
 * The blog and changelog as the pages, feeds, sitemap and Markdown twins read
 * them: one cached BuildBase read (`getBlogPosts`, tag `buildbase:blog`),
 * shared by everything rendered in the same request. A `blog.*` webhook
 * revalidates that tag and the blog paths (src/lib/cache/webhook-tags.ts),
 * so a post published or edited in the console shows on the next request.
 * Without an API token (CI builds) every list is empty and every post 404s.
 */
const allPosts = cache(async (): Promise<BlogPost[]> => {
  return toBlogPosts(await getBlogPosts());
});

/** Published posts of one folder, newest first. */
export async function getPosts(kind: BlogKind): Promise<BlogPost[]> {
  return (await allPosts()).filter((p) => p.kind === kind);
}

/** One published post by folder and slug, or null. */
export async function getPost(
  kind: BlogKind,
  slug: string
): Promise<BlogPost | null> {
  return (await getPosts(kind)).find((p) => p.slug === slug) ?? null;
}

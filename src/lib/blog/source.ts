import 'server-only';
import { cache } from 'react';
import { getBlogPosts, getCollectionRecords } from '@/lib/platform/content';
import { CHANGELOG_COLLECTION, toChangelogPosts } from './changelog';
import { toBlogPosts, type BlogKind, type BlogPost } from './posts';

/**
 * The blog and changelog as the pages, feeds, sitemap and Markdown twins read
 * them, each one cached BuildBase read shared by everything rendered in the
 * same request:
 *
 * - the blog: BuildBase Blogs, folder `blog` (`getBlogPosts`, tag
 *   `buildbase:blog`, revalidated by `blog.*` webhooks);
 * - the changelog: the custom collection `changelog` (`./changelog.ts`, tag
 *   `buildbase:collection:changelog`, revalidated by `collection.record_*`
 *   and `collection.version_published` webhooks).
 *
 * Drafts never appear: Blogs lists published posts only and `toBlogPost`
 * checks again; a changelog record needs `published: true`.
 * Without an API token (CI builds) every list is empty and every post 404s.
 */
const blogPosts = cache(async (): Promise<BlogPost[]> => {
  return toBlogPosts(await getBlogPosts()).filter((p) => p.kind === 'blog');
});

const changelogPosts = cache(async (): Promise<BlogPost[]> => {
  return toChangelogPosts(await getCollectionRecords(CHANGELOG_COLLECTION));
});

/** Published posts of one kind, newest first. */
export async function getPosts(kind: BlogKind): Promise<BlogPost[]> {
  return kind === 'changelog' ? changelogPosts() : blogPosts();
}

/** One published post by kind and slug, or null. */
export async function getPost(
  kind: BlogKind,
  slug: string
): Promise<BlogPost | null> {
  return (await getPosts(kind)).find((p) => p.slug === slug) ?? null;
}

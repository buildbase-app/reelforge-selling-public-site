import 'server-only';
import { cache } from 'react';
import { contentClient } from '@/lib/platform/content';
import { logger } from '@/lib/logger';
import {
  buildDocsNav,
  type DocsNav,
  type DocsPageInput,
  type DocsTreeNode,
} from './nav';

/**
 * Reads BuildBase Docs for /docs, the Markdown twins, the sitemap and
 * llms(-full).txt. Server-only: the org API token never reaches a browser.
 *
 * Reads go through the SDK client of src/lib/platform/content.ts, which caches
 * them in Next's data cache under the SDK's `buildbase:doc*` tags; a `doc.*`
 * content webhook revalidates those tags (and the /docs paths, see
 * src/lib/cache/webhook-tags.ts), so a page published in the console shows up
 * without a deploy. Without a token, or when BuildBase is unreachable, the
 * readers return an empty site / null instead of failing the page.
 */

export interface DocsSite {
  nav: DocsNav;
  /** Every published page with its body (llms-full.txt, twins). */
  docs: DocsPageInput[];
}

const EMPTY: DocsSite = {
  nav: { sections: [], rootPages: [], pages: [] },
  docs: [],
};

export const getDocsSite = cache(async (): Promise<DocsSite> => {
  const c = contentClient();
  if (!c) return EMPTY;
  try {
    const [tree, docs] = await Promise.all([c.docs.tree(), listAll(c)]);
    return {
      nav: buildDocsNav(tree as unknown as DocsTreeNode[], docs),
      docs,
    };
  } catch (error) {
    logger.debug('Docs: BuildBase Docs unavailable', {
      error: error instanceof Error ? error.message : String(error),
    });
    return EMPTY;
  }
});

async function listAll(
  c: NonNullable<ReturnType<typeof contentClient>>
): Promise<DocsPageInput[]> {
  const out: DocsPageInput[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await c.docs.list({ limit: 100, page });
    out.push(...(res.docs as unknown as DocsPageInput[]));
    if (!res.hasNextPage) break;
  }
  return out;
}

export interface DocPage extends DocsPageInput {
  content: string;
  seo?: { title?: string; description?: string; keywords?: string[] };
}

/** One published page by its path (`folder/slug`), or null. */
export const getDocPage = cache(
  async (path: string): Promise<DocPage | null> => {
    const c = contentClient();
    if (!c) return null;
    try {
      const page = (await c.docs.byPath(path)) as unknown as DocPage | null;
      return page && page.published !== false ? page : null;
    } catch (error) {
      logger.debug('Docs: page unavailable', {
        path,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
);

/**
 * A page and the site around it, or null when either says it is not
 * published. The list read is the arbiter: Next's data cache keeps serving
 * the last good answer of a by-path read after the page is unpublished or
 * deleted (the 404 that replaces it is not cached), while the list and tree
 * are refreshed by the same `doc.*` webhook. So a page missing from the
 * navigation answers 404 even if the stale by-path copy still exists.
 */
export async function getPublishedDoc(
  path: string
): Promise<{ page: DocPage; site: DocsSite } | null> {
  const [page, site] = await Promise.all([getDocPage(path), getDocsSite()]);
  if (!page) return null;
  if (site.nav.pages.length && !site.nav.pages.some((p) => p.path === path)) {
    return null;
  }
  return { page, site };
}

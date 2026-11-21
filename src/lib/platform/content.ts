import 'server-only';
import { createServerClient } from '@buildbase/sdk/server';
import { withNextCache } from '@buildbase/sdk/server/next';
import { logger } from '@/lib/logger';

/**
 * Editorial content written in the console and read here: a rich-text
 * block, a FAQ collection, docs, testimonials. Every reader returns null
 * (or an empty list) when the org lacks the object or the token is missing,
 * so the page renders what exists instead of failing on what does not.
 */

export const CONTENT_SLUGS = {
  richText: 'refund-policy',
  docsFolder: 'getting-started',
} as const;

/**
 * FAQ collections (console: Content, FAQs). Each page reads its own; when a
 * collection is missing or empty the page shows its local defaults
 * (`src/lib/platform/faqs.ts`).
 */
export const FAQ_COLLECTIONS = {
  store: 'store-faq',
  home: 'home-faq',
  pricing: 'pricing-faq',
  agents: 'agents-faq',
} as const;
export type FaqCollectionKey = keyof typeof FAQ_COLLECTIONS;

/**
 * Content blocks (console: Content, Content blocks), each with a local
 * fallback (`src/lib/platform/blocks.ts`).
 */
export const CONTENT_BLOCKS = {
  announcementBar: 'announcement-bar',
  launchPriceNote: 'launch-price-note',
  remotionNotice: 'remotion-notice',
} as const;

/**
 * How long a cached BuildBase read (and the ISR page built from it) is kept
 * before it is checked again. The content webhook revalidates the exact tags
 * an edit names long before that, so this is only the safety net. Kept long
 * because every refresh is a write to the cache database.
 */
export const CONTENT_REVALIDATE_SECONDS = 3600;

export interface RichContent {
  _id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt?: string;
}

export interface Faq {
  _id: string;
  question: string;
  answer: string;
}

export interface DocPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  folder?: { _id: string; name: string; slug: string } | string | null;
  published: boolean;
  updatedAt?: string;
}

export interface DocFolder {
  _id: string;
  name: string;
  slug: string;
  path?: string;
  subfolders?: DocFolder[];
}

export interface Testimonial {
  _id: string;
  name: string;
  position: string;
  content: string;
  avatar?: string;
  company?: { name?: string; url?: string } | string;
}

/**
 * The SDK's server content client: authenticates with the org API token, so
 * it only runs here. Reads go through Next's data cache under the SDK's
 * `buildbase:*` tags, and the webhook routes (`/api/webhooks/buildbase`,
 * `/api/webhooks/content`) revalidate exactly the tags an edit names, so a
 * change in the console shows up on the next request instead of after the
 * TTL. Lists return published items only.
 */
const content = process.env.BUILDBASE_API_TOKEN
  ? createServerClient({
      serverUrl: process.env.NEXT_PUBLIC_BUILDBASE_SERVER_URL!,
      apiToken: process.env.BUILDBASE_API_TOKEN,
      // Names this template in the `X-BuildBase-Client` header (beside the
      // SDK version and runtime); it carries no user or org data.
      source: 'reelforge-store',
      ...withNextCache({ revalidate: CONTENT_REVALIDATE_SECONDS }),
    })
  : null;

async function safely<T>(
  what: string,
  fn: (client: NonNullable<typeof content>) => Promise<T>
): Promise<T | null> {
  if (!content) return null;
  try {
    return await fn(content);
  } catch (error) {
    logger.debug(`Content: ${what} unavailable`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export function getRichContent(slug: string = CONTENT_SLUGS.richText) {
  return safely(
    'rich content',
    async (c) => (await c.richContent.get(slug)) as RichContent | null
  );
}

/**
 * The content client itself (null without a token), for readers that live
 * elsewhere (the /docs pages, src/lib/docs/source.ts). Same cache and tags.
 */
export function contentClient() {
  return content;
}

/** True when the server can read console content (an org API token is set). */
export function hasContentApi(): boolean {
  return content !== null;
}

export async function getFaqs(collectionSlug: string) {
  return (
    (await safely(
      'faqs',
      async (c) => (await c.faqs.questions(collectionSlug)) as unknown as Faq[]
    )) ?? []
  );
}

export async function getDocs() {
  return (
    (await safely('docs', async (c) => {
      const [folders, posts] = await Promise.all([
        c.docs.tree(),
        c.docs.list({ limit: 100, sort: { title: 1 } }),
      ]);
      return {
        folders: folders as unknown as DocFolder[],
        posts: posts.docs as unknown as DocPost[],
      };
    })) ?? { folders: [], posts: [] }
  );
}

export async function getTestimonials() {
  return (
    (await safely(
      'testimonials',
      async (c) =>
        (await c.testimonials.list({ limit: 100 }))
          .docs as unknown as Testimonial[]
    )) ?? []
  );
}

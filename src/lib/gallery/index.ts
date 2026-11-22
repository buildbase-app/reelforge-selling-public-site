import 'server-only';
import { logger } from '@/lib/logger';
import { getCollectionRecords, hasContentApi } from '@/lib/platform/content';
import {
  DEFAULT_MEDIA_URL,
  isReelSlug,
  toReels,
  type GalleryRecordData,
  type GalleryReel,
} from './model';

export * from './model';

/** The BuildBase Collection the gallery reads (studio: `pnpm gallery publish`). */
export const GALLERY_COLLECTION = 'gallery';

/** Media origin for posters, videos and manifests (R2 custom domain by default). */
export function galleryMediaBase(): string {
  return process.env.GALLERY_MEDIA_URL || DEFAULT_MEDIA_URL;
}

let warnedMissingConfig = false;

/**
 * Every published reel, server-side, through the SDK's cached collection read
 * (`content.collections.data('gallery')`). Empty when the org API token is
 * missing, the collection does not exist yet or its records cannot be read:
 * a gallery that is not set up yet is a warning (once per isolate), never a
 * server error, so pages show their empty state and reel pages their 404.
 * `GALLERY_INCLUDE_HIDDEN=1` also returns hidden records: for a local
 * preview against media that is not live yet, never set in production.
 */
export async function getGallery(): Promise<GalleryReel[]> {
  if (!hasContentApi()) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      logger.warn(
        'Gallery: BUILDBASE_API_TOKEN is not set, so the gallery is empty'
      );
    }
    return [];
  }
  try {
    const records =
      await getCollectionRecords<GalleryRecordData>(GALLERY_COLLECTION);
    return toReels(records, {
      base: galleryMediaBase(),
      includeHidden: process.env.GALLERY_INCLUDE_HIDDEN === '1',
    });
  } catch (error) {
    logger.warn('Gallery: the collection could not be read', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/** One reel by slug, or null (then the page calls `notFound()`). */
export async function getGalleryReel(
  slug: string
): Promise<GalleryReel | null> {
  if (!isReelSlug(slug)) return null;
  return (await getGallery()).find((r) => r.slug === slug) ?? null;
}

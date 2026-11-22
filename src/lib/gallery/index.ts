import 'server-only';
import { getCollectionRecords } from '@/lib/platform/content';
import {
  DEFAULT_MEDIA_URL,
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

/**
 * Every published reel, server-side, through the SDK's cached collection read
 * (`content.collections.data('gallery')`). Empty when the org API token is
 * missing or the collection does not exist yet. `GALLERY_INCLUDE_HIDDEN=1`
 * also returns hidden records: for a local preview against media that is not
 * live yet, never set in production.
 */
export async function getGallery(): Promise<GalleryReel[]> {
  const records =
    await getCollectionRecords<GalleryRecordData>(GALLERY_COLLECTION);
  return toReels(records, {
    base: galleryMediaBase(),
    includeHidden: process.env.GALLERY_INCLUDE_HIDDEN === '1',
  });
}

export async function getGalleryReel(
  slug: string
): Promise<GalleryReel | null> {
  return (await getGallery()).find((r) => r.slug === slug) ?? null;
}

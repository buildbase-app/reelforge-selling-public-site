import 'server-only';
import { CONTENT_BLOCKS, getRichContent } from '@/lib/platform/content';
import { renderMarkdown, type RenderedMarkdown } from '@/lib/platform/markdown';
import { logger } from '@/lib/logger';
import {
  LAUNCH_PRICE_ENDS_LABEL,
  LAUNCH_PRICE_FALLBACK_NOTE,
  isLaunchPriceActive,
  statesLaunchEnd,
} from '@/lib/store/launch';

/**
 * Content blocks edited in the console (Content, Content blocks), rendered
 * from Markdown with the shared sanitiser. Each block has a local fallback:
 * the text the site showed before the block existed, or nothing where the
 * site showed nothing.
 */

export type BlockKey = keyof typeof CONTENT_BLOCKS;

export interface BlockData extends RenderedMarkdown {
  slug: string;
  source: 'buildbase' | 'default';
}

/** Markdown fallbacks; `null` means "show nothing" until the block exists. */
export const DEFAULT_BLOCKS: Record<BlockKey, string | null> = {
  // There was no announcement bar before; it appears once the block exists.
  announcementBar: null,
  // Read through getLaunchPriceNote only: it has the dated built-in note
  // (src/lib/store/launch.ts) and stops at the launch price's end date.
  launchPriceNote: null,
  remotionNotice:
    'ReelForge includes Remotion-based templates. Remotion is free for individuals and companies of up to 3 people; larger companies need their own Remotion licence ([remotion.dev/license](https://www.remotion.dev/license)). Remotion is not covered by either ReelForge licence. ReelForge also includes Motion Canvas, HTML and HyperFrames engines.',
};

/** A block from BuildBase, or its fallback, or null when there is neither. */
export async function getBlock(key: BlockKey): Promise<BlockData | null> {
  const slug = CONTENT_BLOCKS[key];
  const remote = await getRichContent(slug);
  if (remote?.content?.trim()) {
    const rendered = renderMarkdown(remote.content);
    if (rendered.html) return { slug, source: 'buildbase', ...rendered };
  }
  const fallback = DEFAULT_BLOCKS[key];
  if (!fallback) return null;
  return { slug, source: 'default', ...renderMarkdown(fallback) };
}

/**
 * The note beside the launch prices. Until the launch price ends it is the
 * `launch-price-note` block when that block can be read and states the end
 * date, and the built-in note with the end date otherwise (no token, a
 * failed read, a missing or edited block), so a launch price is never shown
 * without its end date (studio issue #260). After the end date: null.
 */
export async function getLaunchPriceNote(
  now: Date = new Date()
): Promise<BlockData | null> {
  if (!isLaunchPriceActive(now)) return null;
  const block = await getBlock('launchPriceNote');
  if (block?.source === 'buildbase' && statesLaunchEnd(block.text)) {
    return block;
  }
  logger.error(
    'Launch price note: content block unusable, built-in note shown',
    {
      slug: CONTENT_BLOCKS.launchPriceNote,
      reason:
        block?.source === 'buildbase'
          ? `block does not state "${LAUNCH_PRICE_ENDS_LABEL}"`
          : 'block missing or unreadable',
    }
  );
  return {
    slug: CONTENT_BLOCKS.launchPriceNote,
    source: 'default',
    ...renderMarkdown(LAUNCH_PRICE_FALLBACK_NOTE),
  };
}

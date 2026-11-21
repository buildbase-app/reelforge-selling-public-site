import 'server-only';
import { CONTENT_BLOCKS, getRichContent } from '@/lib/platform/content';
import { renderMarkdown, type RenderedMarkdown } from '@/lib/platform/markdown';

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
  // There was no launch-price note before; it appears once the block exists.
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

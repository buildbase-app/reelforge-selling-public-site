import 'server-only';
import {
  renderRichText,
  type RenderedRichText,
  type RichTextHeading,
} from '@/lib/content/rich-text';

/**
 * Docs pages: the shared long-form renderer (src/lib/content/rich-text.ts,
 * sanitised, highlighted, with heading links and callouts) plus a Copy
 * button per code block, wired by `<CopyCodeButtons>` (client).
 */

export { CODE_THEMES } from '@/lib/content/rich-text';
export type DocHeading = RichTextHeading;
export type RenderedDoc = RenderedRichText;

export function renderDocMarkdown(
  markdown: string | null | undefined
): Promise<RenderedDoc> {
  return renderRichText(markdown, { copyButtons: true });
}

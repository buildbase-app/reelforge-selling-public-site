import { getBlock } from '@/lib/platform/blocks';
import { MarkdownHtml } from '@/components/content/markdown-html';

/**
 * A one-line notice above the home page hero, from the console content
 * block `announcement-bar`. Shows nothing until that block exists.
 */
export async function AnnouncementBar() {
  const block = await getBlock('announcementBar');
  if (!block) return null;
  return (
    <div
      role="status"
      className="bg-muted/60 text-foreground w-full border-b px-6 py-2 text-center text-sm"
    >
      <MarkdownHtml html={block.html} className="mx-auto max-w-4xl" />
    </div>
  );
}

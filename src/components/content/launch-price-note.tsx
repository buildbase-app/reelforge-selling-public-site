import { cn } from '@/lib/utils';
import { getLaunchPriceNote } from '@/lib/platform/blocks';
import { MarkdownHtml } from '@/components/content/markdown-html';

/**
 * How long the launch price lasts, beside the prices: the console content
 * block `launch-price-note`, or the built-in note with the end date when the
 * block can't be used (src/lib/store/launch.ts). Nothing after the end date.
 */
export async function LaunchPriceNote({ className }: { className?: string }) {
  const block = await getLaunchPriceNote();
  if (!block) return null;
  return (
    <div
      role="note"
      className={cn(
        'text-muted-foreground mx-auto max-w-3xl text-center text-sm',
        className
      )}
    >
      <MarkdownHtml html={block.html} />
    </div>
  );
}

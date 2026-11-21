import { cn } from '@/lib/utils';
import { getBlock } from '@/lib/platform/blocks';
import { MarkdownHtml } from '@/components/content/markdown-html';

/**
 * A note beside the prices (for example how long a launch price lasts),
 * from the console content block `launch-price-note`. Shows nothing until
 * that block exists, so no launch claim is ever made from this repo.
 */
export async function LaunchPriceNote({ className }: { className?: string }) {
  const block = await getBlock('launchPriceNote');
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

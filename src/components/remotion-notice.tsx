import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlock } from '@/lib/platform/blocks';
import { MarkdownHtml } from '@/components/content/markdown-html';

/**
 * The Remotion licensing notice, shown next to Buy. Remotion licenses its
 * software per company size; buyers over 3 people need their own licence,
 * which this store does not sell. The text is the console content block
 * `remotion-notice`, or the built-in text when that block does not exist.
 * Its text keeps to the prose measure and the box fits it (studio #284).
 */
export async function RemotionNotice({ className }: { className?: string }) {
  const block = await getBlock('remotionNotice');
  if (!block) return null;
  return (
    <div
      role="note"
      className={cn(
        'bg-muted/50 text-muted-foreground flex w-fit gap-3 rounded-lg border p-4 text-sm leading-relaxed',
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <MarkdownHtml html={block.html} className="max-w-measure" />
    </div>
  );
}

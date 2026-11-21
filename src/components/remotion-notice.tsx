import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The Remotion licensing notice, shown next to Buy and in the FAQ. Remotion
 * licenses its software per company size; buyers over 3 people need their
 * own licence, which this store does not sell.
 */
export function RemotionNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        'bg-muted/50 text-muted-foreground flex gap-3 rounded-lg border p-4 text-sm leading-relaxed',
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        ReelForge includes Remotion-based templates. Remotion is free for
        individuals and companies of up to 3 people; larger companies need their
        own Remotion licence (
        <a
          href="https://www.remotion.dev/license"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-2"
        >
          remotion.dev/license
        </a>
        ). ReelForge also includes Motion Canvas, HTML and HyperFrames engines.
      </p>
    </div>
  );
}

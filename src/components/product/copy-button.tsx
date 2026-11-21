'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Copies `text` and says "Copied" for two seconds (announced politely).
 * `goal` and `goalProps` become `data-bb-goal` attributes, which BuildBase
 * tracking counts on click (no tracking code imported here).
 */
export function CopyButton({
  text,
  label = 'Copy',
  ariaLabel,
  goal,
  goalProps = {},
  className,
}: {
  text: string;
  label?: string;
  /** Accessible name when the visible label is too short to say what is copied. */
  ariaLabel?: string;
  goal?: string;
  goalProps?: Record<string, string>;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const goalAttrs = goal
    ? Object.fromEntries([
        ['data-bb-goal', goal],
        ...Object.entries(goalProps).map(([k, v]) => [`data-bb-goal-${k}`, v]),
      ])
    : {};

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={ariaLabel}
      {...goalAttrs}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border border-white/15 px-3 text-xs font-medium text-white/90 transition-colors hover:bg-white/10',
        className
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
}

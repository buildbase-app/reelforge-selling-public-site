'use client';

import { useState } from 'react';
import { Check, Copy } from '@/components/icons/lite';

/**
 * Copies `text` and says "Copied" for two seconds (announced politely).
 * It takes its text colour from where it sits (the stage or the page), with
 * a hairline in the same colour.
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
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border border-current/20 px-3 text-xs font-medium transition-colors hover:bg-current/10 ${className ?? ''}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
}

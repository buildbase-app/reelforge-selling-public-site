'use client';

import { useState, useCallback } from 'react';
import { Check, Copy } from '@/components/icons/lite';
import { FacebookIcon, LinkedInIcon, XIcon } from '@/components/icons/brand';

export interface ShareLabels {
  share: string;
  x: string;
  linkedin: string;
  facebook: string;
  copy: string;
  copied: string;
}

interface ShareButtonsProps {
  url: string;
  title: string;
  /** Translated on the server: the public pages have no intl provider. */
  labels: ShareLabels;
}

export function ShareButtons({ url, title, labels }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-sm">{labels.share}</span>
      <div className="flex items-center gap-1">
        <a
          href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
          aria-label={labels.x}
        >
          <XIcon className="size-4" />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
          aria-label={labels.linkedin}
        >
          <LinkedInIcon className="size-4" />
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
          aria-label={labels.facebook}
        >
          <FacebookIcon className="size-4" />
        </a>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
          aria-label={copied ? labels.copied : labels.copy}
        >
          {copied ? (
            <Check className="text-success size-4" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

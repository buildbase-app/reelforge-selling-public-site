'use client';

import { useEffect } from 'react';

/**
 * Wires the Copy buttons that src/lib/docs/markdown.ts puts on every code
 * block of the docs page with this id. One delegated listener; the HTML stays
 * server-rendered and works (minus copying) without JavaScript.
 */
export function CopyCodeButtons({ containerId }: { containerId: string }) {
  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;
    const onClick = async (event: MouseEvent) => {
      const button = (
        event.target as HTMLElement | null
      )?.closest<HTMLButtonElement>('button[data-copy-code]');
      if (!button || !root.contains(button)) return;
      const code = button.parentElement?.querySelector('pre code, pre');
      const text = code?.textContent ?? '';
      try {
        await navigator.clipboard.writeText(text.replace(/\n$/, ''));
        button.textContent = 'Copied';
        button.setAttribute('data-copied', '');
      } catch {
        // No clipboard permission: select the code so the reader can copy it.
        if (code) {
          const range = document.createRange();
          range.selectNodeContents(code);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        }
        button.textContent = 'Selected';
      }
      window.setTimeout(() => {
        button.textContent = 'Copy';
        button.removeAttribute('data-copied');
      }, 2000);
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [containerId]);
  return null;
}

'use client';

import { buttonClass } from '@/components/ui/button-classes';

/**
 * Goes back one step in the browser's history. `Button`'s markup (outline)
 * with its classes from `buttonClass`; the server renders the icon and the
 * words (`children`), so the 404 page's first load carries no button
 * tooling or icon library (studio issue #79).
 */
export function BackButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      data-slot="button"
      data-variant="outline"
      data-size="default"
      className={buttonClass('outline')}
      onClick={() => window.history.back()}
    >
      {children}
    </button>
  );
}

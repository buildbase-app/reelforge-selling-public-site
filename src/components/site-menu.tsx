'use client';

import { useRef } from 'react';
import { buttonClass } from '@/components/ui/button-classes';

/**
 * The header's menu below `lg` (studio issue #215): a native popover, so
 * the browser opens it, closes it on Escape or a press outside, and puts
 * its links next in the tab order. The only script is the click handler
 * that closes it when a link inside is followed: the header stays mounted
 * across client-side navigation, so the menu would otherwise stay open.
 * `icon` and `children` come from the server.
 */
export function SiteMenu({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  return (
    <>
      <button
        type="button"
        popoverTarget="site-menu"
        aria-label={label}
        className={`${buttonClass('ghost', 'icon')} lg:hidden`}
      >
        {icon}
      </button>
      <div
        id="site-menu"
        ref={panel}
        popover="auto"
        aria-label={label}
        className="bg-background text-foreground top-(--header-h) right-0 bottom-auto left-0 m-0 h-auto w-full max-w-none border-0 border-b p-0 shadow-sm lg:hidden"
        onClick={(event) => {
          if ((event.target as Element).closest('a'))
            panel.current?.hidePopover();
        }}
      >
        {children}
      </div>
    </>
  );
}

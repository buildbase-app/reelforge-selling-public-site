'use client';

import { lazy, Suspense, useState } from 'react';
import { Moon, Sun } from '@/components/icons/lite';
import { buttonClass } from '@/components/ui/button-classes';

/** The translated words of the theme menu, from the server. */
export interface ThemeToggleLabels {
  toggle: string;
  light: string;
  dark: string;
  system: string;
}

/**
 * The sun/moon icon button: the menu's trigger, and its stand-in until the
 * menu loads. `Button`'s markup (outline, icon) with its classes from
 * `buttonClass`, so the public pages' first load carries no button tooling
 * or icon library (studio issue #79).
 */
export function ThemeToggleButton({
  label,
  ...props
}: React.ComponentProps<'button'> & { label: string }) {
  return (
    <button
      data-slot="button"
      data-variant="outline"
      data-size="icon"
      className={buttonClass('outline', 'icon')}
      {...props}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-[transform,opacity] duration-200 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-[transform,opacity] duration-200 dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

const loadMenu = () => import('./theme-toggle-menu');
const ThemeToggleMenu = lazy(loadMenu);

/**
 * The light / dark / system menu. Radix's dropdown (about 30 KB gzip) loads
 * on hover, focus or the first press instead of with the page (studio issue
 * #79); the press that loads it also opens it. Until then this renders the
 * same button. `labels` are translated on the server.
 */
export function ThemeToggle({ labels }: { labels: ThemeToggleLabels }) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <Suspense
        fallback={<ThemeToggleButton label={labels.toggle} aria-busy />}
      >
        <ThemeToggleMenu defaultOpen labels={labels} />
      </Suspense>
    );
  }

  const open = () => setActive(true);
  return (
    <ThemeToggleButton
      label={labels.toggle}
      aria-haspopup="menu"
      aria-expanded={false}
      data-slot="dropdown-menu-trigger"
      data-state="closed"
      onPointerEnter={() => void loadMenu()}
      onFocus={() => void loadMenu()}
      onPointerDown={(event) => {
        if (event.button === 0 && !event.ctrlKey) {
          event.preventDefault();
          open();
        }
      }}
      onKeyDown={(event) => {
        if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
          event.preventDefault();
          open();
        }
      }}
    />
  );
}

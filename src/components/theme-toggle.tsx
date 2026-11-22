'use client';

import { forwardRef, lazy, Suspense, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** The sun/moon icon button: the menu's trigger, and its stand-in until the menu loads. */
export const ThemeToggleButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { label: string }
>(function ThemeToggleButton({ label, ...props }, ref) {
  return (
    <Button ref={ref} variant="outline" size="icon" {...props}>
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-[transform,opacity] duration-200 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-[transform,opacity] duration-200 dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{label}</span>
    </Button>
  );
});

const loadMenu = () => import('./theme-toggle-menu');
const ThemeToggleMenu = lazy(loadMenu);

/**
 * The light / dark / system menu. Radix's dropdown (about 30 KB gzip) loads
 * on hover, focus or the first press instead of with the page (studio issue
 * #79); the press that loads it also opens it. Until then this renders the
 * same button. `label` is the translated "Toggle theme".
 */
export function ThemeToggle({ label }: { label: string }) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <Suspense fallback={<ThemeToggleButton label={label} aria-busy />}>
        <ThemeToggleMenu defaultOpen />
      </Suspense>
    );
  }

  const open = () => setActive(true);
  return (
    <ThemeToggleButton
      label={label}
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

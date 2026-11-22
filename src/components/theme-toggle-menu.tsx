'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { ThemeToggleButton, type ThemeToggleLabels } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * The theme menu (Radix). Loaded by `ThemeToggle` on the first press, so
 * Radix's dropdown stays out of the public pages' first load (studio issue
 * #79); `defaultOpen` opens it on that same press. The words come from
 * the server: the public pages have no intl provider.
 */
export default function ThemeToggleMenu({
  defaultOpen = false,
  labels,
}: {
  defaultOpen?: boolean;
  labels: ThemeToggleLabels;
}) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <ThemeToggleButton label={labels.toggle} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          {labels.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          {labels.dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          {labels.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

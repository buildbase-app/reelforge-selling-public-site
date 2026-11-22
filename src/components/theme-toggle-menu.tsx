'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

import { ThemeToggleButton } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * The theme menu (Radix). Loaded by `ThemeToggle` on the first press, so
 * Radix's dropdown stays out of the public pages' first load (studio issue
 * #79); `defaultOpen` opens it on that same press.
 */
export default function ThemeToggleMenu({
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
}) {
  const { setTheme } = useTheme();
  const t = useTranslations('common.theme');

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <ThemeToggleButton label={t('toggle')} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          {t('light')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          {t('dark')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          {t('system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

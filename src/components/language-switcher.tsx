'use client';

import dynamic from 'next/dynamic';
import { locales } from '@/i18n/config';

const LanguageSwitcherMenu = dynamic(() => import('./language-switcher-menu'), {
  ssr: false,
});

/**
 * The language menu, or nothing while only one language is served. The
 * menu (Radix) loads only when it can be shown, so it is not in the public
 * pages' first load (studio issue #79).
 */
export function LanguageSwitcher() {
  if (locales.length < 2) return null;
  return <LanguageSwitcherMenu />;
}

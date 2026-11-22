'use client';

import { clientOnly } from '@/components/client-only';
import { locales } from '@/i18n/config';

// Inlined at build time: the menu renders in the browser only, so the
// server bundle drops this import instead of tracing it.
const LanguageSwitcherMenu = clientOnly(() =>
  typeof window === 'undefined'
    ? new Promise<never>(() => {})
    : import('./language-switcher-menu')
);

/**
 * The language menu, or nothing while only one language is served. The
 * menu (Radix) loads only when it can be shown, so it is not in the public
 * pages' first load (studio issue #79). `label` ("Select language") is
 * translated on the server.
 */
export function LanguageSwitcher({ label }: { label: string }) {
  if (locales.length < 2) return null;
  return <LanguageSwitcherMenu label={label} />;
}

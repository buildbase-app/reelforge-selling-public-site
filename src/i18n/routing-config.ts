import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

/**
 * The routing config alone, for the request config (./request.ts) and the
 * proxy. Kept apart from `createNavigation` (./routing.ts): every server
 * render imports the request config, and importing the navigation helpers
 * there would put next-intl's client `Link`, and the message formatter it
 * needs, into every page's first load (studio issue #79).
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only show locale prefix for non-default locales
  localeDetection: false, // Locale is URL-only; no cookie/Accept-Language auto-redirect
});

import { defaultLocale } from './config';

/**
 * The path of `href` in `locale`, as next-intl's `getPathname` builds it for
 * this site's routing (`localePrefix: 'as-needed'`, no localized pathnames,
 * see ./routing-config.ts): the default locale has no prefix, every other locale
 * is prefixed. External URLs, hashes and relative paths pass through.
 *
 * A plain function with no next-intl import, so client code on the public
 * pages can localize links without the intl provider (studio issue #79).
 */
export function localizePath(href: string, locale?: string): string {
  if (!locale || locale === defaultLocale || !href.startsWith('/')) {
    return href;
  }
  if (href.startsWith('//')) return href;
  const rest = href === '/' ? '' : href;
  return /^\/[?#]/.test(rest)
    ? `/${locale}${rest.slice(1)}`
    : `/${locale}${rest}`;
}

/** `pathname` without its locale prefix (the inverse of `localizePath`). */
export function stripLocale(pathname: string, locale?: string): string {
  if (!locale || locale === defaultLocale) return pathname;
  if (pathname === `/${locale}`) return '/';
  return pathname.startsWith(`/${locale}/`)
    ? pathname.slice(locale.length + 1)
    : pathname;
}

import { getTranslations } from 'next-intl/server';

/**
 * Skip-to-Content Link
 *
 * Accessibility feature for keyboard and screen reader users.
 * Allows users to skip navigation and jump directly to main content.
 *
 * - Hidden by default (sr-only)
 * - Becomes visible when focused via keyboard (Tab), fixed above the
 *   sticky header (`z-60` over its `z-50`, studio #284), with the site's
 *   focus ring
 * - Links to #main-content, which takes focus (`tabIndex={-1}`)
 */
export async function SkipLink() {
  const t = await getTranslations('common');

  return (
    <a
      href="#main-content"
      className="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:border focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-sm"
    >
      {t('accessibility.skipToContent')}
    </a>
  );
}

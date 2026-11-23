import { MarketingShell } from '@/components/marketing/marketing-shell';

/**
 * The public pages that render without the BuildBase provider (studio issue
 * #79): home, agents, gallery, docs, blog, changelog, help, contact and the
 * legal pages. Their first-load JavaScript stays within the budget checked by
 * `npm run check:bundle` (scripts/check-bundle-budget.mjs), so nothing here
 * may import `@buildbase/sdk/react` statically: load it on demand instead
 * (see `@/components/auth/auth-island`). Pages that need the provider live in
 * `(store)`. The route group adds no path segment.
 *
 * There is no intl provider here either: translate on the server and pass
 * the words to client components as props, link with `@/i18n/link`, and do
 * not call next-intl's client hooks (`useTranslations`, `useLocale`, its
 * `Link`, `useRouter`) in client code these pages load: they need the
 * provider, whose message formatter alone is about 12 KB gzip.
 *
 * `headerAction` is the `@headerAction` parallel route: the home page's
 * primary action for the site header (studio issue #215), and nothing on
 * every other page.
 */
export default function MarketingLayout({
  children,
  headerAction,
}: {
  children: React.ReactNode;
  headerAction: React.ReactNode;
}) {
  return (
    <MarketingShell headerAction={headerAction}>{children}</MarketingShell>
  );
}

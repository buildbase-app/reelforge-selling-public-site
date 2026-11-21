import { MarketingShell } from '@/components/marketing/marketing-shell';

/**
 * Every public page (home, pricing, legal, blog, changelog, help, waitlist,
 * contact, order) shares the site header and footer. The route group adds
 * no path segment.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingShell>{children}</MarketingShell>;
}

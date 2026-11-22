import { Toaster } from 'sonner';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { ProviderAuthButton } from '@/components/auth/provider-auth-button';
import { CookieConsent } from '@/components/cookie-consent';

/**
 * The public pages that need the BuildBase provider (studio issue #79):
 * `/pricing` (checkout islands), `/order` (licence keys and files after
 * payment) and `/waitlist` (the beta form). Same header and footer as
 * `(marketing)`; the provider (from `(app)`) also does the tracking and the
 * cookie banner here. The route group adds no path segment.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingShell auth={<ProviderAuthButton />}>{children}</MarketingShell>
      <Toaster richColors position="bottom-right" />
      <CookieConsent />
    </>
  );
}

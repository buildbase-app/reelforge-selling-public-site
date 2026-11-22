import { Toaster } from 'sonner';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { ProviderAuthButton } from '@/components/auth/provider-auth-button';
import { CookieConsent } from '@/components/cookie-consent';
import { SaaSProvider } from '@/components/saas-provider';

/**
 * The public pages that need the BuildBase provider (studio issue #79):
 * `/pricing` (checkout islands), `/order` (licence keys and files after
 * payment) and `/waitlist` (the beta form). Same header and footer as
 * `(marketing)`; the provider also does the tracking and the cookie banner
 * here. The route group adds no path segment.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SaaSProvider>
      <MarketingShell auth={<ProviderAuthButton />}>{children}</MarketingShell>
      <Toaster richColors position="bottom-right" />
      <CookieConsent />
    </SaaSProvider>
  );
}

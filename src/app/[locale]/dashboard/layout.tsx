import { Metadata } from 'next';
import { Toaster } from 'sonner';
import { DashboardLayoutClient } from '@/components/dashboard-layout-client';
import { CookieConsent } from '@/components/cookie-consent';
import { SaaSProvider } from '@/components/saas-provider';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/** The account pages: the BuildBase provider lives here, not in the locale layout (studio issue #79). */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SaaSProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
      <Toaster richColors position="bottom-right" />
      <CookieConsent />
    </SaaSProvider>
  );
}

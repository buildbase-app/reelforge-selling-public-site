import { Metadata } from 'next';
import { Toaster } from 'sonner';
import { DashboardLayoutClient } from '@/components/dashboard-layout-client';
import { CookieConsent } from '@/components/cookie-consent';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/** The account pages. The BuildBase and intl providers come from `(app)` (studio issue #79). */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
      <Toaster richColors position="bottom-right" />
      <CookieConsent />
    </>
  );
}

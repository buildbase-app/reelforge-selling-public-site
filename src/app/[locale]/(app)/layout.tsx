import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SaaSProvider } from '@/components/saas-provider';

/**
 * The pages that run the BuildBase SDK and translate in the browser: the
 * `(store)` group (`/pricing`, `/order`, `/waitlist`) and `/dashboard`
 * (studio issue #79). The intl and BuildBase providers live here, once,
 * not in the locale layout: the public pages in `(marketing)` have neither.
 *
 * One parent for both groups also keeps one copy of the SDK's server-side
 * dependencies in the Worker: when each group mounted the providers in its
 * own layout, Turbopack emitted that 2.2 MB chunk once per group. The route
 * group adds no path segment.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <SaaSProvider>{children}</SaaSProvider>
    </NextIntlClientProvider>
  );
}

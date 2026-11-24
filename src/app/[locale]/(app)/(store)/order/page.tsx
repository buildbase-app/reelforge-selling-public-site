import { Suspense } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Loader2 } from 'lucide-react';
import { OrderView } from '@/components/store/order-view';

export const metadata: Metadata = {
  title: 'Your order',
  description: 'Your RenderWeld order, downloads and licence keys.',
  robots: { index: false, follow: false },
};

interface OrderPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Where Stripe sends a buyer after checkout (BuyButton `successUrl`), and
 * where a receipt's link points. Everything on it is read in the browser
 * for the buyer: signed in, or by the order's token for a guest.
 */
export default async function OrderPage({ params }: OrderPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <Suspense
        fallback={
          <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading your order…
          </div>
        }
      >
        <OrderView />
      </Suspense>
    </div>
  );
}

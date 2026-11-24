'use client';

import '@/lib/zod-jitless';
import { KeyRound, Loader2 } from 'lucide-react';
import { useHoldings } from '@buildbase/sdk/react';
import type { HoldingView } from '@buildbase/sdk';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { OrderHoldings } from '@/components/store/order-holdings';
import { SupportContact } from '@/components/support-contact';

/**
 * Everything the signed-in person holds from what they bought: downloads
 * (releases of RenderWeld) and licence keys, grouped by order. English only
 * for now (src/i18n/config.ts).
 */
export default function LicencesPage() {
  const { holdings, loading, error, hasNextPage } = useHoldings({ limit: 50 });

  const byOrder = new Map<string, HoldingView[]>();
  for (const h of holdings) {
    const list = byOrder.get(h.source.orderId) ?? [];
    list.push(h);
    byOrder.set(h.source.orderId, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <KeyRound className="h-7 w-7" aria-hidden /> Licences
        </h1>
        <p className="text-muted-foreground">
          Your RenderWeld downloads and licence keys.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading…
        </p>
      ) : error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : holdings.length === 0 ? (
        <div className="bg-muted/40 rounded-xl border p-6">
          <p className="font-medium">No licences yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            When you buy RenderWeld, its downloads and keys appear here.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {[...byOrder.entries()].map(([orderId, list]) => (
            <section key={orderId} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{list[0].itemTitle}</h2>
                <Link
                  href={`/order?id=${encodeURIComponent(orderId)}`}
                  className="text-muted-foreground text-sm underline"
                >
                  Order {orderId}
                </Link>
              </div>
              <OrderHoldings holdings={list} />
            </section>
          ))}
          {hasNextPage && (
            <p className="text-muted-foreground text-sm">
              Showing the 50 newest. Older purchases are on their order pages.
            </p>
          )}
        </div>
      )}

      <p className="text-muted-foreground text-sm">
        Problems with a download or key? <SupportContact />
      </p>
    </div>
  );
}

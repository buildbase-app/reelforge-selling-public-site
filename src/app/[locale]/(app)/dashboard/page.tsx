'use client';

import '@/lib/zod-jitless';
import { useTranslations } from 'next-intl';
import { KeyRound, Receipt, ShoppingBag } from 'lucide-react';
import { useHoldings, useMyOrders } from '@buildbase/sdk/react';
import {
  formatMinorAmountIntl,
  orderDisplayStatus,
  type OrderDisplayStatus,
} from '@buildbase/sdk';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/i18n/routing';

// English only for now (src/i18n/config.ts); kept together for translation.
const ORDER_STATUS: Record<OrderDisplayStatus, string> = {
  paid: 'Paid',
  partly_paid: 'Partly paid',
  checkout_open: 'Waiting for payment',
  not_completed: 'Not completed',
  refunded: 'Refunded',
  partially_refunded: 'Partly refunded',
  disputed: 'Disputed',
};

/** The account home: what the person owns and their latest orders. */
export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { holdings, loading: holdingsLoading } = useHoldings({ limit: 50 });
  const { orders, loading: ordersLoading } = useMyOrders({ limit: 5 });
  const available = holdings.filter((h) => h.state === 'available');
  const keys = available.reduce(
    (n, h) => n + (h.content?.keys?.length ?? 0),
    0
  );
  const products = new Set(available.map((h) => h.itemId)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          Your RenderWeld purchases, downloads and licence keys.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" aria-hidden /> Licences
            </CardDescription>
            <CardTitle className="text-3xl">
              {holdingsLoading ? '…' : products}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {holdingsLoading
              ? 'Loading…'
              : products === 0
                ? 'Nothing bought yet.'
                : `${keys} licence key${keys === 1 ? '' : 's'}.`}
            <div className="mt-3">
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/licences">Open licences</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Receipt className="h-4 w-4" aria-hidden /> Invoices
            </CardDescription>
            <CardTitle className="text-base font-medium">
              Receipts and invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/invoices">Open invoices</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" aria-hidden /> Store
            </CardDescription>
            <CardTitle className="text-base font-medium">
              What is on sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {orders.map((order) => (
                <li
                  key={order._id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <Link
                    href={`/order?id=${encodeURIComponent(order._id)}`}
                    className="underline"
                  >
                    {order.lines.map((l) => l.itemTitle).join(', ') ||
                      order._id}
                  </Link>
                  <span className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {formatMinorAmountIntl(order.total, order.currency, 'en')}
                    </span>
                    <Badge variant="secondary">
                      {ORDER_STATUS[orderDisplayStatus(order)]}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

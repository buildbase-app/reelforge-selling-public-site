'use client';

import '@/lib/zod-jitless';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import { useMyOrders } from '@buildbase/sdk/react';
import {
  formatMinorAmountIntl,
  orderDisplayStatus,
  type BuyerOrderView,
} from '@buildbase/sdk';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ORDER_STATUS } from './order-status';

const PAGE = 20;

const TONE: Record<'ok' | 'wait' | 'bad', string> = {
  ok: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  wait: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  bad: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

/** What an order bought, in one line: "RenderWeld Commercial: Studio". */
export function orderItems(order: BuyerOrderView): string {
  return order.lines
    .map(
      (line) =>
        `${line.itemTitle}${line.variantLabel ? `: ${line.variantLabel}` : ''}${
          line.quantity > 1 ? ` × ${line.quantity}` : ''
        }`
    )
    .join(', ');
}

/**
 * The signed-in buyer's orders (studio issue #258): one-time purchases and
 * free claims, newest first, each with its date, what it bought, its total
 * and a link to its receipt, the order page (`/order?id=`). A checkout left
 * without paying (`not_completed`, nothing charged) is not listed.
 */
export function OrderList() {
  const t = useTranslations('invoices.orders');
  const [limit, setLimit] = useState(PAGE);
  const { orders, hasNextPage, loading, error } = useMyOrders({ limit });
  const shown = orders.filter((o) => orderDisplayStatus(o) !== 'not_completed');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
        <div>
          <CardTitle className="text-base">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-red-700 dark:text-red-300">{t('error')}</p>
        ) : loading && orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('loading')}</p>
        ) : shown.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            <p>{t('empty')}</p>
            <Button size="sm" className="mt-3" asChild>
              <Link href="/pricing">{t('pricing')}</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="hidden pb-2 text-left font-medium sm:table-cell">
                    {t('table.date')}
                  </th>
                  <th className="pb-2 text-left font-medium">
                    {t('table.item')}
                  </th>
                  <th className="pb-2 text-left font-medium">
                    {t('table.total')}
                  </th>
                  <th className="pb-2 text-left font-medium">
                    {t('table.status')}
                  </th>
                  <th className="pb-2 text-right font-medium">
                    <span className="sr-only">{t('table.receipt')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shown.map((order) => {
                  const status = ORDER_STATUS[orderDisplayStatus(order)];
                  const date = order.paidAt ?? order.createdAt;
                  const day = date ? new Date(date).toLocaleDateString() : '—';
                  return (
                    <tr key={order._id} data-order={order._id}>
                      <td className="hidden py-2 text-xs whitespace-nowrap sm:table-cell">
                        {day}
                      </td>
                      <td className="py-2 pr-2">
                        {orderItems(order)}
                        <span className="text-muted-foreground block text-xs sm:hidden">
                          {day}
                        </span>
                      </td>
                      <td className="py-2 font-mono text-xs">
                        {formatMinorAmountIntl(
                          order.total,
                          order.currency,
                          'en'
                        )}
                      </td>
                      <td className="py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONE[status.tone]}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/order?id=${encodeURIComponent(order._id)}`}
                          className="text-primary hover:text-primary/80 text-xs whitespace-nowrap underline-offset-2 hover:underline"
                        >
                          {t('view')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {hasNextPage && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => setLimit((n) => n + PAGE)}
                >
                  {t('loadMore')}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

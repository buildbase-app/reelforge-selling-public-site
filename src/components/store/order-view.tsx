'use client';

import '@/lib/zod-jitless';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, Loader2, Printer, XCircle } from 'lucide-react';
import {
  useHoldings,
  useMyOrder,
  useMyOrders,
  useOrderByToken,
  useSaaSAuth,
} from '@buildbase/sdk/react';
import {
  formatMinorAmountIntl,
  orderDisplayStatus,
  type BuyerOrderView,
  type HoldingView,
} from '@buildbase/sdk';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { SupportContact } from '@/components/support-contact';
import { OrderHoldings } from './order-holdings';
import { ReceiptAmounts, ReceiptSeller } from './receipt-amounts';
import { recallOrder } from './last-order';
import { ORDER_STATUS as STATUS } from './order-status';

/**
 * The page Stripe sends a buyer back to. A guest arrives with `?order=` and
 * `?token=` and reads the order by its token. A signed-in buyer arrives
 * with no order id: `?id=` if given, else the order this tab just started,
 * else their newest order.
 */
export function OrderView() {
  const params = useSearchParams();
  const orderId = params.get('order');
  const token = params.get('token');
  if (orderId && token) {
    return <GuestOrder link={{ orderId, token }} />;
  }
  return <SignedInOrder requestedId={params.get('id')} />;
}

function GuestOrder({ link }: { link: { orderId: string; token: string } }) {
  const { order, holdings, loading, error } = useOrderByToken(link, {
    waitForPayment: true,
  });
  return (
    <OrderLayout
      order={order}
      holdings={holdings ?? []}
      loading={loading}
      error={error}
      guestOrder={link}
    />
  );
}

function SignedInOrder({ requestedId }: { requestedId: string | null }) {
  const { isAuthenticated, status, signIn } = useSaaSAuth();
  // Rendered in the browser only (useSearchParams under Suspense), so
  // reading this tab's storage once here is safe.
  const [remembered] = useState(() => recallOrder());

  if (status === 'loading' || status === 'authenticating') {
    return <Pending />;
  }
  if (!isAuthenticated) {
    return (
      <Message title="Sign in to see your order">
        <p>Your order is in the account you bought it with.</p>
        <Button className="mt-4" onClick={() => signIn()}>
          Sign in
        </Button>
      </Message>
    );
  }
  const id = requestedId ?? remembered;
  return id ? <SignedInOrderById id={id} /> : <NewestOrder />;
}

/** No order named: the signed-in person's newest one. */
function NewestOrder() {
  const { orders, loading, error } = useMyOrders({ limit: 1 });
  if (loading) return <Pending />;
  if (orders[0]) return <SignedInOrderById id={orders[0]._id} />;
  if (error) {
    return (
      <Message title="Your orders could not be loaded">
        <p>{error}</p>
      </Message>
    );
  }
  return (
    <Message title="No orders yet">
      <p>
        When you buy RenderWeld, your order, downloads and licence keys appear
        here and under{' '}
        <Link href="/dashboard/licences" className="underline">
          Licences
        </Link>
        .
      </p>
      <Button className="mt-4" asChild>
        <Link href="/pricing">See pricing</Link>
      </Button>
    </Message>
  );
}

function SignedInOrderById({ id }: { id: string }) {
  const { order, loading, error } = useMyOrder(id, { waitForPayment: true });
  const { holdings, refetch } = useHoldings({ orderId: id });
  // Holdings are granted when the payment lands: read them again then.
  const paid = !!order?.paidAt;
  useEffect(() => {
    if (paid) void refetch();
  }, [paid, refetch]);
  return (
    <OrderLayout
      order={order}
      holdings={holdings}
      loading={loading}
      error={error}
    />
  );
}

function OrderLayout({
  order,
  holdings,
  loading,
  error,
  guestOrder,
}: {
  order: BuyerOrderView | null;
  holdings: HoldingView[];
  loading: boolean;
  error: string | null;
  guestOrder?: { orderId: string; token: string };
}) {
  if (!order) {
    if (loading) return <Pending />;
    return (
      <Message title="Order not found">
        <p>{error ?? 'This order could not be loaded.'}</p>
        <p className="mt-2">
          <SupportContact />
        </p>
      </Message>
    );
  }

  const status = STATUS[orderDisplayStatus(order)];
  const Icon =
    status.tone === 'ok'
      ? CheckCircle2
      : status.tone === 'wait'
        ? Clock
        : XCircle;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <Icon
            className={
              status.tone === 'ok'
                ? 'h-7 w-7 text-green-600'
                : status.tone === 'wait'
                  ? 'h-7 w-7 text-amber-600'
                  : 'text-destructive h-7 w-7'
            }
            aria-hidden
          />
          <h1 className="text-3xl font-medium tracking-tight">
            {status.label}
          </h1>
          {status.tone === 'wait' && (
            <Loader2
              className="text-muted-foreground h-5 w-5 animate-spin"
              aria-label="Checking"
            />
          )}
        </div>
        <p className="text-muted-foreground mt-2">{status.hint}</p>
      </div>

      <section className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Order</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">Order number</dt>
          <dd className="font-mono">{order._id}</dd>
          {order.paidAt && (
            <>
              <dt className="text-muted-foreground">Paid</dt>
              <dd>{new Date(order.paidAt).toLocaleString()}</dd>
            </>
          )}
          {buyerLabel(order) && (
            <>
              <dt className="text-muted-foreground">Bought by</dt>
              <dd>{buyerLabel(order)}</dd>
            </>
          )}
          {order.refunded > 0 && (
            <>
              <dt className="text-muted-foreground">Refunded</dt>
              <dd>
                {formatMinorAmountIntl(order.refunded, order.currency, 'en')}
              </dd>
            </>
          )}
        </dl>
        <ul className="mt-4 divide-y border-t text-sm">
          {order.lines.map((line) => (
            <li key={line.lineKey} className="flex justify-between gap-4 py-2">
              <span>
                {line.itemTitle}
                {line.variantLabel ? `: ${line.variantLabel}` : ''}
                {line.quantity > 1 ? ` × ${line.quantity}` : ''}
              </span>
              <span>
                {formatMinorAmountIntl(line.total, order.currency, 'en')}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t pt-3">
          <ReceiptAmounts order={order} />
        </div>
        {order.paidAt && (
          <div className="mt-4 border-t pt-4">
            <ReceiptSeller />
          </div>
        )}
        {order.paidAt && <Receipt signedIn={!guestOrder} />}
      </section>

      {holdings.length > 0 && (
        <section>
          {hasKey(holdings) ? (
            <>
              <h2 className="text-lg font-semibold">Your licence key</h2>
              <p className="text-muted-foreground mt-1 mb-3 text-sm">
                Thank you! Your licence key is below.
              </p>
            </>
          ) : (
            <h2 className="mb-3 text-lg font-semibold">
              Your downloads and keys
            </h2>
          )}
          <OrderHoldings holdings={holdings} guestOrder={guestOrder} />
          {hasKey(holdings) && <NextSteps />}
        </section>
      )}

      <section className="text-muted-foreground text-sm">
        <h2 className="text-foreground mb-1 font-semibold">Need help?</h2>
        <p>
          Keep your order number. <SupportContact />
        </p>
        <p className="mt-1">
          See also the{' '}
          <Link href="/licence" className="underline">
            licence
          </Link>{' '}
          and the{' '}
          <Link href="/refund" className="underline">
            refund policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

/** The order delivered a licence key the buyer can use now. */
function hasKey(holdings: HoldingView[]) {
  return holdings.some(
    (h) => h.kind === 'license_key' && h.state === 'available'
  );
}

/** The install guide's first page, in BuildBase Docs. */
const QUICK_START_HREF = '/docs/start/quick-start';

/**
 * What to do with the key (studio issue #581): three steps and the Quick
 * start. The key's own copy button is the SDK's, in `OrderHoldings`.
 */
function NextSteps() {
  return (
    <div className="bg-card mt-4 rounded-xl border p-6 text-sm">
      <h3 className="text-base font-semibold">Next steps</h3>
      <p className="text-muted-foreground mt-1">
        Next: add this key to your RenderWeld server. The{' '}
        <Link href={QUICK_START_HREF} className="underline">
          Quick start
        </Link>{' '}
        shows how.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5">
        <li>Pull the RenderWeld image.</li>
        <li>Add your licence key to the server&apos;s settings.</li>
        <li>Start RenderWeld.</li>
      </ol>
    </div>
  );
}

/** "Ada Lovelace (ada@example.com)", or whichever of the two the order has. */
function buyerLabel(order: BuyerOrderView): string | null {
  const { name, email } = order.buyer;
  if (name && email) return `${name} (${email})`;
  return name || email || null;
}

/**
 * BuildBase gives a buyer no Stripe receipt link for a one-time order (the
 * order read has none; asked upstream, studio issue #100), so this page is
 * the receipt: it prints, and the receipt email links back to it (studio
 * issue #258).
 */
function Receipt({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        This page is your receipt. Keep its link: the receipt email links back
        here.
        {signedIn && (
          <>
            {' '}
            All your orders are under{' '}
            <Link href="/dashboard/invoices" className="underline">
              Orders and receipts
            </Link>
            .
          </>
        )}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 print:hidden"
        onClick={() => window.print()}
      >
        <Printer className="h-4 w-4" aria-hidden />
        Print or save as PDF
      </Button>
    </div>
  );
}

function Pending() {
  return (
    <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      Loading your order…
    </div>
  );
}

function Message({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
      <div className="text-muted-foreground mt-3">{children}</div>
    </div>
  );
}

import { formatMinorAmountIntl, type BuyerOrderView } from '@buildbase/sdk';
import { companyAddressLine, siteConfig } from '@/config/site';

/**
 * Who sold the order and how its total is made up, on the order page that
 * serves as the receipt (studio issue #576). The seller is the company in
 * src/config/site.ts. The amounts come from the order: subtotal, any
 * discount, the tax the platform reports, and the total. A line the
 * platform doesn't report (an older platform with no `tax`) is left out
 * rather than shown as zero.
 */
export function ReceiptSeller() {
  return (
    <div className="text-sm" data-testid="receipt-seller">
      <p className="text-muted-foreground">Sold by</p>
      <p className="font-medium">{siteConfig.company.legalName}</p>
      <p className="text-muted-foreground">{companyAddressLine}</p>
    </div>
  );
}

export function ReceiptAmounts({ order }: { order: BuyerOrderView }) {
  const money = (minor: number) =>
    formatMinorAmountIntl(minor, order.currency, 'en');
  const rows: { label: string; value: string }[] = [
    { label: 'Subtotal', value: money(order.subtotal) },
  ];
  if (order.discount && order.discount > 0) {
    const code = order.coupon?.code;
    rows.push({
      label: code ? `Discount (${code})` : 'Discount',
      value: `−${money(order.discount)}`,
    });
  }
  if (typeof order.tax === 'number') {
    rows.push({ label: 'Tax', value: money(order.tax) });
  }
  rows.push({ label: 'Total', value: money(order.total) });

  return (
    <dl
      className="ml-auto grid max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm"
      data-testid="receipt-amounts"
    >
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt
            className={
              row.label === 'Total' ? 'font-medium' : 'text-muted-foreground'
            }
          >
            {row.label}
          </dt>
          <dd
            className={
              row.label === 'Total' ? 'text-right font-medium' : 'text-right'
            }
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

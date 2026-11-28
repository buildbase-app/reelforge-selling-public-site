import { formatMinorAmountIntl } from '@buildbase/sdk';
import { logger } from '@/lib/logger';

/**
 * A short message to the owner for every paid order, refund and dispute
 * (studio issue #571), sent from the BuildBase webhook to the incoming
 * webhook in `SALES_ALERT_WEBHOOK_URL` (a Slack or Discord channel's).
 *
 * It names the event, the amount, the tier and the order number, and
 * nothing about the buyer: no name, no email, no licence key.
 */

type Line = { itemTitle?: unknown; variantLabel?: unknown; quantity?: unknown };
type Order = {
  _id?: unknown;
  currency?: unknown;
  total?: unknown;
  lines?: unknown;
  dispute?: { status?: unknown; amount?: unknown; outcome?: unknown } | null;
};

const ALERTED = new Set(['order.paid', 'order.refunded', 'order.disputed']);

function money(amount: unknown, currency: unknown): string {
  return typeof amount === 'number' && typeof currency === 'string'
    ? formatMinorAmountIntl(amount, currency, 'en')
    : 'amount unknown';
}

/** "Studio" or "RenderWeld Commercial: Studio ×2", one per line, joined. */
function tiers(lines: unknown): string {
  if (!Array.isArray(lines) || lines.length === 0) return 'tier unknown';
  return (lines as Line[])
    .map((line) => {
      const title = typeof line.itemTitle === 'string' ? line.itemTitle : '';
      const label =
        typeof line.variantLabel === 'string' ? line.variantLabel : '';
      const name = [title, label].filter(Boolean).join(': ') || 'tier unknown';
      const qty =
        typeof line.quantity === 'number' && line.quantity > 1
          ? ` ×${line.quantity}`
          : '';
      return name + qty;
    })
    .join(', ');
}

/**
 * The alert for a webhook event, or null when the event needs none: any
 * event but a paid order, a refund or a dispute, and a free claim (an
 * `order.paid` with nothing paid).
 */
export function saleAlertText(
  event: string,
  data: Record<string, unknown>
): string | null {
  if (!ALERTED.has(event)) return null;
  const order = (data.order ?? null) as Order | null;
  if (!order || typeof order !== 'object') return null;
  const id = typeof order._id === 'string' ? order._id : 'unknown';
  const what = tiers(order.lines);

  if (event === 'order.paid') {
    if (typeof order.total === 'number' && order.total <= 0) return null;
    return `RenderWeld sale: ${money(order.total, order.currency)}, ${what}. Order ${id}.`;
  }
  if (event === 'order.refunded') {
    const refund = (data.refund ?? null) as { amount?: unknown } | null;
    return `RenderWeld refund: ${money(refund?.amount, order.currency)}, ${what}. Order ${id}.`;
  }
  const dispute = order.dispute ?? null;
  const state =
    typeof dispute?.outcome === 'string'
      ? `closed, ${dispute.outcome}`
      : typeof dispute?.status === 'string'
        ? dispute.status
        : 'opened';
  return `RenderWeld dispute (${state}): ${money(dispute?.amount ?? order.total, order.currency)}, ${what}. Order ${id}.`;
}

/**
 * Post the alert. Never throws and never delays the webhook's answer for
 * long: a failure is logged, and the delivery is still stored.
 */
export async function sendSaleAlert(
  text: string,
  url = process.env.SALES_ALERT_WEBHOOK_URL
): Promise<boolean> {
  if (!url) {
    logger.warn('Sale alert not sent: SALES_ALERT_WEBHOOK_URL is not set');
    return false;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // `text` for Slack, `content` for Discord.
      body: JSON.stringify({ text, content: text }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      logger.warn('Sale alert failed', { status: res.status });
      return false;
    }
    return true;
  } catch (error) {
    logger.warn('Sale alert failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

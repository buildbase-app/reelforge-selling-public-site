import type { OrderDisplayStatus } from '@buildbase/sdk';

/**
 * Where an order stands, as a buyer reads it: on /order and in the
 * dashboard's order list (`orderDisplayStatus(order)` picks the entry).
 */
// English only for now (src/i18n/config.ts); kept together for translation.
export const ORDER_STATUS: Record<
  OrderDisplayStatus,
  { label: string; hint: string; tone: 'ok' | 'wait' | 'bad' }
> = {
  paid: {
    label: 'Paid',
    hint: 'Thank you. Your downloads and licence keys are below.',
    tone: 'ok',
  },
  partly_paid: {
    label: 'Partly paid',
    hint: 'The first payment went through; the rest follows the plan you chose.',
    tone: 'ok',
  },
  checkout_open: {
    label: 'Waiting for payment',
    hint: 'This page updates by itself when the payment arrives. A bank debit can take a few business days.',
    tone: 'wait',
  },
  not_completed: {
    label: 'Not completed',
    hint: 'The checkout ended without a payment. Nothing was charged.',
    tone: 'bad',
  },
  refunded: {
    label: 'Refunded',
    hint: 'This order was refunded; its downloads and keys no longer work.',
    tone: 'bad',
  },
  partially_refunded: {
    label: 'Partly refunded',
    hint: 'Part of this order was refunded.',
    tone: 'ok',
  },
  disputed: {
    label: 'Disputed',
    hint: 'The payment is disputed with the card issuer.',
    tone: 'bad',
  },
};

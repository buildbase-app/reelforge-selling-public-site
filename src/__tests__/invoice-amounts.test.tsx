import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import en from '@/i18n/messages/en';
import { formatMinorAmount } from '@/lib/format/minor-amount';

/**
 * Invoice amounts use each currency's own decimals (studio issue #575),
 * and the invoice window says "Invoice details", not a code snippet
 * (studio issue #579).
 */

vi.mock('@buildbase/sdk/react', () => ({
  useInvoice: () => ({
    invoice: {
      number: 'INV-1',
      status: 'paid',
      currency: 'jpy',
      amount_due: 500,
      amount_paid: 500,
      created: 1764288000,
      due_date: null,
      description: null,
      hosted_invoice_url: null,
      invoice_pdf: null,
    },
    loading: false,
    error: null,
  }),
}));

import { InvoiceDetail } from '@/components/billing/invoice-detail';

describe('formatMinorAmount', () => {
  it('keeps two decimals for USD', () => {
    expect(formatMinorAmount(500, 'usd')).toBe('$5.00');
  });

  it('shows yen whole: 500 JPY is ¥500, not ¥5', () => {
    const jpy = formatMinorAmount(500, 'jpy');
    expect(jpy).toContain('500');
    expect(jpy).not.toMatch(/5\.00|\b5\b/);
  });
});

describe('InvoiceDetail', () => {
  it('describes the window in words and formats yen whole', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <InvoiceDetail workspaceId="w1" invoiceId="in_1" onClose={() => {}} />
      </NextIntlClientProvider>
    );
    expect(screen.getByText('Invoice details')).toBeTruthy();
    expect(document.body.textContent).not.toContain('useInvoice(');
    expect(screen.getAllByText(/500/).length).toBeGreaterThan(0);
  });
});

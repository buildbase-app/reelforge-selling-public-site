'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

export interface StoreCtaLabels {
  waitlist: string;
  pricing: string;
  buy: string;
  faq: string;
}

/**
 * The two main buttons: "Join the waitlist" and "See pricing" until the
 * store has something on sale, then "Buy ReelForge" and "Read the FAQ".
 * Decided from the published items the page read on the server, so it
 * changes without a deploy. When the server could not read them (`onSale`
 * undefined), it shows the first pair: both still lead to the prices.
 * No browser read and no BuildBase provider: the home page renders without
 * one (studio issue #79).
 */
export function StoreCtas({
  labels,
  onSale,
  goalSection,
}: {
  labels: StoreCtaLabels;
  onSale?: boolean;
  /**
   * Where the buttons are (`hero`, `final`): the primary button then counts
   * the `primary_cta` goal through BuildBase tracking's `data-bb-goal`.
   */
  goalSection?: string;
}) {
  return (
    <Ctas labels={labels} onSale={onSale ?? false} goalSection={goalSection} />
  );
}

function Ctas({
  labels,
  onSale,
  goalSection,
}: {
  labels: StoreCtaLabels;
  onSale: boolean;
  goalSection?: string;
}) {
  const primary = onSale
    ? { href: '/pricing', label: labels.buy }
    : { href: '/waitlist', label: labels.waitlist };
  const secondary = onSale
    ? { href: '/help', label: labels.faq }
    : { href: '/pricing', label: labels.pricing };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Button size="lg" className="gap-2 px-8" asChild>
        <Link
          href={primary.href}
          {...(goalSection && {
            'data-bb-goal': 'primary_cta',
            'data-bb-goal-section': goalSection,
            'data-bb-goal-target': onSale ? 'pricing' : 'waitlist',
          })}
        >
          {primary.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
      <Button size="lg" variant="outline" className="gap-2 px-8" asChild>
        <Link href={secondary.href}>{secondary.label}</Link>
      </Button>
    </div>
  );
}

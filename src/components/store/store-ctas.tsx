'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useStoreItems } from './use-store-items';
import { currentPrice } from './price';

export interface StoreCtaLabels {
  waitlist: string;
  pricing: string;
  buy: string;
  faq: string;
}

/**
 * The two main buttons: "Join the waitlist" and "See pricing" until the
 * store has something on sale, then "Buy ReelForge" and "Read the FAQ".
 * Decided from the published items, so it changes without a deploy:
 * `onSale` when the page read them on the server, otherwise in the browser.
 */
export function StoreCtas({
  labels,
  onSale,
}: {
  labels: StoreCtaLabels;
  onSale?: boolean;
}) {
  if (onSale === undefined) return <LiveStoreCtas labels={labels} />;
  return <Ctas labels={labels} onSale={onSale} />;
}

function LiveStoreCtas({ labels }: { labels: StoreCtaLabels }) {
  const { items } = useStoreItems();
  const onSale = items.some((item) =>
    item.variants.some((v) => currentPrice(v) !== null)
  );
  return <Ctas labels={labels} onSale={onSale} />;
}

function Ctas({ labels, onSale }: { labels: StoreCtaLabels; onSale: boolean }) {
  const primary = onSale
    ? { href: '/pricing', label: labels.buy }
    : { href: '/waitlist', label: labels.waitlist };
  const secondary = onSale
    ? { href: '/help', label: labels.faq }
    : { href: '/pricing', label: labels.pricing };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Button size="lg" className="gap-2 px-8" asChild>
        <Link href={primary.href}>
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

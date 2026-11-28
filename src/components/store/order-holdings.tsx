'use client';

import '@/lib/zod-jitless';
import { HoldingFiles, HoldingKeys } from '@buildbase/sdk/react';
import type { HoldingView } from '@buildbase/sdk';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/routing';
import { editionOfHolding, type Edition } from '@/lib/store/edition';
import { useStoreItems } from './use-store-items';

const STATE_LABEL: Record<HoldingView['state'], string> = {
  available: 'Available',
  not_yet: 'Not available yet',
  expired: 'Expired',
  revoked: 'Revoked',
};

// English only for now (src/i18n/config.ts); kept together for translation.
const EDITION_LABEL: Record<KeyEdition, string> = {
  personal: 'Personal licence',
  commercial: 'Commercial licence',
  unknown: 'Edition unknown',
};

/** A key's licence, or `unknown` when neither its item nor its id tells. */
export type KeyEdition = Edition | 'unknown';

/**
 * The edition shown above a holding: null for anything that is not a key,
 * and for a key while the store's items are still loading (so a known key
 * does not flash "unknown" first).
 */
export function keyEdition(
  holding: Pick<HoldingView, 'kind' | 'itemId'>,
  items: Parameters<typeof editionOfHolding>[1],
  loading: boolean
): KeyEdition | null {
  if (holding.kind !== 'license_key') return null;
  const edition = editionOfHolding(holding.itemId, items);
  if (edition) return edition;
  return loading ? null : 'unknown';
}

/**
 * What a purchase delivers: download links (`file`), licence keys
 * (`license_key`), and any other benefit by its title and state. A guest
 * (reading the order by its link) passes `guestOrder` and cannot give a
 * key activation back.
 *
 * Every licence key says which licence it is, Personal or Commercial, from
 * its item (`editionOfHolding`: the published item it came from, else a
 * known item id). A Personal key carries the noncommercial reminder. A key
 * whose edition neither tells says so and points to support.
 */
export function OrderHoldings({
  holdings,
  guestOrder,
}: {
  holdings: HoldingView[];
  guestOrder?: { orderId: string; token: string } | null;
}) {
  const { items, loading } = useStoreItems();
  return (
    <div className="space-y-4">
      {holdings.map((h) => (
        <HoldingBlock
          key={h._id}
          holding={h}
          guestOrder={guestOrder}
          edition={keyEdition(h, items, loading)}
        />
      ))}
    </div>
  );
}

/**
 * "Personal licence" or "Commercial licence" above a key, and the reminder;
 * or "Edition unknown" and a pointer to support.
 */
export function LicenceEdition({ edition }: { edition: KeyEdition }) {
  return (
    <div className="space-y-2" data-edition={edition}>
      <Badge
        variant={
          edition === 'personal'
            ? 'secondary'
            : edition === 'unknown'
              ? 'outline'
              : 'default'
        }
      >
        {EDITION_LABEL[edition]}
      </Badge>
      {edition === 'personal' && (
        <p
          role="note"
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200"
        >
          Noncommercial use only: upgrade for commercial use.{' '}
          <Link href="/pricing" className="font-medium underline">
            See Commercial licences
          </Link>
        </p>
      )}
      {edition === 'unknown' && (
        <p role="note" className="text-muted-foreground text-sm">
          We can&apos;t tell which licence this key is.{' '}
          <Link href="/contact" className="font-medium underline">
            Contact support
          </Link>{' '}
          and we&apos;ll check it for you.
        </p>
      )}
    </div>
  );
}

function HoldingBlock({
  holding,
  guestOrder,
  edition,
}: {
  holding: HoldingView;
  guestOrder?: { orderId: string; token: string } | null;
  edition: KeyEdition | null;
}) {
  const available = holding.state === 'available';
  if (available && holding.kind === 'file') {
    return <HoldingFiles holding={holding} guestOrder={guestOrder ?? null} />;
  }
  if (available && holding.kind === 'license_key') {
    return (
      <div className="space-y-3">
        {edition && <LicenceEdition edition={edition} />}
        <HoldingKeys holding={holding} canRemove={!guestOrder} />
      </div>
    );
  }
  const text =
    holding.content?.instructions ?? holding.content?.text ?? undefined;
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{holding.title ?? holding.itemTitle}</p>
        <Badge variant={available ? 'default' : 'secondary'}>
          {STATE_LABEL[holding.state] ?? holding.state}
        </Badge>
      </div>
      {edition && (
        <div className="mt-2">
          <LicenceEdition edition={edition} />
        </div>
      )}
      {text && (
        <p className="text-muted-foreground mt-2 text-sm whitespace-pre-line">
          {text}
        </p>
      )}
      {available && holding.content?.url && (
        <a
          href={holding.content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary mt-2 inline-block text-sm underline"
        >
          {holding.content.url}
        </a>
      )}
      {holding.availableFrom && !available && (
        <p className="text-muted-foreground mt-2 text-xs">
          From {new Date(holding.availableFrom).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

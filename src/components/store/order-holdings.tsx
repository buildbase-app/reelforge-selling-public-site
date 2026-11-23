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
const EDITION_LABEL: Record<Edition, string> = {
  personal: 'Personal licence',
  commercial: 'Commercial licence',
};

/**
 * What a purchase delivers: download links (`file`), licence keys
 * (`license_key`), and any other benefit by its title and state. A guest
 * (reading the order by its link) passes `guestOrder` and cannot give a
 * key activation back.
 *
 * Every licence key says which licence it is, Personal or Commercial, from
 * its item (`editionOfHolding`: the published item it came from, else a
 * known item id). A Personal key carries the noncommercial reminder.
 */
export function OrderHoldings({
  holdings,
  guestOrder,
}: {
  holdings: HoldingView[];
  guestOrder?: { orderId: string; token: string } | null;
}) {
  const { items } = useStoreItems();
  return (
    <div className="space-y-4">
      {holdings.map((h) => (
        <HoldingBlock
          key={h._id}
          holding={h}
          guestOrder={guestOrder}
          edition={
            h.kind === 'license_key' ? editionOfHolding(h.itemId, items) : null
          }
        />
      ))}
    </div>
  );
}

/** "Personal licence" or "Commercial licence" above a key, and the reminder. */
export function LicenceEdition({ edition }: { edition: Edition }) {
  return (
    <div className="space-y-2" data-edition={edition}>
      <Badge variant={edition === 'personal' ? 'secondary' : 'default'}>
        {EDITION_LABEL[edition]}
      </Badge>
      {edition === 'personal' && (
        <p
          role="note"
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200"
        >
          Noncommercial use only — upgrade for commercial use.{' '}
          <Link href="/pricing" className="font-medium underline">
            See Commercial licences
          </Link>
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
  edition: Edition | null;
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

'use client';

import { HoldingFiles, HoldingKeys } from '@buildbase/sdk/react';
import type { HoldingView } from '@buildbase/sdk';
import { Badge } from '@/components/ui/badge';

const STATE_LABEL: Record<HoldingView['state'], string> = {
  available: 'Available',
  not_yet: 'Not available yet',
  expired: 'Expired',
  revoked: 'Revoked',
};

/**
 * What a purchase delivers: download links (`file`), licence keys
 * (`license_key`), and any other benefit by its title and state. A guest
 * (reading the order by its link) passes `guestOrder` and cannot give a
 * key activation back.
 */
export function OrderHoldings({
  holdings,
  guestOrder,
}: {
  holdings: HoldingView[];
  guestOrder?: { orderId: string; token: string } | null;
}) {
  return (
    <div className="space-y-4">
      {holdings.map((h) => (
        <HoldingBlock key={h._id} holding={h} guestOrder={guestOrder} />
      ))}
    </div>
  );
}

function HoldingBlock({
  holding,
  guestOrder,
}: {
  holding: HoldingView;
  guestOrder?: { orderId: string; token: string } | null;
}) {
  const available = holding.state === 'available';
  if (available && holding.kind === 'file') {
    return <HoldingFiles holding={holding} guestOrder={guestOrder ?? null} />;
  }
  if (available && holding.kind === 'license_key') {
    return <HoldingKeys holding={holding} canRemove={!guestOrder} />;
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

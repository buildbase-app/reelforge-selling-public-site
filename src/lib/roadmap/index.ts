import { decodeRichText } from '@/lib/blog/changelog';

/**
 * The public roadmap on /feedback is the BuildBase collection `roadmap`
 * (console: Content, Collections, Roadmap), curated by hand:
 *
 * | Field     | Type      | Use                                          |
 * | --------- | --------- | -------------------------------------------- |
 * | `title`   | text      | what it is, in a few words                   |
 * | `summary` | rich-text | optional, one or two sentences               |
 * | `status`  | select    | `planned`, `in-progress` or `shipped`        |
 *
 * Requests sent through the feature and template forms land in their own
 * collections and are never shown here: they can hold an email address. A
 * request reaches the roadmap only when someone adds it as a record, which is
 * the moderation step. An archived record is hidden.
 */
export const ROADMAP_COLLECTION = 'roadmap';

export const ROADMAP_STATUSES = ['in-progress', 'planned', 'shipped'] as const;
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];

export const ROADMAP_STATUS_LABELS: Record<RoadmapStatus, string> = {
  'in-progress': 'In progress',
  planned: 'Planned',
  shipped: 'Shipped',
};

export interface RoadmapRecord {
  _id?: string;
  archived?: boolean;
  createdAt?: string;
  data?: Record<string, unknown> | null;
}

export interface RoadmapItem {
  id: string;
  title: string;
  summary: string;
  status: RoadmapStatus;
}

function isStatus(value: unknown): value is RoadmapStatus {
  return (ROADMAP_STATUSES as readonly unknown[]).includes(value);
}

/** Rich text as one line of plain text: tags dropped, entities decoded. */
export function plainText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return decodeRichText(value.replace(/<[^>]*>/g, ' '))
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Records to roadmap items, grouped by status in the order of
 * `ROADMAP_STATUSES`, oldest record first within a status. A record without
 * a title or a known status is left out.
 */
export function toRoadmap(
  records: readonly RoadmapRecord[]
): Record<RoadmapStatus, RoadmapItem[]> {
  const groups: Record<RoadmapStatus, RoadmapItem[]> = {
    'in-progress': [],
    planned: [],
    shipped: [],
  };
  const sorted = [...records].sort((a, b) =>
    (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
  );
  for (const record of sorted) {
    if (!record || record.archived) continue;
    const data = record.data ?? {};
    const title = plainText(data.title);
    if (!title || !isStatus(data.status)) continue;
    groups[data.status].push({
      id: record._id ?? title,
      title,
      summary: plainText(data.summary),
      status: data.status,
    });
  }
  return groups;
}

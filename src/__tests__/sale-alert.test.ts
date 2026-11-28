// @vitest-environment node
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Every paid order, refund and dispute tells the owner, with the amount,
 * tier and order number and nothing about the buyer (studio issue #571).
 */

// Hoisted with the mocks below, which use them.
const { findUnique, upsert, parsed } = vi.hoisted(() => ({
  findUnique: vi.fn(async () => null as { id: string } | null),
  upsert: vi.fn(async () => ({ id: 'row' })),
  parsed: { event: null as null | Record<string, unknown> },
}));

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock('@/lib/db', () => ({
  prisma: { webhookEvent: { findUnique, upsert } },
}));
vi.mock('@buildbase/sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@buildbase/sdk')>()),
  parseWebhookEvent: () => parsed.event,
}));

import { saleAlertText, sendSaleAlert } from '@/lib/store/sale-alert';
import { POST } from '@/app/api/webhooks/buildbase/route';

const BUYER_EMAIL = 'ada@example.com';
const KEY = 'RWLD-AAAA-BBBB-CCCC';

const order = {
  _id: 'ord_123',
  currency: 'usd',
  total: 24900,
  buyer: { type: 'guest', id: 'g1', email: BUYER_EMAIL, name: 'Ada Lovelace' },
  lines: [
    {
      itemTitle: 'RenderWeld Commercial',
      variantLabel: 'Studio',
      quantity: 1,
      key: KEY,
    },
  ],
  dispute: null,
};

beforeAll(() => {
  process.env.SKIP_ENV_VALIDATION = 'true';
  process.env.BUILDBASE_WEBHOOK_SECRET = 'webhook-test-secret';
  process.env.SALES_ALERT_WEBHOOK_URL = 'https://hooks.example.test/alert';
});

afterEach(() => {
  vi.unstubAllGlobals();
  findUnique.mockClear();
  upsert.mockClear();
});

describe('saleAlertText', () => {
  it('names a paid order: amount, tier and order number', () => {
    expect(saleAlertText('order.paid', { order })).toBe(
      'RenderWeld sale: $249.00, RenderWeld Commercial: Studio. Order ord_123.'
    );
  });

  it('names a refund by the refunded amount', () => {
    expect(
      saleAlertText('order.refunded', { order, refund: { amount: 10000 } })
    ).toBe(
      'RenderWeld refund: $100.00, RenderWeld Commercial: Studio. Order ord_123.'
    );
  });

  it('names a dispute and its state', () => {
    const disputed = {
      ...order,
      dispute: { status: 'needs_response', amount: 24900, outcome: null },
    };
    expect(saleAlertText('order.disputed', { order: disputed })).toBe(
      'RenderWeld dispute (needs_response): $249.00, RenderWeld Commercial: Studio. Order ord_123.'
    );
  });

  it('never carries the buyer or a key', () => {
    for (const [event, extra] of [
      ['order.paid', {}],
      ['order.refunded', { refund: { amount: 1 } }],
      ['order.disputed', {}],
    ] as const) {
      const text = saleAlertText(event, { order, ...extra })!;
      expect(text).not.toContain(BUYER_EMAIL);
      expect(text).not.toContain('Ada');
      expect(text).not.toContain(KEY);
    }
  });

  it('skips free claims and other events', () => {
    expect(
      saleAlertText('order.paid', { order: { ...order, total: 0 } })
    ).toBeNull();
    expect(saleAlertText('order.created', { order })).toBeNull();
    expect(saleAlertText('item.updated', {})).toBeNull();
  });
});

describe('sendSaleAlert', () => {
  it('posts the text as Slack and Discord read it', async () => {
    const fetchMock = vi.fn(async () => new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);
    expect(await sendSaleAlert('hello', 'https://hooks.example.test/a')).toBe(
      true
    );
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://hooks.example.test/a');
    expect(JSON.parse(String(init.body))).toEqual({
      text: 'hello',
      content: 'hello',
    });
  });

  it('never throws when the post fails or no address is set', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline');
      })
    );
    expect(await sendSaleAlert('x', 'https://hooks.example.test/a')).toBe(
      false
    );
    expect(await sendSaleAlert('x', '')).toBe(false);
  });
});

describe('/api/webhooks/buildbase sale alerts', () => {
  function deliver() {
    return POST(
      new NextRequest('https://renderweld.example/api/webhooks/buildbase', {
        method: 'POST',
        body: JSON.stringify({ event: 'order.paid', order }),
      })
    );
  }

  it('alerts once for a paid order, not again on a retry', async () => {
    const fetchMock = vi.fn(async () => new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);
    parsed.event = { event: 'order.paid', timestamp: 1, data: { order } };

    expect((await deliver()).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    findUnique.mockResolvedValueOnce({ id: 'row' });
    expect((await deliver()).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends nothing for an event that needs no alert', async () => {
    const fetchMock = vi.fn(async () => new Response('ok'));
    vi.stubGlobal('fetch', fetchMock);
    parsed.event = { event: 'item.updated', timestamp: 1, data: {} };
    expect((await deliver()).status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(findUnique).not.toHaveBeenCalled();
  });
});

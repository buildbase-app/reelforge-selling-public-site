// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { toPublicItem } from '@/lib/store/public-item';
import { buildOffers } from '@/lib/store/offers';
import {
  pathsForWebhookEvent,
  tagsForWebhookEvent,
} from '@/lib/cache/webhook-tags';

/** A server API item, with fields that must never reach the browser. */
function serverItem(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'item_1',
    title: 'ReelForge',
    slug: 'reelforge',
    summary: 'Docker image and licence key.',
    status: 'published',
    typeKey: 'software',
    typeVersion: 1,
    seller: {
      id: null,
      subject: { type: 'org', id: 'store' },
      displayName: 'ReelForge',
    },
    publishedAt: '2026-11-21T00:00:00.000Z',
    updatedAt: '2026-11-21T00:00:00.000Z',
    metadata: { internal: 'secret-note' },
    payees: [{ sellerId: 'x', shareBps: 100 }],
    review: { submittedAt: null, decidedAt: null, reason: null },
    data: { privateField: 'hidden' },
    benefits: [
      {
        id: 'b1',
        kind: 'license_key',
        title: 'Licence key',
        content: { activationLimit: 3, secretTemplate: 'never-public' },
      },
    ],
    variants: [
      {
        id: 'solo',
        label: 'Solo',
        data: { cost: 'hidden' },
        prices: [
          {
            id: 'old',
            currency: 'usd',
            mode: 'fixed',
            amount: 100,
            retired: true,
          },
          { id: 'usd', currency: 'usd', mode: 'fixed', amount: 4900 },
        ],
        stock: { mode: 'none' },
      },
      {
        id: 'retired-only',
        prices: [
          { id: 'r', currency: 'usd', mode: 'fixed', amount: 1, retired: true },
        ],
        stock: { mode: 'none' },
      },
    ],
    ...overrides,
  };
}

describe('toPublicItem', () => {
  it('keeps public fields only', () => {
    const item = toPublicItem(serverItem());
    const json = JSON.stringify(item);
    expect(json).not.toMatch(
      /secret-note|never-public|hidden|payees|shareBps|activationLimit/
    );
    expect(item?.benefits).toEqual([
      { id: 'b1', kind: 'license_key', title: 'Licence key' },
    ]);
    expect(item?.variants).toHaveLength(1);
    expect(item?.variants[0].prices).toEqual([
      { id: 'usd', currency: 'usd', mode: 'fixed', amount: 4900 },
    ]);
  });

  it('drops items that are not published, restricted, or have no price', () => {
    expect(toPublicItem(serverItem({ status: 'draft' }))).toBeNull();
    expect(
      toPublicItem(serverItem({ eligibility: { buyerIds: ['u1'] } }))
    ).toBeNull();
    expect(toPublicItem(serverItem({ variants: [] }))).toBeNull();
  });
});

describe('buildOffers', () => {
  it('converts minor units per currency', () => {
    const usd = toPublicItem(serverItem())!;
    const jpy = toPublicItem(
      serverItem({
        _id: 'item_2',
        variants: [
          {
            id: 'jp',
            prices: [
              { id: 'jpy', currency: 'jpy', mode: 'fixed', amount: 4900 },
            ],
            stock: { mode: 'none' },
          },
        ],
      })
    )!;
    expect(buildOffers([usd, jpy], 'https://x.test/pricing')).toEqual([
      expect.objectContaining({
        name: 'ReelForge: Solo',
        price: '49.00',
        priceCurrency: 'USD',
      }),
      expect.objectContaining({
        name: 'ReelForge',
        price: '4900',
        priceCurrency: 'JPY',
      }),
    ]);
  });

  it('emits nothing without items', () => {
    expect(buildOffers([], 'https://x.test/pricing')).toEqual([]);
  });
});

describe('tagsForWebhookEvent', () => {
  it('revalidates the store items on item events', () => {
    expect(tagsForWebhookEvent('item.published', {})).toEqual(['store:items']);
    expect(tagsForWebhookEvent('item.updated', {})).toEqual(['store:items']);
  });

  it('revalidates the tags a content event names', () => {
    expect(
      tagsForWebhookEvent('faq.updated', {
        tags: ['buildbase:faq', 'buildbase:faq:home-faq'],
      })
    ).toEqual(['buildbase:faq', 'buildbase:faq:home-faq']);
    expect(
      tagsForWebhookEvent('rich_content.updated', {
        module: 'rich_content',
        slug: 'remotion-notice',
      })
    ).toContain('buildbase:rich_content:remotion-notice');
  });

  it('ignores events that change no cached page', () => {
    expect(tagsForWebhookEvent('order.paid', {})).toEqual([]);
  });
});

describe('pathsForWebhookEvent', () => {
  it('names the ISR pages each kind of event touches', () => {
    expect(pathsForWebhookEvent('item.published')).toEqual([
      '/en',
      '/en/pricing',
    ]);
    expect(pathsForWebhookEvent('faq.updated')).toEqual([
      '/en',
      '/en/pricing',
      '/en/help',
    ]);
    expect(pathsForWebhookEvent('user.registered')).toEqual([]);
  });
});

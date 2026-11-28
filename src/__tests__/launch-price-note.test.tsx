import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('server-only', () => ({}));

const getRichContent = vi.fn();
vi.mock('@/lib/platform/content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/platform/content')>()),
  getRichContent: (slug: string) => getRichContent(slug),
}));

const logError = vi.fn();
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: (...args: unknown[]) => logError(...args),
  },
}));

import { getLaunchPriceNote } from '@/lib/platform/blocks';
import { LaunchPriceNote } from '@/components/content/launch-price-note';
import {
  LAUNCH_PRICE_ENDS_AT,
  LAUNCH_PRICE_ENDS_LABEL,
  isLaunchPriceActive,
  paidCommercialOnSale,
} from '@/lib/store/launch';
import type { PublicItemView } from '@buildbase/sdk';

/**
 * A launch price is never shown without its end date (studio issue #260):
 * when the `launch-price-note` block can't be read (no BUILDBASE_API_TOKEN,
 * a failed read, no block) or doesn't state the end date, the built-in note
 * with the end date shows instead; after the end date, no launch note.
 */

const BEFORE_END = new Date('2026-11-23T12:00:00Z');
const AT_END = new Date('2026-12-16T13:00:00Z');
const AFTER_END = new Date('2026-12-16T13:00:01Z');

const founderBlock = {
  _id: 'rc_1',
  title: 'Launch price note',
  slug: 'launch-price-note',
  content:
    'Launch prices until **16 December 2026, 13:00 UTC**. After that, Solo $99, Studio $249, Agency $599.',
};

beforeEach(() => {
  getRichContent.mockReset();
  logError.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('launch price window', () => {
  it('ends at 2026-12-16 13:00 UTC (founder decision, studio issue #91)', () => {
    expect(LAUNCH_PRICE_ENDS_AT.toISOString()).toBe('2026-12-16T13:00:00.000Z');
    expect(LAUNCH_PRICE_ENDS_LABEL).toBe('16 December 2026, 13:00 UTC');
    expect(isLaunchPriceActive(BEFORE_END)).toBe(true);
    expect(isLaunchPriceActive(AT_END)).toBe(false);
    expect(isLaunchPriceActive(AFTER_END)).toBe(false);
  });

  it('keeps the label and the instant in step', () => {
    const date = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(LAUNCH_PRICE_ENDS_AT);
    const time = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'UTC',
    }).format(LAUNCH_PRICE_ENDS_AT);
    expect(LAUNCH_PRICE_ENDS_LABEL).toBe(`${date}, ${time} UTC`);
  });
});

describe('getLaunchPriceNote', () => {
  it('shows the content block when it can be read and states the end date', async () => {
    getRichContent.mockResolvedValue(founderBlock);
    const note = await getLaunchPriceNote(BEFORE_END);
    expect(note?.source).toBe('buildbase');
    expect(note?.text).toContain('After that, Solo');
    expect(note?.text).toContain(LAUNCH_PRICE_ENDS_LABEL);
    expect(logError).not.toHaveBeenCalled();
  });

  it('shows the built-in note when the block gives a percentage discount', async () => {
    for (const content of [
      'Launch price: 50% off until **16 December 2026, 13:00 UTC**.',
      'Save 40 % until 16 December 2026, 13:00 UTC.',
      'Launch prices, 33 percent off, until 16 December 2026, 13:00 UTC.',
    ]) {
      logError.mockReset();
      getRichContent.mockResolvedValue({ ...founderBlock, content });
      const note = await getLaunchPriceNote(BEFORE_END);
      expect(note?.source).toBe('default');
      expect(note?.text).toContain(LAUNCH_PRICE_ENDS_LABEL);
      expect(note?.text).not.toMatch(/%|percent/i);
      expect(logError).toHaveBeenCalledTimes(1);
    }
  });

  it('shows the built-in note with the end date when the block is missing or unreadable', async () => {
    // getRichContent returns null without a token, on a failed read and
    // when the block does not exist.
    getRichContent.mockResolvedValue(null);
    const note = await getLaunchPriceNote(BEFORE_END);
    expect(note?.source).toBe('default');
    expect(note?.text).toContain(LAUNCH_PRICE_ENDS_LABEL);
    expect(logError).toHaveBeenCalledTimes(1);
  });

  it('shows the built-in note when the block is empty', async () => {
    getRichContent.mockResolvedValue({ ...founderBlock, content: '  ' });
    const note = await getLaunchPriceNote(BEFORE_END);
    expect(note?.source).toBe('default');
    expect(note?.text).toContain(LAUNCH_PRICE_ENDS_LABEL);
  });

  it('shows the built-in note when the block does not state the end date', async () => {
    getRichContent.mockResolvedValue({
      ...founderBlock,
      content: 'Launch prices for a limited time.',
    });
    const note = await getLaunchPriceNote(BEFORE_END);
    expect(note?.source).toBe('default');
    expect(note?.text).toContain(LAUNCH_PRICE_ENDS_LABEL);
    expect(note?.text).not.toContain('limited time');
    expect(logError).toHaveBeenCalledTimes(1);
  });

  it('shows no launch note from the end date on, block or not', async () => {
    getRichContent.mockResolvedValue(founderBlock);
    expect(await getLaunchPriceNote(AT_END)).toBeNull();
    expect(await getLaunchPriceNote(AFTER_END)).toBeNull();
    getRichContent.mockResolvedValue(null);
    expect(await getLaunchPriceNote(AFTER_END)).toBeNull();
    expect(logError).not.toHaveBeenCalled();
  });

  it('writes no price into the built-in note (prices come from BuildBase items)', async () => {
    getRichContent.mockResolvedValue(null);
    const note = await getLaunchPriceNote(BEFORE_END);
    expect(note?.text).not.toMatch(/[$€£]\s?\d/);
  });
});

describe('<LaunchPriceNote>', () => {
  it('renders the end date beside the prices when the block is unreadable', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(BEFORE_END);
    getRichContent.mockResolvedValue(null);
    render(await LaunchPriceNote({}));
    expect(screen.getByRole('note')).toHaveTextContent(LAUNCH_PRICE_ENDS_LABEL);
  });

  it('renders nothing after the launch price ends', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(AFTER_END);
    getRichContent.mockResolvedValue(founderBlock);
    expect(await LaunchPriceNote({})).toBeNull();
  });
});

/**
 * The note is about prices: with nothing to pay for ("Not on sale yet", as on
 * production before the items are published) there is no note (studio issue
 * #266). When the server could not read the store it still shows, because
 * the browser may then show launch prices.
 */
type Price = { mode: 'fixed' | 'free' | 'pwyw'; retired?: boolean };
function item(
  edition: 'personal' | 'commercial',
  prices: Price[][]
): PublicItemView {
  return {
    _id: `item-${edition}-${prices.length}`,
    slug: `x-${edition}`,
    data: { edition },
    variants: prices.map((p, i) => ({ id: `v${i}`, prices: p })),
  } as unknown as PublicItemView;
}
const personal = item('personal', [[{ mode: 'free' }]]);
const commercial = item('commercial', [
  [{ mode: 'fixed' }],
  [{ mode: 'fixed' }],
]);

describe('paidCommercialOnSale', () => {
  it('is false with no published items', () => {
    expect(paidCommercialOnSale({ source: 'server', items: [] })).toBe(false);
  });

  it('is false when only the free Personal licence is published', () => {
    expect(paidCommercialOnSale({ source: 'server', items: [personal] })).toBe(
      false
    );
  });

  it('is false when every Commercial price is retired', () => {
    const retired = item('commercial', [[{ mode: 'fixed', retired: true }]]);
    expect(
      paidCommercialOnSale({ source: 'server', items: [personal, retired] })
    ).toBe(false);
  });

  it('is true when a paid Commercial variant is on sale', () => {
    expect(
      paidCommercialOnSale({ source: 'server', items: [personal, commercial] })
    ).toBe(true);
  });

  it('is unknown (undefined) when the server could not read the store', () => {
    expect(
      paidCommercialOnSale({ source: 'unavailable', items: [] })
    ).toBeUndefined();
  });
});

describe('<LaunchPriceNote> and what is on sale', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(BEFORE_END);
  });

  it('renders nothing when no items are published, even with the block', async () => {
    getRichContent.mockResolvedValue(founderBlock);
    const onSale = paidCommercialOnSale({ source: 'server', items: [] });
    expect(await LaunchPriceNote({ onSale })).toBeNull();
    // Not a fault: no "block unusable" error is logged for it.
    expect(logError).not.toHaveBeenCalled();
  });

  it('renders the note with the end date when a paid Commercial variant is on sale', async () => {
    getRichContent.mockResolvedValue(null);
    const onSale = paidCommercialOnSale({
      source: 'server',
      items: [personal, commercial],
    });
    render(await LaunchPriceNote({ onSale }));
    expect(screen.getByRole('note')).toHaveTextContent(LAUNCH_PRICE_ENDS_LABEL);
  });

  it('renders the note when the server could not tell what is on sale', async () => {
    getRichContent.mockResolvedValue(null);
    const onSale = paidCommercialOnSale({ source: 'unavailable', items: [] });
    render(await LaunchPriceNote({ onSale }));
    expect(screen.getByRole('note')).toHaveTextContent(LAUNCH_PRICE_ENDS_LABEL);
  });

  it('still renders nothing after the end date while on sale', async () => {
    vi.setSystemTime(AFTER_END);
    getRichContent.mockResolvedValue(founderBlock);
    expect(await LaunchPriceNote({ onSale: true })).toBeNull();
  });
});

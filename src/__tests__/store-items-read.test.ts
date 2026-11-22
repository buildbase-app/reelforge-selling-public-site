// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

/**
 * getStoreItems puts the prices in the HTML so the home page needs no
 * BuildBase provider (studio issue #79): the org-token read when there is a
 * token, the public guest read (no credentials) otherwise or when that read
 * fails, and "unavailable" only when both fail.
 */

const guestItem = {
  _id: 'item_1',
  title: 'ReelForge Commercial',
  slug: 'reelforge-commercial',
  status: 'published',
  typeKey: 'software',
  typeVersion: 1,
  seller: { id: null, subject: { type: 'org', id: 'store' } },
  variants: [
    {
      id: 'solo',
      label: 'Solo',
      prices: [
        { id: 'solo-usd', currency: 'usd', mode: 'fixed', amount: 4900 },
      ],
      stock: { mode: 'none' },
    },
  ],
  benefits: [],
  data: {},
  restricted: false,
};

const fetchMock = vi.fn();

async function load() {
  vi.resetModules();
  return import('@/lib/store/items');
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('NEXT_PUBLIC_BUILDBASE_SERVER_URL', 'https://api.example.test');
  vi.stubEnv('NEXT_PUBLIC_BUILDBASE_ORG_ID', 'org123');
  vi.stubEnv('NEXT_PUBLIC_BUILDBASE_ENVIRONMENT', 'abcdefgh');
  vi.stubEnv('BUILDBASE_API_TOKEN', '');
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });

describe('getStoreItems', () => {
  it('reads the public guest API, without credentials, when there is no token', async () => {
    fetchMock.mockResolvedValueOnce(ok({ docs: [guestItem] }));
    const { getStoreItems } = await load();
    const result = await getStoreItems();

    expect(result.source).toBe('server');
    expect(result.items.map((i) => i._id)).toEqual(['item_1']);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      'https://api.example.test/api/v1/guest/org123-abcdefgh/items?sellerType=org&page=1&limit=50'
    );
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('uses the org token first when there is one', async () => {
    vi.stubEnv('BUILDBASE_API_TOKEN', 'token-for-test');
    fetchMock.mockResolvedValueOnce(ok({ docs: [guestItem] }));
    const { getStoreItems } = await load();
    const result = await getStoreItems();

    expect(result.source).toBe('server');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      '/api/v1/server/commerce/items'
    );
  });

  it('falls back to the guest read when the token read is refused', async () => {
    vi.stubEnv('BUILDBASE_API_TOKEN', 'token-for-test');
    fetchMock
      .mockResolvedValueOnce(new Response('{}', { status: 403 }))
      .mockResolvedValueOnce(ok({ docs: [guestItem] }));
    const { getStoreItems } = await load();
    const result = await getStoreItems();

    expect(result).toMatchObject({ source: 'server' });
    expect(String(fetchMock.mock.calls[1][0])).toContain('/api/v1/guest/');
  });

  it('is "unavailable" (not "nothing on sale") when both reads fail', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));
    const { getStoreItems } = await load();
    expect(await getStoreItems()).toEqual({ source: 'unavailable', items: [] });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * /docs tells "could not be read" apart from "read and empty" (studio
 * issue #637): the loader flags the first, and the page says the docs
 * couldn't be loaded instead of naming a missing token.
 */

vi.mock('server-only', () => ({}));
vi.mock('react', async (orig) => ({
  ...(await orig<typeof import('react')>()),
  cache: <T>(fn: T) => fn,
}));
let client: unknown = null;
vi.mock('@/lib/platform/content', () => ({
  contentClient: () => client,
}));

import { getDocsSite } from '@/lib/docs/source';

beforeEach(() => {
  client = null;
});

describe('getDocsSite', () => {
  it('flags the site as unreadable without a content token', async () => {
    const site = await getDocsSite();
    expect(site.failed).toBe(true);
    expect(site.nav.pages).toEqual([]);
  });

  it('flags the site as unreadable when BuildBase does not answer', async () => {
    client = {
      docs: {
        tree: async () => {
          throw new Error('fetch failed');
        },
        list: async () => ({ docs: [], hasNextPage: false }),
      },
    };
    expect((await getDocsSite()).failed).toBe(true);
  });

  it('reads an empty site as empty, not failed', async () => {
    client = {
      docs: {
        tree: async () => [],
        list: async () => ({ docs: [], hasNextPage: false }),
      },
    };
    const site = await getDocsSite();
    expect(site.failed).toBeFalsy();
    expect(site.nav.pages).toEqual([]);
  });
});

describe('/docs page copy', () => {
  it('uses the plain load-failure message and no longer names the token', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const page = readFileSync(
      path.resolve(__dirname, '../app/[locale]/(marketing)/docs/page.tsx'),
      'utf8'
    );
    expect(page).toContain(
      "The documentation couldn't be loaded just now. Please try again in a minute."
    );
    expect(page).not.toContain('no BuildBase token configured');
  });
});

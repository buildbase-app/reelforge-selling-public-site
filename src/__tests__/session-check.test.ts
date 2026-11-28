// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Only a clear "this session is gone" from BuildBase (401, 403, 404) counts
 * as a dead session; a network or workspace refusal and no answer keep it
 * (studio issue #602).
 */

const profile = vi.hoisted(() => ({ getProfile: vi.fn() }));
const refused = vi.hoisted(() => ({ value: false }));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/buildbase', () => ({
  withSession: () => ({ users: profile }),
}));
vi.mock('@buildbase/sdk', () => ({
  isAccessRefused: () => refused.value,
}));

import { isSessionDead } from '@/lib/session-check';

function failWith(status: number) {
  profile.getProfile.mockRejectedValue(
    Object.assign(new Error('refused'), { status })
  );
}

beforeEach(() => {
  profile.getProfile.mockReset();
  refused.value = false;
});

describe('isSessionDead', () => {
  it('a live session', async () => {
    profile.getProfile.mockResolvedValue({ id: 'u1' });
    await expect(isSessionDead('s')).resolves.toBe(false);
  });

  it.each([401, 403, 404])('%i: the session is over', async (status) => {
    failWith(status);
    await expect(isSessionDead('s')).resolves.toBe(true);
  });

  it.each([0, 429, 500, 502, 503])(
    '%i: no clear answer, keep the session',
    async (status) => {
      failWith(status);
      await expect(isSessionDead('s')).resolves.toBe(false);
    }
  );

  it('a network or workspace refusal keeps the session', async () => {
    failWith(403);
    refused.value = true;
    await expect(isSessionDead('s')).resolves.toBe(false);
  });

  it('an error without a status keeps the session', async () => {
    profile.getProfile.mockRejectedValue(new TypeError('fetch failed'));
    await expect(isSessionDead('s')).resolves.toBe(false);
  });
});

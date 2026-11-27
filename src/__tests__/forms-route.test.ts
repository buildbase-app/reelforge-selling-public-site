// @vitest-environment node
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('server-only', () => ({}));

import { GET, POST } from '@/app/api/public-forms/[form]/[step]/route';
import {
  formIdFor,
  getPublicForm,
  upstreamEndpoint,
} from '@/lib/platform/forms';

const BASE = 'http://localhost:3000';
const UPSTREAM = 'https://api.example.test/api/forms/public/org1/feat1';

beforeAll(() => {
  process.env.NEXT_PUBLIC_BUILDBASE_SERVER_URL = 'https://api.example.test/';
  process.env.NEXT_PUBLIC_BUILDBASE_ORG_ID = 'org1';
  process.env.NEXT_PUBLIC_BUILDBASE_FEATURE_REQUEST_FORM_ID = 'feat1';
  delete process.env.NEXT_PUBLIC_BUILDBASE_CONTACT_FORM_ID;
});

afterEach(() => vi.unstubAllGlobals());

function params(form: string, step: string) {
  return { params: Promise.resolve({ form, step }) };
}

function post(body: string) {
  return new NextRequest(new URL('/api/public-forms/feature/submit', BASE), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
}

function stubFetch(response: Response) {
  const fetchMock = vi.fn<
    (url: string, init?: RequestInit) => Promise<Response>
  >(async () => response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('form ids and endpoints', () => {
  it('knows only the forms the site shows', () => {
    expect(formIdFor('feature')).toBe('feat1');
    expect(formIdFor('other')).toBeNull();
    expect(upstreamEndpoint('feat1')).toBe(UPSTREAM);
  });

  it('points the browser at the site route, not at BuildBase', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/fields')
          ? Response.json([
              { slug: 'title', title: 'Idea', type: 'text', required: true },
            ])
          : Response.json({ captcha: { widget: 'pow' } })
      )
    );
    const form = await getPublicForm('feature');
    expect(form?.endpoint).toBe('/api/public-forms/feature');
    expect(form?.captcha).toBe('pow');
    expect(await getPublicForm('contact')).toBeNull();
  });
});

describe('/api/public-forms/[form]/[step]', () => {
  it('passes the challenge on from BuildBase', async () => {
    const fetchMock = stubFetch(
      Response.json({ algorithm: 'SHA-256', challenge: 'abc' })
    );
    const res = await GET(
      new NextRequest(new URL('/api/public-forms/feature/challenge', BASE)),
      params('feature', 'challenge')
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({
      algorithm: 'SHA-256',
      challenge: 'abc',
    });
    expect(fetchMock.mock.calls[0]![0]).toBe(`${UPSTREAM}/challenge`);
  });

  it('forwards a submission and keeps BuildBase status and message', async () => {
    const fetchMock = stubFetch(
      Response.json(
        {
          success: false,
          message: 'Too many submissions. Please try again later.',
        },
        { status: 429 }
      )
    );
    const res = await POST(
      post(JSON.stringify({ title: 'GIF export', _captcha: 'x' })),
      params('feature', 'submit')
    );
    expect(res.status).toBe(429);
    expect((await res.json()).message).toMatch(/Too many submissions/);
    const [url, init] = fetchMock.mock.calls[0]! as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(`${UPSTREAM}/submit`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      title: 'GIF export',
      _captcha: 'x',
    });
  });

  it('answers a message when BuildBase sends no JSON', async () => {
    stubFetch(new Response('Bad gateway', { status: 502 }));
    const res = await POST(post('{"title":"x"}'), params('feature', 'submit'));
    expect(res.status).toBe(502);
    expect((await res.json()).message).toMatch(/could not be sent/);
  });

  it('answers 502 when BuildBase cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      })
    );
    const res = await POST(post('{"title":"x"}'), params('feature', 'submit'));
    expect(res.status).toBe(502);
  });

  it('refuses unknown forms and steps without calling out', async () => {
    const fetchMock = stubFetch(Response.json({}));
    expect((await POST(post('{}'), params('other', 'submit'))).status).toBe(
      404
    );
    expect(
      (await POST(post('{}'), params('feature', 'challenge'))).status
    ).toBe(404);
    expect(
      (
        await GET(
          new NextRequest(new URL('/api/public-forms/contact/challenge', BASE)),
          params('contact', 'challenge')
        )
      ).status
    ).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a body that is not a JSON object or is too large', async () => {
    const fetchMock = stubFetch(Response.json({}));
    expect(
      (await POST(post('not json'), params('feature', 'submit'))).status
    ).toBe(400);
    expect((await POST(post('[1]'), params('feature', 'submit'))).status).toBe(
      400
    );
    const big = JSON.stringify({ details: 'x'.repeat(70 * 1024) });
    expect((await POST(post(big), params('feature', 'submit'))).status).toBe(
      413
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

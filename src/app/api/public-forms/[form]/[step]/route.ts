import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { formIdFor, upstreamEndpoint } from '@/lib/platform/forms';

/**
 * The site's own door to its BuildBase forms (`ContactForm` calls it):
 *
 *   GET  /api/public-forms/{contact|feature|template}/challenge  → the built-in check
 *   POST /api/public-forms/{contact|feature|template}/submit     → the submission
 *
 * BuildBase answers its organization API, /api/forms/public included, with no
 * CORS headers for other sites, so the browser cannot call it from
 * renderweld.com. This route passes the call on from the server and hands
 * back BuildBase's status and JSON as they are, so the form shows BuildBase's
 * own messages (captcha, blocked email, daily cap). Only the three forms the
 * site shows are reachable; it is not a general proxy.
 * Docs: https://docs.buildbase.app/forms/custom-forms#server-side-submission
 *
 * The middleware already lets only same-origin JSON reach the POST.
 */

const MAX_BODY_BYTES = 64 * 1024;
const UPSTREAM_TIMEOUT_MS = 15_000;
const DEFAULT_ERROR = 'The message could not be sent. Try again, or email us.';

type Params = { params: Promise<{ form: string; step: string }> };

function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

async function endpointFor(params: Params['params']) {
  const { form, step } = await params;
  const formId = formIdFor(form);
  const endpoint = formId ? upstreamEndpoint(formId) : null;
  return { form, step, endpoint };
}

/** BuildBase's answer, passed on: its status, and its JSON or a message. */
async function passOn(
  form: string,
  step: string,
  res: Response
): Promise<Response> {
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    // Status only: a refused submission's body can echo the visitor's email.
    logger.warn('Form call refused', { form, step, status: res.status });
  }
  if (body && typeof body === 'object') return json(body, res.status);
  return json(
    { success: false, message: res.ok ? 'Unexpected answer' : DEFAULT_ERROR },
    res.ok ? 502 : res.status
  );
}

function unreachable(form: string, step: string, error: unknown): Response {
  logger.warn('Form call failed', {
    form,
    step,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  return json({ success: false, message: DEFAULT_ERROR }, 502);
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { form, step, endpoint } = await endpointFor(params);
  if (!endpoint || step !== 'challenge') {
    return json({ success: false, message: 'Not found' }, 404);
  }
  try {
    const res = await fetch(`${endpoint}/challenge`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    return await passOn(form, step, res);
  } catch (error) {
    return unreachable(form, step, error);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { form, step, endpoint } = await endpointFor(params);
  if (!endpoint || step !== 'submit') {
    return json({ success: false, message: 'Not found' }, 404);
  }

  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return json({ success: false, message: 'The message is too long.' }, 413);
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return json({ success: false, message: DEFAULT_ERROR }, 400);
  }

  try {
    const res = await fetch(`${endpoint}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    return await passOn(form, step, res);
  } catch (error) {
    return unreachable(form, step, error);
  }
}

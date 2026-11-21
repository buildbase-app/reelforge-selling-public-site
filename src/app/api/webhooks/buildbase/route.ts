import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parseWebhookEvent } from '@buildbase/sdk';
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  pathsForWebhookEvent,
  tagsForWebhookEvent,
} from '@/lib/cache/webhook-tags';

/**
 * Platform webhooks (server to server).
 *
 * BuildBase signs every delivery: `x-buildbase-signature` is
 * `sha256=<hex>`, an HMAC-SHA256 of `{timestamp}.{body}` with the endpoint's
 * signing secret, and `x-buildbase-timestamp` is the same Unix time as the
 * body's `timestamp`. `parseWebhookEvent` checks both (and rejects anything
 * older than five minutes) before we look at the payload, so a forged or
 * replayed request never reaches the database.
 *
 * Register the endpoint in the console under Settings → Webhooks, pointing at
 * `<site>/api/webhooks/buildbase`, and put its signing secret in
 * `BUILDBASE_WEBHOOK_SECRET`.
 *
 * Deliveries are at-least-once with no event id, so the row key is a hash of
 * the raw body: a retry lands on the same row instead of a duplicate.
 *
 * Cached pages: an `item.*` event revalidates the store's items (prices on
 * `/` and `/pricing`), a content event the `buildbase:*` tags it names
 * (`/help`, `/docs`, FAQs, content blocks), plus the paths of those ISR pages
 * (src/lib/cache/webhook-tags.ts). Tags expire at once, so the next request
 * renders fresh data. Done before storing, so a storage failure (and the
 * retry it triggers) never delays a price change.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.BUILDBASE_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn('Webhook received but BUILDBASE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook endpoint not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const event = parseWebhookEvent({
    body,
    signature: request.headers.get('x-buildbase-signature'),
    timestamp: request.headers.get('x-buildbase-timestamp'),
    secret,
  });

  if (!event) {
    logger.warn('Webhook rejected: bad signature or stale timestamp', {
      event: request.headers.get('x-buildbase-event') ?? undefined,
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const data = event.data ?? {};

  const tags = tagsForWebhookEvent(event.event, data);
  const paths = pathsForWebhookEvent(event.event, data);
  try {
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
    for (const path of paths) revalidatePath(path);
  } catch (error) {
    logger.warn('Webhook: revalidation failed', {
      event: event.event,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const workspaceId =
    typeof data.workspaceId === 'string' ? data.workspaceId : null;
  const userId = typeof data.userId === 'string' ? data.userId : null;
  const id = await bodyHash(body);

  try {
    await prisma.webhookEvent.upsert({
      where: { id },
      // The row carries a BigInt; select nothing so the audit extension's
      // JSON logging never has to serialize it.
      select: { id: true },
      update: {},
      create: {
        id,
        event: event.event,
        timestamp: BigInt(event.timestamp),
        workspaceId,
        userId,
        payload: data as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.error('Webhook could not be stored', {
      event: event.event,
      error: error instanceof Error ? error.message : String(error),
    });
    // 500 makes the platform retry; the body hash keeps the retry idempotent.
    return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
  }

  logger.debug('Webhook stored', { event: event.event, workspaceId });
  return NextResponse.json({ received: true, revalidated: tags });
}

async function bodyHash(body: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(body)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

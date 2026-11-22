import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { authenticateProvisionCall } from '@/lib/security/provision-auth';

/**
 * A workflow's HTTP Webhook action calls this route.
 *
 * It has its own secret, BUILDBASE_PROVISION_SECRET (never the platform
 * webhook signing key): a signed call with a five-minute window, or the
 * secret in `x-provision-secret`, which is what a workflow can send (see
 * src/lib/security/provision-auth.ts). The platform retries up to five times
 * and ignores non-2xx, so the row key is a hash of the body: a retry lands
 * on the same row.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const auth = await authenticateProvisionCall({
    headers: request.headers,
    body: raw,
    secret: process.env.BUILDBASE_PROVISION_SECRET,
  });
  if (!auth.ok) {
    if (auth.status === 401) {
      logger.warn('Provisioning call refused', { reason: auth.reason });
    }
    return NextResponse.json(
      { error: auth.status === 503 ? 'Not configured' : 'Unauthorized' },
      { status: auth.status }
    );
  }
  let data: Record<string, unknown> = {};
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      data = parsed as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });
  }

  const userId = typeof data.userId === 'string' ? data.userId : null;
  const workspaceId =
    typeof data.workspaceId === 'string' ? data.workspaceId : null;
  const id = await bodyHash(raw || '{}');

  try {
    await prisma.webhookEvent.upsert({
      where: { id },
      select: { id: true },
      update: {},
      create: {
        id,
        event: 'workflow.http_webhook',
        timestamp: BigInt(Date.now()),
        workspaceId,
        userId,
        payload: data as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.error('Provisioning call could not be stored', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
  }

  return NextResponse.json({ provisioned: true, id });
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

import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@/generated/prisma/client';
import { logger } from '@/lib/logger';

/**
 * Database access on Cloudflare D1.
 *
 * A Worker gets its D1 binding per request (`getCloudflareContext().env.DB`),
 * so there is no module-level client. `prisma` below is a proxy: each property
 * access resolves the client for the current request, creating it once per
 * binding. Under `next dev`, `initOpenNextCloudflareForDev()` in next.config.ts
 * provides a local D1 through Wrangler, so the same code runs locally.
 *
 * Every write to a model other than AuditLog also writes an AuditLog row. On
 * Workers those writes are handed to `ctx.waitUntil` so they finish after the
 * response is sent instead of being cancelled with the request.
 */

// Log all models except AuditLog itself (prevents infinite recursion)
const EXCLUDED_MODELS = ['AuditLog'];

interface AuditContext {
  userId?: string;
  workspaceId?: string;
  ipAddress?: string;
  userAgent?: string;
  source?: string; // 'api' | 'event' | 'system'
}

type Ctx = { waitUntil(promise: Promise<unknown>): void };

/** Audit context per request, keyed by the request's ExecutionContext. */
const auditByRequest = new WeakMap<object, AuditContext>();
/** Fallback when no request context exists (scripts, build time). */
let fallbackAudit: AuditContext = {};

function requestCtx(): Ctx | null {
  try {
    return (getCloudflareContext().ctx as Ctx | undefined) ?? null;
  } catch {
    return null;
  }
}

function currentAudit(): AuditContext {
  const ctx = requestCtx();
  return ctx ? (auditByRequest.get(ctx) ?? {}) : fallbackAudit;
}

function updateAudit(patch: Partial<AuditContext>) {
  const ctx = requestCtx();
  const next = { ...currentAudit(), ...patch };
  if (ctx) auditByRequest.set(ctx, next);
  else fallbackAudit = next;
}

export function setAuditUser(userId: string | undefined) {
  updateAudit({ userId });
}

export function setAuditWorkspace(workspaceId: string | undefined) {
  updateAudit({ workspaceId });
}

export function setAuditContext(ctx: Partial<AuditContext>) {
  updateAudit(ctx);
}

export function clearAuditContext() {
  const ctx = requestCtx();
  if (ctx) auditByRequest.delete(ctx);
  else fallbackAudit = {};
}

function getRecordId(record: Record<string, unknown> | null): string | null {
  if (!record) return null;
  if (record.id) return String(record.id);
  // Composite key for UserWorkspace
  if (record.userId && record.workspaceId) {
    return `${record.userId}:${record.workspaceId}`;
  }
  return null;
}

/** JSON.stringify cannot serialise BigInt (WebhookEvent.timestamp). */
function bigintSafe(_key: string, value: unknown) {
  return typeof value === 'bigint' ? value.toString() : value;
}

function writeAuditLog(
  client: PrismaClient,
  action: string,
  model: string,
  recordId: string,
  before: unknown,
  after: unknown
) {
  const audit = currentAudit();
  const write = client.auditLog
    .create({
      data: {
        action,
        model,
        recordId,
        userId: audit.userId ?? null,
        workspaceId: audit.workspaceId ?? null,
        ipAddress: audit.ipAddress ?? null,
        userAgent: audit.userAgent ?? null,
        source: audit.source ?? null,
        before: before ? JSON.parse(JSON.stringify(before, bigintSafe)) : null,
        after: after ? JSON.parse(JSON.stringify(after, bigintSafe)) : null,
      },
    })
    .catch((err: unknown) => {
      logger.error('Failed to write audit log', { error: err, model, action });
    });
  // Keep the Worker alive until the audit row is written.
  requestCtx()?.waitUntil(write);
}

const AUDITED = new Set(['create', 'update', 'delete', 'upsert']);

function createPrismaClient(db: D1Database) {
  const base = new PrismaClient({ adapter: new PrismaD1(db) });

  return base.$extends({
    query: {
      $allOperations({ model, operation, args, query }) {
        if (
          !model ||
          EXCLUDED_MODELS.includes(model) ||
          !AUDITED.has(operation)
        ) {
          return query(args);
        }
        return query(args).then((result) => {
          const recordId = getRecordId(
            result as Record<string, unknown> | null
          );
          if (recordId) {
            const removed = operation === 'delete';
            writeAuditLog(
              base,
              operation,
              model,
              recordId,
              removed ? result : null,
              removed ? null : result
            );
          }
          return result;
        });
      },
    },
  }) as unknown as PrismaClient;
}

const clients = new WeakMap<D1Database, PrismaClient>();

/** The Prisma client for the current request's D1 binding. */
export function getPrisma(): PrismaClient {
  let db: D1Database | undefined;
  try {
    db = (getCloudflareContext().env as { DB?: D1Database }).DB;
  } catch (error) {
    throw new Error(
      'No Cloudflare context: the database is only available while handling a request ' +
        '(or under `next dev` with initOpenNextCloudflareForDev). ' +
        (error instanceof Error ? error.message : '')
    );
  }
  if (!db) {
    throw new Error(
      'D1 binding "DB" is missing. Check d1_databases in wrangler.jsonc.'
    );
  }
  let client = clients.get(db);
  if (!client) {
    client = createPrismaClient(db);
    clients.set(db, client);
  }
  return client;
}

/**
 * Drop-in replacement for the old module-level client: `prisma.user.findMany()`
 * resolves the current request's client on each access.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrisma();
    const value = Reflect.get(client, property, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

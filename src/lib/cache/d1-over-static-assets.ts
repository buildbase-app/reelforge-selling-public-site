import type {
  CacheEntryType,
  CacheValue,
  IncrementalCache,
  WithLastModified,
} from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import staticAssetsCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

/**
 * OpenNext incremental cache for this store (see open-next.config.ts).
 *
 * Reads: the D1 table `incremental_cache` first (whatever was regenerated at
 * runtime: an ISR page, a tagged BuildBase read), then the copy prerendered
 * at build time in the Worker's static assets. Writes go to D1 only; static
 * assets are read-only.
 *
 * Why D1 and not KV or R2: R2 is not enabled on the account, and D1 is
 * already in use (and in the deploy token's scope). It shares the tag
 * cache's database (binding NEXT_TAG_CACHE_D1), never the app's.
 *
 * `name` is the static-assets cache's name on purpose: `opennextjs-cloudflare
 * deploy` copies the build's prerendered pages into the assets only for a
 * cache with that name, and this cache reads them from there.
 *
 * Without the binding (a local preview), it behaves exactly like the
 * static-assets cache.
 */

const BINDING = 'NEXT_TAG_CACHE_D1';
const TABLE = 'incremental_cache';
/** D1 refuses a row over 2 MB; a larger entry (in characters, a close
 * enough bound for this HTML) is simply not cached. */
const MAX_VALUE_CHARS = 1_900_000;

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS ${TABLE} (key TEXT PRIMARY KEY, value TEXT NOT NULL, lastModified INTEGER NOT NULL)`;

/** The slice of the D1 binding this cache uses. */
interface D1Like {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
    run(): Promise<unknown>;
  };
}

function db(): D1Like | undefined {
  const env = getCloudflareContext().env as unknown as Record<string, unknown>;
  return env[BINDING] as D1Like | undefined;
}

function rowKey(key: string, cacheType: CacheEntryType = 'cache'): string {
  const buildId = process.env.OPEN_NEXT_BUILD_ID ?? 'no-build-id';
  return `${buildId}/${cacheType}/${key}`;
}

class D1OverStaticAssetsCache implements IncrementalCache {
  readonly name = staticAssetsCache.name;

  async get<CacheType extends CacheEntryType = 'cache'>(
    key: string,
    cacheType?: CacheType
  ): Promise<WithLastModified<CacheValue<CacheType>> | null> {
    const database = db();
    if (database) {
      try {
        const row = await database
          .prepare(`SELECT value, lastModified FROM ${TABLE} WHERE key = ?`)
          .bind(rowKey(key, cacheType))
          .first<{ value: string; lastModified: number }>();
        if (row) {
          return {
            value: JSON.parse(row.value) as CacheValue<CacheType>,
            lastModified: row.lastModified,
          };
        }
      } catch {
        // Missing table or a D1 hiccup: fall back to the build's copy.
      }
    }
    if (cacheType === 'composable') return null;
    return staticAssetsCache.get(key, cacheType);
  }

  async set<CacheType extends CacheEntryType = 'cache'>(
    key: string,
    value: CacheValue<CacheType>,
    cacheType?: CacheType
  ): Promise<void> {
    const database = db();
    if (!database) return;
    const body = JSON.stringify(value);
    if (body.length > MAX_VALUE_CHARS) return;
    const write = () =>
      database
        .prepare(
          `INSERT INTO ${TABLE} (key, value, lastModified) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, lastModified = excluded.lastModified`
        )
        .bind(rowKey(key, cacheType), body, Date.now())
        .run();
    try {
      await write();
    } catch (error) {
      if (!String(error).includes('no such table')) return;
      try {
        await database.prepare(CREATE_TABLE).run();
        await write();
      } catch {
        // Best effort: the page is still served, just not cached.
      }
    }
  }

  async delete(key: string): Promise<void> {
    const database = db();
    if (!database) return;
    try {
      await database
        .prepare(`DELETE FROM ${TABLE} WHERE key = ?`)
        .bind(rowKey(key, 'cache'))
        .run();
    } catch {
      // Nothing to delete.
    }
  }
}

const d1OverStaticAssets = new D1OverStaticAssetsCache();
export default d1OverStaticAssets;

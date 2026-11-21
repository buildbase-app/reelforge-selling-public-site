// Cloudflare Workers build config (OpenNext). Read by `opennextjs-cloudflare
// build` (`npm run preview`, `npm run deploy`, `npm run deploy:dev`, CI and the
// deploy workflow); plain `next build` / `next dev` ignore this file.
//
// Caching, so ISR and tag revalidation work on Workers:
//
// - Incremental cache: `d1OverStaticAssets` (src/lib/cache/). Entries written
//   at runtime (a regenerated /help, /pricing or /, and the tagged BuildBase
//   reads behind them) go to a D1 table in the cache database bound as
//   NEXT_TAG_CACHE_D1. Pages prerendered at build time (blog posts,
//   changelog, legal pages) are read from the Worker's static assets when D1
//   has no newer copy. Those
//   pages render MDX, which Workers cannot evaluate at request time (no
//   `new Function`), so they must keep being served from the build. R2 would
//   be OpenNext's default here, but R2 is not enabled on the account.
// - Tag cache: D1, the same cache database (table `revalidations`, created by
//   `opennextjs-cloudflare deploy`). It is not the app's database, so Prisma
//   never sees either table. `revalidateTag` from /api/webhooks/buildbase
//   lands here.
// - Queue: the memory queue re-renders a stale ISR page through
//   WORKER_SELF_REFERENCE.
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';
import d1OverStaticAssets from './src/lib/cache/d1-over-static-assets';

export default defineCloudflareConfig({
  incrementalCache: d1OverStaticAssets,
  tagCache: d1NextTagCache,
  queue: memoryQueue,
  enableCacheInterception: true,
});

import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * The database is Cloudflare D1. Prisma only needs the schema here: migrations
 * are generated as SQL with `npm run db:migration` and applied with
 * `wrangler d1 migrations apply` (see DEPLOY_CLOUDFLARE.md).
 */
export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'migrations'),
  },
  // Only Prisma's migration tooling uses this (it needs some SQLite target to
  // diff against). The app itself talks to D1 through the binding.
  datasource: {
    url: process.env.PRISMA_TOOLING_DB ?? 'file:./prisma/tooling.db',
  },
});

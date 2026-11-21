#!/usr/bin/env node
/**
 * Print the SQL that brings the local D1 database up to prisma/schema.prisma.
 *
 *   npm run db:migrate:local                       # apply existing migrations
 *   npm run db:migration > migrations/0002_x.sql   # write the next one
 *
 * Prisma's `--from-migrations` expects its own folder layout; Wrangler wants
 * flat numbered .sql files. So this diffs against the local D1 SQLite file
 * that `wrangler d1 migrations apply --local` keeps up to date.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const file = existsSync(dir)
  ? readdirSync(dir).find(
      (f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite'
    )
  : undefined;
if (!file) {
  console.error(
    'No local D1 database found. Run `npm run db:migrate:local` first.'
  );
  process.exit(1);
}

execFileSync(
  'npx',
  [
    'prisma',
    'migrate',
    'diff',
    '--from-config-datasource',
    '--to-schema',
    'prisma/schema.prisma',
    '--script',
  ],
  {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, PRISMA_TOOLING_DB: `file:${join(dir, file)}` },
  }
);

# Deploying the RenderWeld store to Cloudflare Workers

The store runs on Cloudflare Workers through
[OpenNext](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`), with
Cloudflare D1 as its database. Everything below fits the Workers **free**
plan, with the caveats at the end.

|               | Production                                                                                                           | Test ("dev")                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Worker        | `reelforge-store`                                                                                                    | `reelforge-store-dev`                                                                                    |
| URL           | https://renderweld.com                                                                                               | https://dev.renderweld.com                                                                               |
| D1 database   | `reelforge-store` (`<d1-database-id>`, account `<cloudflare-account-id>` (RenderWeld, owns the renderweld.com zone)) | `reelforge-store-dev` (`<dev-d1-database-id>`, same account)                                             |
| Old hosts     | `reelforge.buildbase.app` → 301 to https://renderweld.com (Redirect Rule, buildbase.app zone)                        | `reelforge-dev.buildbase.app` → 301 to https://dev.renderweld.com                                        |
| BuildBase org | ReelForge (`<buildbase-org-id>`), production environment (`NEXT_PUBLIC_BUILDBASE_ENVIRONMENT` empty)                 | ReelForge (`<buildbase-org-id>`), **development** environment `<dev-environment-key>` (Stripe test keys) |
| Config        | top level of `wrangler.jsonc`, `.env.production`                                                                     | `env.dev` in `wrangler.jsonc` (runtime vars), `deploy:dev` script (build-time `NEXT_PUBLIC_*`)           |
| Deployed by   | `deploy` job in `.github/workflows/deploy.yml`, after `deploy-test` succeeded                                        | `deploy-test` job in `.github/workflows/deploy.yml`                                                      |

Names in angle brackets, such as `<d1-database-id>`, stand for ids that are
not written in this repo's docs. The real values are in `wrangler.jsonc`,
`.env.production`, the Cloudflare dashboard and the BuildBase console.

## Automatic deploys (GitHub Actions)

Every push to `main` (that is, every merged pull request) runs
`.github/workflows/deploy.yml`. Other branches never deploy; run the workflow
by hand (`workflow_dispatch`) to redeploy:

1. `deploy-test`: D1 migrations on `reelforge-store-dev`, then
   `npm run deploy:dev`, then a health check of the test site.
2. `deploy` (production): runs only when `deploy-test` succeeded
   (`needs: deploy-test`). D1 migrations on `reelforge-store`, then
   `npm run deploy`, then a health check.

`.github/workflows/ci.yml` runs lint, Prettier, unit tests, the type check,
the OpenNext build and a `wrangler deploy --dry-run` bundle on every push. It
builds with the production values in `.env.production`.

Open decision (founder): deploying production from a release branch (`main`)
or a tag instead of from the working branch.

## Language

The store ships in English only for now: `locales` in `src/i18n/config.ts` is
`['en']`. The other message files (`src/i18n/messages/{ar,de,es,fr,hi,ja,zh}.ts`)
stay in the repo, unused and out of date. To bring a language back, translate
its file and add the code to `locales` again.

## Prerequisites

- Node.js 22, `npm ci`.
- A Cloudflare API token for the account, exported as `CLOUDFLARE_API_TOKEN`
  (or `npx wrangler login`). Scope it to this account: Workers Scripts edit,
  D1 edit, and Workers Routes only if a custom domain is added later.

## Where configuration lives

| Kind                                        | Where                        | Why                                                                                                                                                      |
| ------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public values (`NEXT_PUBLIC_*`, `SITE_URL`) | `.env.production`, committed | `next build` inlines `NEXT_PUBLIC_*` into the bundles, and OpenNext embeds the file so server code reads the same values at runtime. Public values only. |
| Secrets                                     | `wrangler secret put`        | Never in the repo, `.env*` files or `wrangler.jsonc`.                                                                                                    |
| Bindings (D1, assets, self-reference)       | `wrangler.jsonc`             |                                                                                                                                                          |
| Local preview secrets                       | `.dev.vars` (git-ignored)    | Placeholders only; see "Local development".                                                                                                              |

At runtime, Wrangler vars and secrets win over `.env.production`
(OpenNext only fills in keys that are not already set).

## First production deploy

```bash
npm ci
```

1. **Database tables** (the D1 database already exists):

   ```bash
   npm run db:migrate:remote
   ```

2. **Secrets** (each command prompts for the value):

   ```bash
   npx wrangler secret put BUILDBASE_CLIENT_SECRET
   npx wrangler secret put SYSTEM_SECRET
   npx wrangler secret put BUILDBASE_WEBHOOK_SECRET
   ```

   `SYSTEM_SECRET` must be at least 32 characters (`openssl rand -base64 32`).
   Optional, when used: `BUILDBASE_API_TOKEN` (console content and the
   server-rendered prices; see "Caching"),
   `BUILDBASE_CONTENT_WEBHOOK_SECRET`, `BUILDBASE_OAUTH2_CLIENT_ID`,
   `BUILDBASE_OAUTH2_CLIENT_SECRET`, `BUILDBASE_PROVISION_SECRET`.

   `BUILDBASE_PROVISION_SECRET` authenticates `/api/buildbase/provision` (a
   workflow's HTTP Webhook action). It is its own random value of at least 32
   characters, never the webhook signing key; the workflow sends it in the
   `x-provision-secret` header (a caller that can sign sends
   `x-provision-timestamp` and `x-provision-signature` instead). Without it
   the route answers 503.

   Secrets are needed at runtime only. The build validates env with
   `@t3-oss/env-nextjs`, so build with `SKIP_ENV_VALIDATION=true` (as CI does)
   rather than putting real secrets in the build environment.

3. **Build and deploy:**

   ```bash
   SKIP_ENV_VALIDATION=true npm run deploy
   ```

   If variables were also set in the Cloudflare dashboard, keep them with
   `npx opennextjs-cloudflare deploy -- --keep-vars`.

4. **BuildBase console** (ReelForge organization):
   - Auth: the OAuth client `<production-oauth-client-id>` must list
     `https://renderweld.com` as a redirect URL.
   - Settings, Webhooks: endpoint
     `https://renderweld.com/api/webhooks/buildbase`;
     its signing secret is `BUILDBASE_WEBHOOK_SECRET`.

5. **Check:**

   ```bash
   curl -s "https://renderweld.com/api/health?deep=true"
   ```

   `checks.database.status` should be `up`.

## Later deploys

```bash
SKIP_ENV_VALIDATION=true npm run deploy
```

Schema change: make sure the local D1 has every existing migration
(`npm run db:migrate:local`), edit `prisma/schema.prisma`, then write the next
migration (a diff of the schema against the local D1) and apply it locally and
remotely:

```bash
npm run -s db:migration > migrations/0002_describe_change.sql
```

```bash
npm run db:migrate:local
```

```bash
npm run db:migrate:remote
```

## Test environment ("dev")

Created and deployed by the `deploy-test` job. It points at the
**development environment** (`<dev-environment-key>`) of the ReelForge BuildBase
organization (`<buildbase-org-id>`): its own users, sign-in client
(`<development-oauth-client-id>`), webhooks and Stripe **test**
keys, so purchases there are test purchases. Server routes that call the
BuildBase HTTP API directly send `environmentId(orgId, environment)`
(`<orgId>-<dev-environment-key>`). Until 2026-11-21 the test site used a separate
"ReelForge Test" organization (`<old-test-org-id>`), kept as a
fallback while the environment was unavailable. Its D1
database is `reelforge-store-dev` (`<dev-d1-database-id>`).

Manual equivalent of what the workflow does:

```bash
npm run db:migrate:dev
```

```bash
SKIP_ENV_VALIDATION=true npm run deploy:dev
```

`deploy:dev` passes the test URL, org id and client id to the build so they
are inlined instead of the production values; `env.dev.vars` in
`wrangler.jsonc` sets the same values for server code at runtime. Keep the two
in step when one changes.

Secrets for the test Worker are set with `--env dev`, for example
`npx wrangler secret put BUILDBASE_CLIENT_SECRET --env dev` (also
`SYSTEM_SECRET` and `BUILDBASE_WEBHOOK_SECRET`). In the ReelForge Test
organization, the OAuth client must list `https://dev.renderweld.com`
as a redirect URL, and its webhook endpoint is
`https://dev.renderweld.com/api/webhooks/buildbase`.

## Local development

`npm run setup` and `npm run dev:all` do all of this; see
[DEVELOPMENT.md](DEVELOPMENT.md). By hand:

```bash
cp .dev.vars.example .dev.vars
```

```bash
npm run db:migrate:local
```

```bash
npm run dev
```

`next dev` gets a local D1 from Wrangler through
`initOpenNextCloudflareForDev()` in `next.config.ts`. To run the production
build in the Workers runtime locally:

```bash
SKIP_ENV_VALIDATION=true npm run preview
```

For `preview`, add placeholder secrets to `.dev.vars` (for example
`SYSTEM_SECRET=` any 32+ characters) and `NEXTJS_ENV=production`. Never real
ones.

## Caching (ISR and tag revalidation)

`open-next.config.ts` sets up three OpenNext overrides:

| Piece             | Where                                                                                                                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incremental cache | `src/lib/cache/d1-over-static-assets.ts`: table `incremental_cache` in the cache database for what is regenerated at runtime, then the build's prerendered copy in the static assets (blog, changelog and legal pages render MDX and must stay build-only) |
| Tag cache         | OpenNext's D1 tag cache, table `revalidations` in the same database (created by `opennextjs-cloudflare deploy`)                                                                                                                                            |
| Queue             | The memory queue: a stale page is re-rendered through `WORKER_SELF_REFERENCE`                                                                                                                                                                              |

The cache databases are `reelforge-store-tag-cache`
(`<tag-cache-database-id>`, production) and
`reelforge-store-dev-tag-cache` (`<dev-tag-cache-database-id>`,
test), bound as `NEXT_TAG_CACHE_D1`. They are separate from the app's
database so Prisma migrations never see their tables. Both tables are created
on first use if missing. Cache keys include the build id, so each deploy
starts from the build's own copy.

What refreshes what (`src/lib/cache/webhook-tags.ts`, called by
`/api/webhooks/buildbase`, which the console sends every event to):

- `item.*`: tag `store:items`, the server read of published items on `/` and
  `/pricing` (prices, Offer JSON-LD, the hero buttons).
- Content events (`faq.updated`, `faq_collection.updated`,
  `rich_content.updated`, `doc.*`, ...): the SDK's `buildbase:*` tags, so
  `/help`, the FAQ sections and the content blocks.
- `blog.*` (a post published, edited, unpublished or deleted): tag
  `buildbase:blog`, plus the paths `/blog`, its feed, the post's page and
  `/sitemap.xml`. Blog posts live in the `blog` folder.
  `scripts/content/migrate-blog-to-buildbase.mjs` moved the old posts in.
- `collection.record_*` and `collection.version_published` on the
  collection `changelog`: tag `buildbase:collection:changelog`, plus
  `/changelog`, its feed and `/sitemap.xml`. Release notes are records of
  that collection (title, slug, date, version, description, rich-text
  content, share image URL, published); only `published: true` records are
  shown (`src/lib/blog/changelog.ts`).

### What each environment needs for CMS content

Every content read (blog, changelog, docs, FAQs, content blocks, gallery,
server-rendered prices) is a server read with an org API token; BuildBase has
no browser read path for content. API keys belong to one environment, so
each Worker needs a key of its own environment:

| Worker                                     | BuildBase environment                 | Secret                                                                                   |
| ------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `reelforge-store` (renderweld.com)         | production                            | `BUILDBASE_API_TOKEN` = `<buildbase-org-id>:<secret>`                                    |
| `reelforge-store-dev` (dev.renderweld.com) | development (`<dev-environment-key>`) | `BUILDBASE_API_TOKEN` = `<buildbase-org-id>-<dev-environment-key>:<secret>`, `--env dev` |

1. In the console, in that environment: **Settings**, **API keys**,
   **Create API key**, role **content-reader**, **App-server key**. The key
   is shown once.
2. `npx wrangler secret put BUILDBASE_API_TOKEN` (add `--env dev` for the
   test Worker) and paste it at the prompt, never on the command line.
   Server-rendered prices also read `marketplace_items`, which
   content-reader does not cover: for those, give the key a custom API role
   with the content-reader permissions plus `marketplace_items` read. With
   content-reader alone, prices keep their browser read.
3. Revalidation needs no new secret: the existing endpoint
   `<site>/api/webhooks/buildbase` (signing secret `BUILDBASE_WEBHOOK_SECRET`)
   is subscribed to every event (`*`) in both environments, content events
   included. `/api/webhooks/content` (`BUILDBASE_CONTENT_WEBHOOK_SECRET`) is
   only for a separate content-only endpoint and stays unset. Without a
   webhook, edits still show after `CONTENT_REVALIDATE_SECONDS` (one hour).

Without the token the pages still work: FAQs and blocks use their local
defaults, prices are read in the browser, and the blog, changelog and docs
are empty (docs say so on the page).

## How the Cloudflare port works

- **Database:** Prisma 7 with `@prisma/adapter-d1`. The client is generated
  for the Workers runtime into `src/generated/prisma` (`npm install` runs
  `prisma generate`). `src/lib/db.ts` resolves the D1 binding per request
  through `getCloudflareContext()`; `prisma` is a proxy so existing
  `prisma.user.findMany()` calls are unchanged. Audit-log writes are handed
  to `ctx.waitUntil` so they are not cut off when the response is sent.
- **Migrations:** SQL files in `migrations/`, generated with
  `prisma migrate diff` and applied by `wrangler d1 migrations apply`.
- **Content:** the blog is BuildBase Blogs (folder `blog`), the changelog
  the collection `changelog` and the docs BuildBase Docs (published from the
  studio repository, D-080), read on the server and rendered from Markdown
  to sanitised HTML (`src/lib/content/rich-text.ts`); the legal pages are
  Markdown in `src/content/pages/`. Nothing evaluates code at runtime, so
  the CSP has no `'unsafe-eval'` (Contentlayer, which needed it, is gone).
- **Bundle size:** `next.config.ts` excludes the Prisma CLI, its dev database
  (PGlite) and the query compilers for other databases from the server
  trace. Without that the Worker was
  73.6 MiB, over Cloudflare's 64 MiB limit; with it, 30.0 MiB
  (7.6 MiB gzipped), measured with
  `npx wrangler deploy --dry-run --outdir /tmp/wdry`.

## Known limits and risks

- **CPU time on the free plan is 10 ms per request.** Server-rendered pages
  may exceed it under real traffic; a request over the limit fails with error 1102. Local preview cannot measure this. After deploying, watch CPU time in
  the Worker's observability tab. Workers Paid ($5/month) raises the limit.
- **Middleware:** Next.js 16's `proxy.ts` runs as Node.js middleware, which
  OpenNext marks experimental on Cloudflare.
- **D1 transactions:** `prisma.$transaction([...])` is not atomic on D1; the
  statements run one after another.
- **ISR cache in D1:** `/`, `/pricing` and `/help` are ISR pages
  (`revalidate = 3600`) refreshed by tag from `/api/webhooks/buildbase`. The
  incremental and tag caches live in their own D1 database (binding
  `NEXT_TAG_CACHE_D1`; see "Caching" above). Every cached page read is a D1
  query (free plan: 5 million reads and 100,000 writes a day), and D1 runs in
  one region, so a cached page can be slower far from it. R2 would be
  OpenNext's default; it is not enabled on the account.
- **Sentry:** leave `NEXT_PUBLIC_SENTRY_DSN` unset for Workers builds;
  `@sentry/nextjs` does not target workerd.
- **Custom JSX in MDX** (`<Callout>`, `<WhenAuthenticated>`) is missing from
  the server HTML and appears only after the page loads in the browser.

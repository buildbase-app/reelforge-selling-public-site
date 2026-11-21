# Deploying the ReelForge store to Cloudflare Workers

The store runs on Cloudflare Workers through
[OpenNext](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`), with
Cloudflare D1 as its database. Everything below fits the Workers **free**
plan, with the caveats at the end.

|               | Production                                                                                                 | Test ("dev")                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Worker        | `reelforge-store`                                                                                          | `reelforge-store-dev`                                                                                         |
| URL           | https://reelforge.buildbase.app                                                                            | https://reelforge-dev.buildbase.app                                                                           |
| D1 database   | `reelforge-store` (`db8c0262-90be-47d0-8bf3-84ce75365682`, account `0109f7bce7af42ac8a88104d324efe4d`)     | `reelforge-store-dev` (`319f3e96-5c82-488e-92bf-3f7fcc794dcf`, same account)                                  |
| BuildBase org | ReelForge (`6b01478bb42d2c444e99fcd8`), production environment (`NEXT_PUBLIC_BUILDBASE_ENVIRONMENT` empty) | ReelForge Test (`6b016b04b42d2c444e9a13b9`, Stripe test keys), its production environment (environment empty) |
| Config        | top level of `wrangler.jsonc`, `.env.production`                                                           | `env.dev` in `wrangler.jsonc` (runtime vars), `deploy:dev` script (build-time `NEXT_PUBLIC_*`)                |
| Deployed by   | `deploy` job in `.github/workflows/deploy.yml`, after `deploy-test` succeeded                              | `deploy-test` job in `.github/workflows/deploy.yml`                                                           |

## Automatic deploys (GitHub Actions)

Every push to `claude/eloquent-wright-tm3cs7` runs `.github/workflows/deploy.yml`:

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
   Optional, when used: `BUILDBASE_API_TOKEN` (help center content),
   `BUILDBASE_CONTENT_WEBHOOK_SECRET`, `BUILDBASE_OAUTH2_CLIENT_ID`,
   `BUILDBASE_OAUTH2_CLIENT_SECRET`.

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
   - Auth: the OAuth client `XUlR38I2gOAZOCpxleNxgPURGpHlzsykAMwypHS8` must list
     `https://reelforge.buildbase.app` as a redirect URL.
   - Settings, Webhooks: endpoint
     `https://reelforge.buildbase.app/api/webhooks/buildbase`;
     its signing secret is `BUILDBASE_WEBHOOK_SECRET`.

5. **Check:**

   ```bash
   curl -s "https://reelforge.buildbase.app/api/health?deep=true"
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
**ReelForge Test** BuildBase organization (`6b016b04b42d2c444e9a13b9`), which
uses Stripe test keys, so purchases there are test purchases. Its D1
database is `reelforge-store-dev` (`319f3e96-5c82-488e-92bf-3f7fcc794dcf`).

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
organization, the OAuth client must list `https://reelforge-dev.buildbase.app`
as a redirect URL, and its webhook endpoint is
`https://reelforge-dev.buildbase.app/api/webhooks/buildbase`.

## Local development

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

## How the Cloudflare port works

- **Database:** Prisma 7 with `@prisma/adapter-d1`. The client is generated
  for the Workers runtime into `src/generated/prisma` (`npm install` runs
  `prisma generate`). `src/lib/db.ts` resolves the D1 binding per request
  through `getCloudflareContext()`; `prisma` is a proxy so existing
  `prisma.user.findMany()` calls are unchanged. Audit-log writes are handed
  to `ctx.waitUntil` so they are not cut off when the response is sent.
- **Migrations:** SQL files in `migrations/`, generated with
  `prisma migrate diff` and applied by `wrangler d1 migrations apply`.
- **MDX:** Workers forbid `new Function`, which Contentlayer's MDX runtime
  needs. Contentlayer now also renders every body to static HTML at build
  time (`bodyHtml`); the server sends that HTML and the browser swaps in the
  full MDX component after hydration (`mdx-renderer.tsx`).
- **Bundle size:** `next.config.ts` excludes the Prisma CLI, its dev database
  (PGlite), the query compilers for other databases and a build-only
  Contentlayer dependency from the server trace. Without that the Worker was
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
- **No incremental cache yet:** ISR/revalidation data is not persisted across
  Worker instances until an R2 bucket is added (R2 is not enabled on the
  account). See `open-next.config.ts`.
- **Sentry:** leave `NEXT_PUBLIC_SENTRY_DSN` unset for Workers builds;
  `@sentry/nextjs` does not target workerd.
- **Custom JSX in MDX** (`<Callout>`, `<WhenAuthenticated>`) is missing from
  the server HTML and appears only after the page loads in the browser.

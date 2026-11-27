# Developer setup

How to run the RenderWeld site (this repository, the store formerly called
RenderWeld store) on your own machine. Two commands cover the usual case:

```bash
npm run setup     # check prerequisites, install, write local config, create the local database
npm run dev:all   # run the site on http://localhost:3000
```

Both are safe to run again. Everything else on this page is for when you
need more than that, or when something goes wrong.

|                       | URL                           | Runs                                                       | BuildBase environment                      |
| --------------------- | ----------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| Your machine          | http://localhost:3000         | `npm run dev:all` (`next dev`) or `-- --preview` (workerd) | development (`fsyqdskf`)                   |
| Test site             | https://dev.renderweld.com    | Worker `reelforge-store-dev`                               | development (`fsyqdskf`), Stripe test keys |
| Production            | https://renderweld.com        | Worker `reelforge-store`                                   | production                                 |
| Old hosts (redirects) | reelforge(-dev).buildbase.app | 301 to the matching renderweld.com host                    |                                            |

## Contents

- [What `npm run setup` does](#what-npm-run-setup-does)
- [What `npm run dev:all` does](#what-npm-run-devall-does)
- [Operating systems](#operating-systems): macOS, Linux, Windows (WSL2), Node version managers
- [BuildBase credentials](#buildbase-credentials): with and without, dev vs production
- [Local configuration files](#local-configuration-files)
- [Database (D1)](#database-d1): local vs remote, resetting
- [`next dev` vs `npm run preview`](#next-dev-vs-npm-run-preview)
- [Tests and checks](#tests-and-checks)
- [Deploying](#deploying)
- [Corporate proxies](#corporate-proxies)
- [Common errors](#common-errors)
- [Working on the studio and the site together](#working-on-the-studio-and-the-site-together)

## What `npm run setup` does

`scripts/dev/setup.mjs`, idempotent and never interactive:

1. **Checks prerequisites** and prints a fix for each problem: Node >= 22.12
   (`.nvmrc` says `22`; Wrangler needs 22.12), npm >= 10, free disk (about
   3 GB: `node_modules` is ~2 GB, a build ~1 GB), port 3000, Playwright
   browsers (optional, e2e only), and a stray `.env.local` or `.env`.
   Wrangler is a dev dependency (`node_modules/.bin/wrangler`): no global
   install, no `wrangler login` for local work.
2. **Installs** with `npm ci`. It is skipped when `package-lock.json` has not
   changed since the last setup; delete `node_modules` to force it.
   `postinstall` generates the Prisma client into `src/generated/`.
3. **Writes `.env.development.local`** (git-ignored, mode 600) for the
   BuildBase **development** environment: organization
   `6b01478bb42d2c444e99fcd8`, environment `fsyqdskf`, its public sign-in
   client `gqLbQtwsNKyzl2dKtx7v2u2GVAhP6AzPpAe1GvL7`, redirect URL
   `http://localhost:3000`, and a `SYSTEM_SECRET` generated on your machine.
   The secrets you must bring yourself are left empty
   ([BuildBase credentials](#buildbase-credentials)). It also copies
   `.dev.vars.example` to `.dev.vars` (`NEXTJS_ENV=development`).
4. **Creates the local database**: `wrangler d1 migrations apply DB --local`
   (`npm run db:migrate:local`), into `.wrangler/state/`.

Flags (after `--`, for example `npm run setup -- --force`):

| Flag             | Effect                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--force`        | Rewrites `.env.development.local` and `.dev.vars`. Old copies are kept as `*.bak`; your secrets are carried over. |
| `--skip-install` | No `npm ci`.                                                                                                      |
| `--skip-db`      | No local migrations.                                                                                              |
| `--check`        | Only checks prerequisites; changes nothing.                                                                       |

An existing file is never overwritten without `--force`. Secrets can be
handed to a first run (or a `--force` run) through the environment, for
example from a password manager, and are written into the git-ignored file,
never printed:

```bash
BUILDBASE_CLIENT_SECRET="$(op read op://dev/renderweld-dev-client/secret)" npm run setup -- --force
```

## What `npm run dev:all` does

`scripts/dev/dev-all.mjs`:

1. Refuses to start when port 3000 is taken (the redirect URL on the BuildBase
   client is `http://localhost:3000`, so the port is fixed) and says how to
   find the process.
2. Applies any new D1 migration to the local database (`--skip-db` to skip).
3. Starts `next dev --turbopack --port 3000`. Without
   `.env.development.local` it still starts, with the public development
   values and `SKIP_ENV_VALIDATION=true`.
4. Waits for the first response and prints the URLs (site, `/pricing`,
   `/agents`, `/api/mcp`, `/api/health?deep=true`), what works with your
   credentials, how to receive webhooks, and whether a studio checkout was
   found.

`npm run dev:all -- --preview` instead builds the site for Cloudflare Workers
(`opennextjs-cloudflare build`, a few minutes, about 3 GB in `.next` and
`.open-next`) and serves it with `wrangler dev` on the same port. Add
`--no-build` to serve the last build again. See
[`next dev` vs `npm run preview`](#next-dev-vs-npm-run-preview).

Ctrl-C stops everything, including the wrangler and workerd processes under
the preview; so does SIGTERM (what the studio's `both.sh` sends).

Webhooks: BuildBase cannot call `localhost`. To receive them, expose the dev
server with a tunnel (`cloudflared tunnel --url http://localhost:3000`, or
ngrok), register `<tunnel URL>/api/webhooks/buildbase` as a webhook endpoint
in the console (development environment), and put that endpoint's signing
secret in `BUILDBASE_WEBHOOK_SECRET`. Remove the endpoint when you are done.

## Operating systems

**macOS** (Apple silicon or Intel): install Node 22 with a version manager
(below) or `brew install node@22`. Xcode command line tools are not needed.

**Linux**: a distribution with glibc 2.35 or newer, which Wrangler's runtime
(workerd) needs: Ubuntu 22.04+, Debian 12+, Fedora 36+. For e2e tests,
`npx playwright install --with-deps chromium` also installs the system
libraries Chromium needs. If `next dev` stops seeing file changes, raise the
watcher limit (see [Common errors](#common-errors)).

**Windows**: use **WSL2** (Ubuntu) and keep the clone inside the Linux file
system (`~/code/...`, not `/mnt/c/...`): file watching and `npm ci` are many
times slower across the boundary, and workerd does not run on WSL1. Install
Node inside WSL with nvm. Open `http://localhost:3000` in your Windows browser
as usual: WSL2 forwards localhost. The setup scripts are written to run on
native Windows (PowerShell) too, but that is untested; prefer WSL2.

**Node version managers**: `.nvmrc` holds `22`.

| Manager                              | Command                                     |
| ------------------------------------ | ------------------------------------------- |
| [nvm](https://github.com/nvm-sh/nvm) | `nvm install && nvm use`                    |
| [fnm](https://github.com/Schniz/fnm) | `fnm use --install-if-missing`              |
| [Volta](https://volta.sh)            | `volta install node@22`                     |
| [mise](https://mise.jdx.dev)         | `mise use node@22`                          |
| Homebrew                             | `brew install node@22 && brew link node@22` |

Node 24 also works. Node 20 does not (Wrangler needs 22.12 or newer).

## BuildBase credentials

### What works without any credentials

Right after `npm run setup`, with nothing filled in:

| Works                                                                    | Needs a secret                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Marketing pages: `/`, `/pricing`, `/agents`, `/gallery`, legal, contact  | Sign-in, the dashboard, licences, checkout: `BUILDBASE_CLIENT_SECRET`          |
| Prices, read in the browser from the development environment's items     | Server-rendered prices and Offer JSON-LD: `BUILDBASE_API_TOKEN`                |
| FAQs and content blocks from their local defaults                        | FAQs, blocks, docs, blog and changelog from the console: `BUILDBASE_API_TOKEN` |
| `/api/health`, `/llms.txt`, `/openapi.json`, the MCP discovery documents | Webhooks: `BUILDBASE_WEBHOOK_SECRET` and a tunnel                              |

Without a client secret the env file sets `SKIP_ENV_VALIDATION=true`, because
`src/env.ts` refuses to start without `BUILDBASE_CLIENT_SECRET`.

### Getting your own development secrets

All of them come from the BuildBase console
(https://console.buildbase.app), organization `6b01478bb42d2c444e99fcd8`,
switched to the **development** environment `fsyqdskf`. Ask a maintainer to
invite you if you cannot open it. Never use production secrets locally.

| Variable                   | Where in the console                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `BUILDBASE_CLIENT_SECRET`  | Auth, the client `gqLbQtwsNKyzl2dKtx7v2u2GVAhP6AzPpAe1GvL7`, its secret                                                    |
| `BUILDBASE_API_TOKEN`      | Settings, API keys: an app-server key whose role has the content-reader permissions and `marketplace_items` read. Optional |
| `BUILDBASE_WEBHOOK_SECRET` | Settings, Webhooks: the signing secret of the endpoint you registered for your tunnel. Optional                            |

Then:

1. Put the values in `.env.development.local` (or rerun setup with them in
   the environment and `--force`).
2. Delete the `SKIP_ENV_VALIDATION=true` line, so a missing value fails loudly.
3. **Add localhost to the development client** (once per client, by someone
   with console access): on the client
   `gqLbQtwsNKyzl2dKtx7v2u2GVAhP6AzPpAe1GvL7`, add `http://localhost:3000` to
   the redirect URLs and to the allowed origins. Without it the hosted
   sign-in page refuses to send you back to localhost.
4. Restart `npm run dev:all`.

Sign-ups on the development environment are in test mode: no mail is sent
and the verification code is `424242`. Pay with Stripe test card
`4242 4242 4242 4242`, any future date, any CVC.

### Development vs production BuildBase environments

The organization has two environments with separate users, clients, webhooks
and Stripe keys:

|                                     | development                                | production                                 |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `NEXT_PUBLIC_BUILDBASE_ENVIRONMENT` | `fsyqdskf`                                 | empty                                      |
| Sign-in client                      | `gqLbQtwsNKyzl2dKtx7v2u2GVAhP6AzPpAe1GvL7` | `XUlR38I2gOAZOCpxleNxgPURGpHlzsykAMwypHS8` |
| Used by                             | localhost, dev.renderweld.com              | renderweld.com                             |
| Payments                            | Stripe test mode                           | real money                                 |

Local work always uses development. Pointing a local server at production
means real customers' data and real charges; don't. To reproduce a
production-only problem, use the production build (`npm run preview`) with
the development environment, or read the production Worker's logs.

## Local configuration files

| File                     | Committed | Read by                                           | Holds                                                                   |
| ------------------------ | --------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| `.env.production`        | yes       | `next build` (all builds, CI, deploys)            | Public production values only                                           |
| `.env.example`           | yes       | nobody                                            | The list of every variable, documented                                  |
| `.env.development.local` | no        | `next dev`; the local preview Worker              | Your local values and secrets (written by setup)                        |
| `.dev.vars`              | no        | Wrangler (`next dev` bindings, `npm run preview`) | `NEXTJS_ENV=development`, so the preview reads `.env.development.local` |

Why `.env.development.local` and not `.env.local`: Next.js loads `.env.local`
in `next build` too, where it overrides `.env.production`, and OpenNext embeds
it into the Worker. A `.env.local` with development values would leak into any
build made on your machine. `.env.development.local` is only read in
development. Setup warns when it finds a `.env.local` or `.env`.

OpenNext embeds every `.env*` file it finds into a build's Worker bundle (one
set per `NEXTJS_ENV` mode). That is harmless for a local preview, and another
reason why nobody deploys from a laptop.

## Database (D1)

The app's database is Cloudflare D1 through Prisma (`src/lib/db.ts`), bound as
`DB` in `wrangler.jsonc`. The OpenNext caches use a second database,
`NEXT_TAG_CACHE_D1`, whose tables are created on first use.

**Local** (default): `next dev` and `npm run preview` use a SQLite file under
`.wrangler/state/v3/d1/`, created by Wrangler. Nothing leaves your machine.

```bash
npm run db:migrate:local                       # apply new migrations (setup and dev:all do this)
npx wrangler d1 execute DB --local --command "SELECT id, email FROM User LIMIT 5"
```

**Reset the local database** (stop the dev server first):

```bash
rm -rf .wrangler/state && npm run db:migrate:local
```

**Remote** databases are the deployed sites' data. You only need them to look
at the test site's data, with an account that has access to the RenderWeld
Cloudflare account (`npx wrangler login`):

```bash
npx wrangler d1 execute reelforge-store-dev --remote --env dev --command "SELECT count(*) FROM User"
```

Read-only queries only. Migrations are applied to remote databases by the
deploy workflow, never by hand (except the documented first-deploy steps in
`DEPLOY_CLOUDFLARE.md`), and production (`reelforge-store`) is not queried
from laptops.

**Schema change**: edit `prisma/schema.prisma`, then
`npm run -s db:migration > migrations/000N_describe_change.sql`, then
`npm run db:migrate:local`. The deploy applies it to the test and production
databases after merge.

## `next dev` vs `npm run preview`

|            | `npm run dev:all` (`next dev`)                  | `npm run dev:all -- --preview` / `npm run preview`                                               |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Runtime    | Node.js, with D1 from Wrangler's platform proxy | workerd, the Cloudflare Workers runtime, as in production                                        |
| Code       | Development build, hot reload                   | Production build (OpenNext), no hot reload                                                       |
| Start time | Seconds (first page compile 10-60 s)            | A few minutes per change                                                                         |
| Disk       | `.next` (~1 GB)                                 | `.next` and `.open-next` (~3 GB)                                                                 |
| Caching    | Next's dev behaviour, no ISR                    | The real incremental and tag caches in local D1                                                  |
| Use it for | Almost everything                               | Workers-only bugs, middleware (`src/proxy.ts`), CSP, caching, bundle size, before a risky deploy |

`npm run dev:all -- --preview` builds with the development values from
`.env.development.local` inlined into the browser bundle, serves on port 3000,
and the Worker reads the same file at runtime (`.dev.vars` sets
`NEXTJS_ENV=development`), so sign-in works there too. Plain `npm run preview`
inlines `.env.production` (the production client and renderweld.com URLs)
while the local Worker still reads `.env.development.local`, and serves on
port 8787: fine for looking at pages exactly as CI builds them, not for
signing in. Either way, delete `.next` and `.open-next` afterwards if disk is
tight.

## Tests and checks

The checks a pull request must pass (AGENTS.md):

```bash
npm run typecheck && npm run lint && npm test && npx prettier --check .
```

| What                    | Command                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Unit tests (Vitest)     | `npm test` (`npm run test:watch` while working); files in `src/__tests__/`                     |
| Production build        | `npm run build` (plain Next) or `npx opennextjs-cloudflare build` (what CI builds)             |
| End-to-end (Playwright) | `npx playwright install chromium` once, then `npx playwright test --project=chromium`          |
| First-load JS budget    | `npm run build && npm run check:bundle` (marketing pages <= 150 KB gzip)                       |
| One page's JS, live     | `node scripts/perf/first-load-js.mjs http://localhost:3000 / /pricing` against a running build |
| MCP tool count          | `npm run check:mcp-tools`                                                                      |
| Buyer journeys          | `npm run e2e:buyer`, `npm run e2e:personal` (test site only, see below)                        |

**End-to-end tests** start `npm run dev` themselves on port 3000 (or reuse a
running server), so stop `dev:all` first or leave it running. The browser is
the one pinned by `@playwright/test` in `package-lock.json`;
`npx playwright install chromium` downloads exactly that build (on Linux add
`--with-deps` the first time). Firefox and WebKit projects exist too: drop
`--project` and run `npx playwright install` to get all three. The specs fake
sign-in (`e2e/fake-sign-in.ts`) and need no credentials.

**Buyer journeys** (`scripts/e2e-*.cjs`) sign up a fresh test account on the
development environment and buy or claim a licence with Stripe test keys.
They refuse any site other than the test site; point them at your machine
with `SITE=http://localhost:3000 ALLOW_NON_TEST_SITE=1` once you have a client
secret configured. Never against production.

**`check:mcp-tools`** compares `src/data/mcp-tools.json` with the studio's
generated tool reference (`docs/public/mcp/tools.md`). It reads, in order:

1. `STUDIO_REPO_DIR`, when set (an error if the file is not there);
2. `../reelforge-studio`, when that checkout exists;
3. the studio's `main` branch on GitHub (what CI does).

```bash
STUDIO_REPO_DIR=~/code/reelforge-studio npm run check:mcp-tools
npm run check:mcp-tools -- --github          # always compare with studio main
node scripts/agents/refresh-mcp-tools.mjs    # rewrite mcp-tools.json from the same source
```

A local checkout on another branch can disagree with `main`: the script
prints which checkout and commit it read.

**Lighthouse** (mobile >= 90, LCP <= 2.0 s, CLS <= 0.05) is measured against
the production build: `npm run dev:all -- --preview`, then Chrome DevTools,
Lighthouse, mobile. `next dev` numbers are meaningless.

## Deploying

You do not deploy from your machine. Merging a pull request into `main` runs
`.github/workflows/deploy.yml`:

1. `deploy-test`: `wrangler d1 migrations apply reelforge-store-dev --remote --env dev`,
   then `npm run deploy:dev`, then a health check. That is
   https://dev.renderweld.com.
2. `deploy` (only after `deploy-test` succeeded): migrations on
   `reelforge-store`, `npm run deploy`, health check. That is
   https://renderweld.com.

Builds use `SKIP_ENV_VALIDATION=true` and a throwaway `SYSTEM_SECRET`; the real
secrets are read by the Worker at runtime. The only repository secret is
`CLOUDFLARE_API_TOKEN`. The Cloudflare account is RenderWeld
(`f12121a39fc6f6eb348d486bc2e282b4`, `account_id` in `wrangler.jsonc`), which
owns the `renderweld.com` zone.

| Worker                | URL                        | Runtime secrets (`wrangler secret put`)                                                                                                                                                      |
| --------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reelforge-store`     | https://renderweld.com     | `BUILDBASE_CLIENT_SECRET` (production client), `SYSTEM_SECRET`, `BUILDBASE_WEBHOOK_SECRET`; optional `BUILDBASE_API_TOKEN`, `BUILDBASE_CONTENT_WEBHOOK_SECRET`, `BUILDBASE_PROVISION_SECRET` |
| `reelforge-store-dev` | https://dev.renderweld.com | The same names with `--env dev`, holding the development environment's values                                                                                                                |

Rules:

- **Never change production secrets from a laptop.** A maintainer with access
  to the RenderWeld account sets them, following `DEPLOY_CLOUDFLARE.md`, and
  says so in the pull request or issue. Rotating one is a deliberate, recorded
  change, never a debugging step.
- `npm run deploy:dev` exists for maintainers when the workflow is down. It
  builds with the development values inlined. Run it only from a clean
  checkout of `main` (no `.env.local`, `.env` or `.env.development.local`
  with secrets in it: OpenNext embeds them), with `SKIP_ENV_VALIDATION=true`.
- `npm run deploy` (production) is run by the workflow only.
- Rerun a deploy from the Actions tab (`workflow_dispatch`), not locally.

`DEPLOY_CLOUDFLARE.md` has the full picture: first deploy, caching, the free
plan's limits.

## Corporate proxies

npm, Wrangler, Playwright's installer and the e2e scripts honour
`HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY`. If your proxy re-signs TLS, Node
needs its root certificate:

```bash
export HTTPS_PROXY=http://proxy.example.internal:3128
export NO_PROXY=localhost,127.0.0.1
export NODE_EXTRA_CA_CERTS=/path/to/corporate-root-ca.pem
npm config set cafile /path/to/corporate-root-ca.pem   # npm ci
```

Keep `localhost` in `NO_PROXY`, or the dev server's own requests (and the
health check `dev:all` makes) go to the proxy. Behind a proxy, Wrangler prints
`Proxy environment variables detected` and, when it cannot reach
Cloudflare, ``Unable to fetch the `Request.cf` object! Falling back to a
default placeholder`` followed by `Error: Request was cancelled.`: harmless,
the local Worker uses placeholder geolocation data. Never turn TLS verification off
(`NODE_TLS_REJECT_UNAUTHORIZED=0`, `strict-ssl=false`).

## Common errors

**`❌ Invalid environment variables:` ... `BUILDBASE_CLIENT_SECRET is required`**
(or `SYSTEM_SECRET must be at least 32 characters for security`), then
`Error: Invalid environment variables`. `src/env.ts` validates at startup.
Fill the value in `.env.development.local`, or put `SKIP_ENV_VALIDATION=true`
back to run the marketing pages without credentials. A short or example
`SYSTEM_SECRET`: `npm run setup -- --force` generates a new one.

**A file in `public/` answers 404**, or a request lands on `/en/<file>`. The
locale middleware (`src/proxy.ts`) rewrites every path that its `matcher`
does not exclude to `/en/...`. Only the listed extensions (`svg`, `png`, `jpg`,
`webp`, `avif`, `mp4`, `webm`, `woff2`, ...) and named files (`robots.txt`,
`llms.txt`, ...) are excluded. Add the new extension or file name to the
`matcher` in `src/proxy.ts`. The same applies to new route handlers at the root
such as `/something.txt`.

**`D1 binding "DB" is missing. Check d1_databases in wrangler.jsonc.`** or
**`No Cloudflare context: the database is only available while handling a request`**.
The binding comes from `wrangler.jsonc` through
`initOpenNextCloudflareForDev()` at the end of `next.config.ts`. Run the app
with `npm run dev:all` (or `npm run dev`) from the repository root, not
`npx next` from elsewhere, and check that `wrangler.jsonc` was not changed.

**`no such table: User`** (or another table) **: SQLITE_ERROR**: the local
database has no tables yet. `npm run db:migrate:local`, or reset it (see
[Database](#database-d1)).

**`Port 3000 is already in use`** (from `dev:all`) or
**`Error: listen EADDRINUSE: address already in use :::3000`** (from Next):
another dev server, often a forgotten one, or the studio. Find it with
`lsof -nP -iTCP:3000 -sTCP:LISTEN` (macOS, Linux, WSL) or
`netstat -ano | findstr :3000` (Windows) and stop it. The port stays 3000
because it is the registered redirect URL.

**`npm warn EBADENGINE Unsupported engine`** for `wrangler`, or Wrangler
refusing to start on an old Node: switch to Node 22 (`nvm use`).

**`Cannot find module '@/generated/prisma/client'`**: the Prisma client was
not generated (an install with `--ignore-scripts`). Run `npx prisma generate`.

**`ENOSPC: System limit for number of file watchers reached`** (Linux, WSL):
`echo fs.inotify.max_user_watches=524288 | sudo tee /etc/sysctl.d/90-watches.conf && sudo sysctl --system`.

**`ENOSPC: no space left on device`** during a build: delete `.next/` and
`.open-next/` (both are rebuilt), and old clones' `node_modules/`.

**`SELF_SIGNED_CERT_IN_CHAIN`**, **`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`**: a
proxy re-signs TLS. See [Corporate proxies](#corporate-proxies).

**The hosted sign-in page refuses to return to localhost** (an error about the
redirect URL or origin): `http://localhost:3000` is not yet a redirect URL and
allowed origin on the development client. See
[Getting your own development secrets](#getting-your-own-development-secrets).
After sign-in you land on `https://dev.renderweld.com` instead: your
`NEXT_PUBLIC_BUILDBASE_REDIRECT_URL` is not `http://localhost:3000`.

**`The entry-point file at ".open-next/worker.js" was not found`**: `wrangler dev`
ran without a build. Use `npm run dev:all -- --preview` or `npm run preview`,
which build first.

**`[ERROR] Launch price note: content block unusable, built-in note shown`**
(and similar lines for other content blocks) without `BUILDBASE_API_TOKEN`:
expected. The page uses its built-in fallback; the log line is loud by design
so a broken block is noticed in production.

**`The following page files do not match any complete route`**, then 404 for
`/pricing`, `/order` and `/dashboard` under `next dev`: Next 16.4's dev server
checks parallel-route slots without their `default.tsx`. `next.config.ts`
turns on `deprecated.looseRouteMatching` for development only; if you see
this, check that setting is still there. `next build` is not affected.

**`AGENTS.md` shows up as modified after `next dev`**: Next 16.4 appends a
"nextjs-agent-rules" block unless `agentRules: false` is set in
`next.config.ts` (it is). Discard the change (`git checkout AGENTS.md`); never
commit it.

**Webhook deliveries fail or `/api/webhooks/buildbase` answers 503**: no
`BUILDBASE_WEBHOOK_SECRET`, or BuildBase is trying to reach `localhost`. See
the tunnel note in [What `npm run dev:all` does](#what-npm-run-devall-does).

## Working on the studio and the site together

The site shows facts that come from the studio (the MCP tool list, demo reels,
walkthrough videos), so it is common to have both checked out side by side:

```
~/code/
  reelforge-studio/              # buildbase-app/reelforge-studio
  reelforge-selling-public-site/ # this repository
```

The studio's
[`scripts/dev/both.sh`](https://github.com/buildbase-app/reelforge-studio/blob/main/scripts/dev/both.sh)
clones both repositories next to each other, runs each one's setup (here:
`npm run setup`) and starts both (here: `npm run dev:all`, port 3000). The
studio's own setup and ports are in its `DEVELOPMENT.md`.

In this repository, `STUDIO_REPO_DIR` (default `../reelforge-studio`) is the
studio checkout that anything reading studio docs uses, today
`npm run check:mcp-tools` and `node scripts/agents/refresh-mcp-tools.mjs`.
`dev:all` prints whether it found one. The README section "Product pages,
demo reels and the tool list" explains how the demo reels and walkthroughs
are made from a running studio.

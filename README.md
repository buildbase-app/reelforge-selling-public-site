# ReelForge store

The public site for **ReelForge**, a self-hosted short-form video studio
(Remotion + Motion Canvas). This is where people learn about ReelForge, sign
in, buy it, and later download releases and manage their licenses. The product
itself lives in a separate private repository.

Built with Next.js 16 on [BuildBase](https://buildbase.app) (sign-in,
workspaces, billing, notifications) and deployed to Cloudflare Workers with
OpenNext. See `DEPLOY_CLOUDFLARE.md`.

> **Status:** started from the BuildBase Next.js starter. The BuildBase demo
> (guided tour, Documents, links, collections, automations, tracking, reports,
> credits, usage and permissions pages) has been removed. Product pages,
> checkout, license keys and downloads are still to be built. Marketing copy
> and translations still describe the starter in places.

## What is in here

| Area                                                                                          | Where                                                                              |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Marketing: home, pricing, blog, changelog, help, legal                                        | `src/app/[locale]/...`, `src/content/` (MDX via Contentlayer)                      |
| Sign-in and session (BuildBase hosted pages, httpOnly cookie)                                 | `src/components/saas-provider.tsx`, `src/app/api/auth/*`, `src/lib/server-auth.ts` |
| Customer dashboard: team, invoices, profile, security, settings, notifications, inbox, events | `src/app/[locale]/dashboard/*`                                                     |
| Org-API modules kept: assets, audience (waitlist), forms (contact)                            | `src/app/[locale]/dashboard/{assets,audience,forms}`, `src/app/api/*`              |
| Mirroring BuildBase into the database (SDK events, signed webhooks)                           | `src/app/api/events`, `src/app/api/webhooks/buildbase`                             |
| Agents: MCP server at `/api/mcp`, OAuth discovery, `llms.txt`, `openapi.json`                 | `src/lib/agent/`                                                                   |
| Database (Prisma)                                                                             | `prisma/schema.prisma`, `src/lib/db.ts`                                            |

## Environment

| Variable                             | Where it comes from                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_BUILDBASE_SERVER_URL`   | `https://api.console.buildbase.app`                                                          |
| `NEXT_PUBLIC_BUILDBASE_ORG_ID`       | The ReelForge organization's id in the BuildBase console                                     |
| `NEXT_PUBLIC_BUILDBASE_CLIENT_ID`    | Console, Auth: an OAuth client whose redirect URLs include the site URL                      |
| `BUILDBASE_CLIENT_SECRET`            | The same client's secret. Server only                                                        |
| `NEXT_PUBLIC_BUILDBASE_REDIRECT_URL` | Where the hosted sign-in returns to; one of the client's redirect URLs                       |
| `SYSTEM_SECRET`                      | At least 32 characters (`openssl rand -base64 32`). Signs tokens this app mints              |
| `BUILDBASE_WEBHOOK_SECRET`           | Console, Settings, Webhooks: endpoint `<site>/api/webhooks/buildbase`. Optional until set up |
| `BUILDBASE_API_TOKEN`                | Console, Settings, Tokens. Needed for the assets, audience, forms and help pages             |
| `SITE_URL`, `NEXT_PUBLIC_SITE_URL`   | The public URL                                                                               |

`src/env.ts` validates these at boot.

## Scripts

| Command                                         | What it does                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`                                   | Local development server                                                           |
| `npm run typecheck`, `npm run lint`, `npm test` | Checks                                                                             |
| `npm run build`                                 | Next.js production build                                                           |
| `npm run preview`, `npm run deploy`             | Build for Cloudflare Workers and run locally / deploy (see `DEPLOY_CLOUDFLARE.md`) |

## License

MIT for the starter code this began from; see `LICENSE`.

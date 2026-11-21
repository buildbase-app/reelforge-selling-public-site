# ReelForge store

The public site for **ReelForge**, a self-hosted short-form video studio
(Remotion + Motion Canvas). This is where people learn about ReelForge, sign
in, buy it, and later download releases and manage their licenses. The product
itself lives in a separate private repository.

Built with Next.js 16 on [BuildBase](https://buildbase.app) (sign-in,
workspaces, billing, notifications) and deployed to Cloudflare Workers with
OpenNext. See `DEPLOY_CLOUDFLARE.md`.

> **Status:** started from the BuildBase Next.js starter; the BuildBase demo
> pages and the org-token demo routes have been removed. ReelForge is not on
> sale yet.
>
> **Language:** English only for now. `locales` in `src/i18n/config.ts` is
> `['en']`; the other message files in `src/i18n/messages/` are kept but not
> served (they still hold starter copy). Translate one, then add its code back
> to `locales` and to `src/i18n/messages/index.ts`.

## What is in here

| Area                                                                                  | Where                                                                                                           |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Marketing: home, pricing, blog, changelog, help, legal                                | `src/app/[locale]/...`, `src/content/` (MDX via Contentlayer)                                                   |
| Sign-in and session (BuildBase hosted pages, httpOnly cookie)                         | `src/components/saas-provider.tsx`, `src/app/api/auth/*`, `src/lib/server-auth.ts`                              |
| Customer dashboard: team, invoices, profile, security, settings, notifications, inbox | `src/app/[locale]/dashboard/*`                                                                                  |
| Buying: pricing from published items, BuyButton, `/order`, `/dashboard/licences`      | `src/components/store/*`, `src/app/[locale]/(marketing)/{pricing,order}`, `src/app/[locale]/dashboard/licences` |
| Legal drafts (licence, refund, privacy, terms) and contact                            | `src/content/pages/*/en.mdx`, `src/app/[locale]/(marketing)/contact`                                            |
| Mirroring BuildBase into the database (SDK events, signed webhooks)                   | `src/app/api/events`, `src/app/api/webhooks/buildbase`                                                          |
| Agents: MCP server at `/api/mcp`, OAuth discovery, `llms.txt`, `openapi.json`         | `src/lib/agent/`                                                                                                |
| Database (Prisma)                                                                     | `prisma/schema.prisma`, `src/lib/db.ts`                                                                         |

## Selling

The pricing page, the hero buttons, `/order` and `/dashboard/licences` read
everything from BuildBase: the app owner's own store (`usePublishedItems({
seller: { type: 'org' } })`), each variant's current price, its benefits and
the buyer's holdings. No price is written in this repo. Until an item is
published, pricing says "Not on sale yet" and the buttons point to the
waitlist. Checkout returns to `/order` (a guest with `?order=&token=`).
Selling itself (Stripe Connect, the own store, item types, items, files and
licence keys) is set up in the BuildBase console, not here.

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
| `BUILDBASE_API_TOKEN`                | Console, Settings, Tokens. Optional; only the help page's console content uses it            |
| `NEXT_PUBLIC_SUPPORT_EMAIL`          | Public support address. Optional; unset, pages point to `/contact` and `/help` instead       |
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

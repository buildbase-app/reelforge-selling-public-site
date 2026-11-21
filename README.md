# ReelForge store

The public site for **ReelForge**, a self-hosted short-form video studio that
an AI agent drives over REST and MCP (engines: Remotion, Motion Canvas, HTML
and HyperFrames). ReelForge is sold as a locked Docker image with a licence
key, not as source code. This is where people learn about ReelForge, sign in,
buy it, and later download releases and manage their licences. The product
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
everything from BuildBase: the app owner's own store, each variant's current
price, its benefits and the buyer's holdings. `/` and `/pricing` read the
published items on the server (`src/lib/store/items.ts`, revalidated by the
`item.*` webhook) so prices and the `SoftwareApplication`/`Offer` JSON-LD are
in the HTML; without a server token they fall back to the browser read
(`usePublishedItems({ seller: { type: 'org' } })`). No price is written in this repo. Until an item is
published, pricing says "Not on sale yet" and the buttons point to the
waitlist. Checkout returns to `/order` (a guest with `?order=&token=`).
Selling itself (Stripe Connect, the own store, item types, items, files and
licence keys) is set up in the BuildBase console, not here.

## Content from the console

FAQs and content blocks are read from BuildBase with local fallbacks, so the
site is complete with an empty organization. Bodies are Markdown, rendered on
the server and sanitised with `rehype-sanitize` (`src/lib/platform/markdown.ts`).

| Console object           | Slug                                | Shown on                          | Fallback                   |
| ------------------------ | ----------------------------------- | --------------------------------- | -------------------------- |
| FAQ collection           | `store-faq`, `agents-faq`           | `/help` (+ FAQPage JSON-LD)       | `src/lib/platform/faqs.ts` |
| FAQ collection           | `home-faq`                          | `/` (+ FAQPage JSON-LD)           | same                       |
| FAQ collection           | `pricing-faq`                       | `/pricing` (+ FAQPage JSON-LD)    | same                       |
| Content block            | `remotion-notice`                   | `/`, `/pricing`                   | the current notice text    |
| Content block            | `announcement-bar`                  | `/`, above the hero               | none (hidden)              |
| Content block            | `launch-price-note`                 | `/`, `/pricing`, under the prices | none (hidden)              |
| Content block, docs, ... | `refund-policy`, docs, testimonials | `/help`                           | none                       |

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
| `BUILDBASE_API_TOKEN`                | Console, Settings, API keys. Optional: FAQs, content blocks and server-rendered prices       |
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

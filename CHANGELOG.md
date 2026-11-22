# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed (performance, studio issue #79)

- The BuildBase provider is no longer in the locale layout. The public pages
  (home, agents, gallery, docs, blog, changelog, help, contact, legal) render
  without it: `BuildBaseTracking` and a lightweight cookie banner load after
  hydration, and sign-in loads the SDK only when pressed or when returning
  from the hosted sign-in page. `/pricing`, `/order`, `/waitlist` (route group
  `(store)`) and `/dashboard` keep the provider. First-load JavaScript on the
  public pages drops from about 1.1 MB to about 180 KB (gzip).
- Browser Sentry no longer ships with every page: it loads when an error is
  reported, or on idle when a DSN is configured. Server Sentry is unchanged.
- Store prices are read on the server from BuildBase's public items API when
  no API token is set, so the home page shows them without the provider.
- `npm run check:bundle` reports first-load JavaScript per page and fails when
  a page in `(marketing)` is over the budget (150 KB gzip, `BUDGET_KB`).

### Changed (licensing, founder decision 2026-11-21)

- ReelForge is source-available (public repository
  `buildbase-app/reelforge-studio`): a free Personal licence key for
  noncommercial use (PolyForm Noncommercial 1.0.0) and a paid one-time
  Commercial licence. All "locked Docker image" and "source not included"
  wording is gone from the site, metadata, llms.txt and agent docs.
- Pricing (and the home pricing section): Personal first ("Free for personal
  use", "Get it free", a free claim with no payment page), then the
  Commercial tiers; a "Which licence do I need?" block; FAQ "What counts as
  commercial use?". Edition from item metadata, known ids or the free price
  (`src/lib/store/edition.ts`), never titles.
- `/licence` summarises both licences (Commercial marked draft); `/terms` and
  `/refund` say Personal keys are free and not refundable.
- Order page and Dashboard, Licences label each key Personal or Commercial;
  Personal keys show "noncommercial use only — upgrade for commercial use".
- Footer and hero link the source on GitHub.

### Added

- Homepage v2: an Apple-style product page with three demo reels rendered by
  ReelForge, the recorded MCP calls behind one of them, engines, privacy,
  production features, server-rendered pricing, FAQ and footnotes.
- `/agents` (and `/agents.md`): connect Claude Code, Codex, any MCP client or
  REST, a prompt cookbook and the studio's MCP tools grouped by job.
- `scripts/e2e-personal-claim.cjs`: claims the free Personal licence on the
  test site end to end. A unit test fails if "open source" appears in the
  marketing copy.

- Server-rendered prices on `/` and `/pricing` from the store's published
  items (server commerce API, tag `store:items`, revalidated by `item.*`
  webhooks), with `SoftwareApplication` + `Offer` JSON-LD only while
  something is on sale. Without a server token the browser read is kept.
- ISR on Workers: D1-backed incremental and tag caches
  (`src/lib/cache/d1-over-static-assets.ts`, OpenNext D1 tag cache) and the
  memory queue. `/`, `/pricing` and `/help` revalidate by tag and path from
  `/api/webhooks/buildbase`.
- FAQ collections `store-faq`, `home-faq`, `pricing-faq`, `agents-faq` and
  content blocks `announcement-bar`, `launch-price-note`, `remotion-notice`,
  read from BuildBase with local fallbacks; FAQPage JSON-LD from the same data.
- `app/sitemap.ts` and a `robots.txt` with Content Signals from the agent
  stack (replace next-sitemap). CSP `media-src` (R2 media host) and
  `worker-src`. Search engine verification tokens from env.

- Sentry error monitoring integration with session replay
- Global error boundary (`src/app/global-error.tsx`)
- Sentry utility functions (`src/lib/sentry.ts`)
- Deploys to Cloudflare Workers (OpenNext) from GitHub Actions
  (`.github/workflows/deploy.yml`) on every push to the store branch
  (`claude/eloquent-wright-tm3cs7`): first the test copy
  (https://reelforge-dev.buildbase.app, ReelForge Test organization), then,
  only if that succeeds, production (https://reelforge.buildbase.app). Needs
  the `CLOUDFLARE_API_TOKEN` repository secret.

### Changed

- Positioning: ReelForge is driven by the buyer's AI agent over REST and
  MCP, with four engines (Remotion, Motion Canvas, HTML, HyperFrames). (The
  earlier closed-distribution wording is replaced by the licensing change
  above.)
- BuildBase Markdown bodies render on the server with remark/rehype and
  `rehype-sanitize`; the regex `sanitizeHtml` is gone.
- No hreflang alternates while English is the only served language.

- `@buildbase/sdk` 1.8.0 (from 0.0.78). The deprecated hook keys
  (`isLoading`, `refreshAttributes`, `refreshFeatures`) and the profile's `_id`
  are replaced by `loading`, `refetch` and `id`.
- The cookie banner is the SDK's `CookieBanner`; the answer lives in the
  `bb_consent` cookie, so visitors who answered the old banner are asked once
  more. `openCookieBanner()` reopens it from the Tracking page.
- The server content client names the template (`source: 'nextjs-starter'`) in
  the SDK's `X-BuildBase-Client` header.
- Brand icons (GitHub, X, LinkedIn, Facebook) are inline Simple Icons marks
  (`src/components/icons/brand.tsx`), since lucide-react deprecated its own.
- Zod 4 forms replace deprecated ones (`z.url()`, `z.email()`, `z.uuid()`,
  `.loose()`, `z.ZodType`), and React's `SubmitEvent` replaces `FormEvent`.

## [0.2.0] - 2026-09-24

### Added

- The tour: 67 tasks in 13 groups, listed on the home page before sign-in and
  worked through after. Each task says why it matters, what to do and where the
  capability comes from (SDK surface, console screen, this app's code).
  Progress is one `TourProgress` row per person per task, ticked by SDK
  lifecycle events, webhooks, the app's own actions, or "Mark done".
- Documents, the demo's own product: REST routes under `/api/documents`, a
  workbench with filters, inline status changes, sample data and a metering
  line. Creating one records usage against the `documents` quota and spends a
  credit; a workspace at its cap with no overage gets a 402. The MCP tools go
  through the same service.
- Notification bell in the dashboard header and an inbox page (live, all or
  unread, mark all read, archive). The Notifications page sends the
  `comment-added` event to yourself.
- Team: invite by email with a role, pending list with resend and revoke, the
  seat a pending invitation holds, inline role changes, and the platform's
  pending-invitation banner on every dashboard page.
- `/api/webhooks/buildbase`: verifies signature and timestamp, stores each
  delivery once, credits the tour to the workspace's members. The Events page
  lists what arrived with the payload.
- Connected agents on the profile page, with an MCP set-up guide for Claude,
  Cursor, ChatGPT and VS Code. Token minting and tool calls tick their tasks.

### Changed

- `@buildbase/sdk` 0.0.70.
- Content-Security-Policy `connect-src` is derived from
  `NEXT_PUBLIC_BUILDBASE_SERVER_URL` (HTTP and WebSocket), and
  `upgrade-insecure-requests` applies only in production, so a local server
  over plain HTTP works.

### Fixed

- Account export and deletion answered 401 to a real session: the session
  helper read `profile._id` while the profile carries `id`.
- The notifications page copy contained `{{name}}` unescaped, which ICU
  rejected as a malformed argument.

## [0.1.0] - 2026-01-27

### Added

#### Core Framework

- Next.js 16.1.4 with App Router
- TypeScript 5 with strict mode
- Tailwind CSS 4 for styling
- shadcn/ui component library (Radix UI primitives)

#### Internationalization (i18n)

- 8 language support: English, Hindi, Spanish, French, German, Japanese, Chinese, Arabic
- RTL support for Arabic
- next-intl integration for translations
- Language switcher component with cookie persistence
- URL-based locale routing

#### Authentication

- BuildBase SDK integration for OAuth
- JWT token management
- Protected route handling
- Workspace switching support

#### SEO

- Multi-language sitemap with hreflang
- robots.txt configuration
- JSON-LD structured data (Organization, WebSite, WebPage, Breadcrumb, FAQ, Article)
- Dynamic OG image generation
- Canonical URLs and alternate language links
- OpenGraph and Twitter card metadata

#### Security

- Security headers middleware (CSP, HSTS, X-Frame-Options, etc.)
- Zod validation schemas for all inputs
- Environment variable validation with @t3-oss/env-nextjs
- JWT signing with secure secrets

#### Developer Experience

- ESLint + Prettier configuration
- Husky pre-commit hooks with lint-staged
- GitHub Actions CI/CD pipeline
- Bundle analyzer integration
- VS Code settings for auto-formatting
- EditorConfig for cross-editor consistency

#### Utilities

- Centralized logging utility (dev/prod aware)
- Format utilities (date, number, string)
- Health check endpoint (`/api/health`)
- Skip-to-content accessibility link

#### Database

- Prisma ORM setup
- PostgreSQL adapter
- User, Workspace, and UserWorkspace models

#### Theming

- next-themes integration
- Light/Dark/System mode support
- Theme toggle component

#### Error Handling

- Localized error boundaries
- Localized 404 page
- Error logging integration

#### Documentation

- Comprehensive README
- Knowledge base with detailed guides
- Development roadmap

### Infrastructure

- `.nvmrc` for Node.js version management
- `.editorconfig` for consistent formatting
- `.prettierrc` configuration
- `components.json` for shadcn/ui

---

## Version History

- **0.2.0** - The tour, documents, inbox, invitations, webhooks, agents
- **0.1.0** - Initial release with full feature set

[Unreleased]: https://github.com/buildbase-app/nextjs-starter/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/buildbase-app/nextjs-starter/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/buildbase-app/nextjs-starter/releases/tag/v0.1.0

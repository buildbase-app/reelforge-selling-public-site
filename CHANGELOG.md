# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed (studio issue #461): marketing content in the BuildBase CMS

- The changelog is the BuildBase collection `changelog` (title, slug,
  release date, version, summary, rich-text content, share image URL,
  published), created in the development environment and then production,
  and seeded with the store's real release notes. `/changelog`, each note,
  the RSS feed and the sitemap read it; only published records appear, an
  unknown slug is a 404, and `collection.*` webhooks revalidate the pages.
  The changelog list shows each note's summary and links to the full note,
  so the page has one h1 and no repeated heading ids.
- One rich-text renderer for blog posts, release notes, docs and legal pages
  (`src/lib/content/rich-text.ts`): sanitised first (no script, style,
  iframe, object, event handler or `javascript:` URL, with their contents
  removed), then heading links on h2-h4, a body `# h1` moved down a level,
  GitHub alert callouts, captioned figures, `.mp4`/`.webm` as video with
  controls and no autoplay, highlighted code with readable (AA) token
  colours, scrolling tables, footnotes, labelled task checkboxes, and RTL
  paragraphs that take their direction from their own text. Rich-text
  values come back from BuildBase with `<`, `>` and `&` as entities, which
  the changelog mapping decodes before rendering.
- Shared rich-text typography (`rich-text.module.css`): about 68
  characters a line, mono for code only (the post date line is no longer
  mono), long words and URLs wrap, code and tables scroll inside themselves.
- robots.txt on dev.renderweld.com is `Disallow: /` with no sitemap, beside
  the noindex header and meta it already had; production is unchanged.
- Release notes carry `TechArticle` JSON-LD with the organisation as
  author; feed items use their URL as a permalink guid.

### Changed (studio issues #411 and #457): RenderWeld, formerly ReelForge

- The product is now called RenderWeld. Pages, metadata, JSON-LD, the agent
  documents (llms.txt, agents.md) and the FAQ use the new name; "formerly
  ReelForge" stays on one line of the home page, in one FAQ answer and here.
  Legal pages (terms, privacy, licence, refund) keep their text until they
  are reviewed with their new effective date.
- Brand kit (studio `docs/brand/`): the mark and wordmark in the header and
  footer, the favicon set, Apple touch icon, web app manifest
  (`/manifest.webmanifest`) and the Open Graph and X share images. The
  generated `/api/og` card and its placeholder generator are gone. Muted text
  moves to the kit's #6b6a64 / #9a9ea6; on light, links, the focus ring and
  rails use the ink, since orange is never text or a thin line there.
- Home page copy checked against the studio's `main`: any size and frame
  rate (NTSC exact), MP4, ProRes MOV, WebM, GIF, PNG sequences and audio,
  variants from one call, layouts, captions, workspaces, the dashboard,
  providers and cloud guides, isolation, and the measured load-test numbers
  with their conditions. The install steps now set the required secret key.
  The MCP tool count (76) comes from the studio's generated reference.
- Design: no eyebrow above every heading, no step counters, no radial
  washes or shadows; one scroll-driven moment (the formats drawing welds
  together), a two-layer hero, hover styles only on devices that hover.

### Fixed (studio issue #284)

- Keyboard focus: every control shows one ring, 2px in the accent (#c2410c
  on light, #ff4f00 on dark) 2px off its edge, for keyboard focus only. The
  skip link now shows above the sticky header and moves focus to the page's
  main content. The phone menu button reports `aria-expanded` and names its
  menu with `aria-controls`.
- The cookie banner's buttons use the site's tokens and button shape. Reject
  all and Accept all look the same (accent fill, ink text), so neither answer
  is the easier one; Choose is an outline button.
- Prose keeps to about 68 characters a line (`max-w-measure`), headings
  balance their lines and body text avoids a one-word last line.

### Security (studio issue #279)

- Production dependencies: `npm audit --omit=dev` goes from 14 findings
  (4 high, 10 moderate) to 0. Non-breaking updates for `browserslist`,
  `baseline-browser-mapping` and `@opentelemetry/*`; `overrides` lift
  `effect` to ^3.22.5 (under the Prisma CLI), `glob` to ^14.0.6 and
  `minimatch` to ^11.0.9 (under OpenNext and Sentry's build plugins). No
  downgrades. Most of these run only at build time.

### Changed (studio issue #247)

- Colour pass with the founder's palette (2026-11-23): "Analog Cinema" by day
  (canvas #f4f3ef, cards #ffffff, ink #141413, muted #6b6b6b, borders
  #e2e0d8) and "Late Night Edit" by night (canvas #191b1f, surface #24272d,
  ink #f1f2f4, muted #a1a3a8, borders #3a3d44). The one accent in both themes
  is signal orange #ff4f00. Primary buttons are filled with it and carry ink
  text; as text it appears only on dark. On light, accent text and links use
  #c2410c, which is also the focus ring there. It replaces the pink. The
  status colours (olive, steel blue, ochre, crimson) carry meaning only. The
  dark bands and the light card inside them are fixed to the dark and light
  palettes. Error text on light uses a deepened crimson, #b3433b (5.6:1 on
  white), the same rule as the accent's text shade. Every text role passes
  WCAG AA in both themes (checked with axe).
- Soft washes (`--wash-canvas`, `--wash-accent`, `.rf-wash`), tinted from the
  canvas and the accent, sit behind the dark bands only.
- The hero is demo-first: a replay of a recorded Claude Code session that
  makes a four-engine reel over MCP (`public/walkthroughs/`), shown in a
  window, with the prompt as an inline code chip. It plays in the site's own
  reel player, so it adds no JavaScript. Its 6 to 10 KB poster is preloaded,
  and the video starts in view, not under reduced motion. The headline's key
  words carry the accent with a thin underline. The H1 is set at weight 600.
- A light card with two rows of real gallery reel posters
  (`public/reels/marquee/`, 16 WebP, 70 KB) drifts in CSS only. It pauses on
  hover and with its pause control, and doesn't move under reduced motion. It
  includes "Not this → this" chips.
- "Ready for the server room" is now six feature cards with capability chips
  taken from the studio README. The numbers band is now proof tiles, each
  with its source.
- Removed: the hero's phone and the two posters behind it
  (`public/reels/stack/`).

### Fixed (studio issue #266)

- The launch-price note shows only when a paid Commercial variant is on
  sale. With no published items ("Not on sale yet") `/` and `/pricing` show
  no note. When the server can't read the store, the note still shows,
  because the browser may then show launch prices. #27's guarantees stand:
  a shown launch price always has its end date, and there is no note after
  that date. `paidCommercialOnSale` is in `src/lib/store/launch.ts`.

### Fixed (studio issue #251)

- The MCP tool count on `/`, `/agents` and `/agents.md` is 61, not 53: the
  catalog now includes the eight webhook tools. `refresh-mcp-tools.mjs`
  reads the studio's generated reference (`docs/public/mcp/tools.md`) by
  default, records the studio commit, and `--check`
  (`npm run check:mcp-tools`) fails when the catalog and the studio differ.
  A unit test fails if any page writes a tool count in its copy.
- `/gallery` no longer says an agent planned the reels. The heading is
  "Reels rendered by ReelForge over MCP", and the intro and each reel's
  "How it was made" say what happened: we wrote the manifest, the gallery
  script sent it to the studio over MCP with the same tool calls an agent
  makes, and the studio rendered it. "The prompt the agent was given" is now
  "A prompt for your agent". The engine count under the heading is counted
  from the reels, not written down.

### Fixed (studio issue #215)

- The home page has one header. The sticky "ReelForge product" sub-nav is
  gone; "Connect your agent" (to `/#connect`, from 1280 px wide) and the
  page's one primary action ("Join the waitlist", or "Buy ReelForge" once
  the store is on sale, decided like the hero's buttons) sit in the site
  header, which gets them from the `@headerAction` parallel route on `/`
  only. "Sign In" is now a ghost button, so the header has one filled
  button at most.
- The header is solid (`--background`) and 64 px tall (`--header-h`), not
  translucent, so it no longer turns grey over the dark bands. Anchors on
  `/` use `--header-h` as their `scroll-margin-top`.
- Below 1024 px the header has a menu (a native popover) with the site
  links, and on `/` "Connect your agent". It closes when a link is followed.
- On `/pricing`, `/order` and `/waitlist` the header's sign-in button keeps
  its width while the SDK loads, so it no longer shifts the theme toggle.
- New `e2e/header.spec.ts`: one sticky element at the top of `/` and
  `/pricing` at 390 and 1440 px, and `/#how` lands below the header.

### Fixed (studio issue #193)

- `/pricing`, `/order` and the dashboard no longer log a `script-src 'eval'`
  CSP violation. zod v4 tested whether it could compile code with
  `new Function("")`, which the nonce CSP blocks. zod is now set to
  `jitless` (`src/lib/zod-jitless.ts`) before the BuildBase SDK builds its
  schemas, so it never tries. The CSP is unchanged.
- `e2e/home.spec.ts` finds the sign-in button and the theme toggle inside
  the header. The old locators also matched "Sign in to buy" and the
  footer's toggle. New `e2e/csp.spec.ts` checks for 0 CSP violations.

### Fixed (studio issue #189)

- Body text is set in Geist, as the design pass intended. It was in the
  system font: next/font set `--font-geist-sans` on `<body>`, but Tailwind
  resolves the default font family on `<html>`. Geist is now self-hosted
  like Geist Mono (the same files next/font served, the latin file split
  into a 20 KB ASCII core and the rest), both variables sit on `:root`, and
  every page preloads the Geist core with a `<link>` in `<head>`. Bare
  `<code>`/`<pre>` and the docs' code now get Geist Mono for the same reason.
- Price cards set the term ("one-time") smaller after the amount and never
  break it at the hyphen.
- The home and `/agents` hero text fades in from faint instead of from
  invisible, so the subhead counts as painted at the first paint.

### Fixed (studio issue #186)

- `/gallery/<unknown-slug>` returns the site's 404 page with status 404
  instead of a 500, also while the gallery is not set up. The route renders
  on request; a missing API token or an unreadable collection is a logged
  warning and an empty gallery.

### Changed (performance, studio issue #186)

- The home hero poster is preloaded at high priority from the top of
  `<head>` and served as 360, 540 and 720 px AVIF and WebP (`srcset`/`sizes`);
  the posters behind the phone get 240 and 400 px AVIF and WebP.
- Geist Mono is self-hosted from `public/fonts` (the same files and metrics
  next/font served, the latin file split into an ASCII core and the rest),
  so `/agents`, whose largest element is a Geist Mono snippet, preloads its
  15 KB core.

### Changed (design, studio issue #81)

- One set of design tokens in `globals.css`: neutrals tinted toward the
  studio's ink, one accent (the brand pink, as ink `#c8174d` on light),
  toned semantic colours, depth and motion tokens. Every text role passes
  WCAG AA in both themes. Glows, the pink wash, the second (teal) accent,
  bold headings and tracked uppercase labels are gone.
- Motion follows the scroll with CSS scroll-driven animations: hero parallax
  (the phone and two gallery renders behind it), section reveals, a sticky
  "How it works" rail that fills as the steps pass, and gallery cards that
  tilt back to flat as they enter. Transform and opacity only; an
  IntersectionObserver fallback loads on demand where scroll timelines are
  missing; `prefers-reduced-motion: reduce` turns all of it, and reel
  autoplay, off.

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
- The public pages now meet that budget: 144 to 147 KB of first-load
  JavaScript (gzip), down from about 181 KB. They no longer load the intl
  provider (next-intl's message formatter): words are translated on the
  server, links use `@/i18n/link` (`next/link` with the locale prefix), and
  the provider moved to a new `(app)` group layout, the parent of `(store)` and the dashboard, which now also mounts the BuildBase provider once for both. The header's
  buttons, the error pages and the copy and play buttons draw `Button`'s
  markup and lucide's icons without tailwind-merge, cva or lucide-react's
  runtime; the 404 renders inside the `(marketing)` layout instead of
  mounting a second header. Nothing changes on screen.

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

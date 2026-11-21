# ReelForge: Gap Analysis and Launch Plan

**Prepared:** 2026-11-21 · **Inputs:** `ReelForge_Agent_Knowledge_Pack.zip` (13 docs), this repo (`buildbase-app/ReelForge`), live checks of npm, Remotion license pages and BuildBase docs on 2026-11-21.
**Status:** This is a plan. Nothing in it is implemented or tested yet. Labels follow the pack's convention: DECIDED, PROPOSED, VERIFY.

---

## 1. Where things stand

| Item | State |
| --- | --- |
| Knowledge pack | Product brief, decisions, architecture, requirements, test plan, roadmap, licensing research. Solid and conservative. No code. |
| This repo | A copy of the **BuildBase Next.js starter** (auth, billing, workspaces, MCP, blog, i18n, a 67-task BuildBase tour). The name "ReelForge" appears nowhere in the code. There's no video code. |
| ReelForge product code | **None yet.** It will live in a separate, empty repo (per founder). |
| Deadline | Ship or Die hackathon, **2026-12-16** (VERIFY against the official event page). That's about **25 days** from today. |

### The two-repo split (PROPOSED)

```
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│  Repo B: THIS repo (storefront)      │        │  Repo A: NEW repo (the product)      │
│  Runs on BuildBase, hosted by us     │        │  Self-hosted by each buyer           │
│                                      │  sells │                                      │
│  landing page + sample reels         │ ─────▶ │  local web studio (UI)               │
│  checkout (one-time / lifetime)      │        │  project schema + plan import        │
│  license keys, downloads, releases   │        │  Remotion adapter                    │
│  docs, changelog, help, support      │        │  Motion Canvas adapter               │
│  waitlist, newsletter, affiliates    │        │  FFmpeg assembly + ffprobe QA        │
│  traffic/revenue for the hackathon   │        │  job runner, Docker, install guide   │
└──────────────────────────────────────┘        └──────────────────────────────────────┘
```

Repo A must work **without** Repo B being up (decisions D-003, D-004, FR-045). Repo B is how people find it, pay for it, download it and get updates.

---

## 2. Go/no-go risks found (read these first)

### R1: Motion Canvas looks unmaintained, and it can't render headlessly (HIGH, not in the pack)

- npm: `@motion-canvas/core`, `@motion-canvas/2d` and `@motion-canvas/ffmpeg` were last published **3.17.2 on 2024-12-14**. That's almost two years with no release.
- Rendering in Motion Canvas is done by pressing **Render in its browser editor**. There's no official headless `renderVideo()` API. Revideo forked Motion Canvas precisely to add one.
- Revideo (`@revideo/core`, `@revideo/renderer`) is **MIT**, last published **0.11.0 on 2026-07-10**, and keeps the Motion Canvas generator/scene API.
- **Impact:** D-002 (both engines are required) is still doable, but the Motion Canvas side needs either (a) our own headless harness: build the project with Vite, open it in headless Chromium, step frames, pipe them to FFmpeg; or (b) Revideo as the "Motion Canvas-family" engine.
- **Decision needed from founder (see §7, Q1).** Recommendation: spike (a) for 1–2 days. If it's fragile, use Revideo and describe it accurately as "Motion Canvas–compatible (Revideo, MIT fork)". Never claim it's upstream Motion Canvas.

### R2: Remotion licensing for a source-code sale (HIGH, already flagged in the pack, now sharper)

Checked live on 2026-11-21 (remotion.dev/docs/license/pricing and /faq):

- **Free license:** individuals and companies of **≤3 people**, unlimited commercial use.
- **Company license**, for teams over 3, in two forms:
  - **Automators:** **$0.01/render, $100/month minimum**. It explicitly covers "video editors, prompt-to-video tools, automated video pipelines". **ReelForge is in this category.** It applies to whoever "owns code that programmatically calls `renderMedia()` / `npx remotion render`".
  - **Creators:** $25/seat/month.
- The FAQ forbids "selling Remotion as a product itself" and, for hosted services, letting users upload their own Remotion code.
- The FAQ **doesn't say** whether buyers of source code who render on their own machines need their own license. Most likely reading: **each buyer needs their own Remotion license.** That's free if they're 3 people or fewer; buyers over 3 people need Automators.
- **Remotion 5.0 will make telemetry mandatory for Automators customers.** That conflicts with NFR-005 ("local by default, no hidden network calls"). Disclose it.
- **Action this week:** email Remotion (remotion.dev/contact) with the exact model. Store the reply in Repo A at `LICENSES/remotion-correspondence.md`. Until then, the storefront must say: *"Includes Remotion-based scenes. You need your own Remotion license: free for ≤3 people, paid for larger teams."*

### R3: BuildBase selling needs an SDK upgrade, and license keys need a staging test (MEDIUM)

- This repo pins `@buildbase/sdk` **0.0.78**. Checkout, orders, file releases, license keys and `<HoldingKeys>`/`<HoldingFiles>` need **≥1.2.0**. The latest is **1.8.0**. Expect breaking changes across that jump.
- The BuildBase docs describe `license_key` benefits (`activationLimit`, `expiresInDays`, `license.rotated` webhook) and `lifetime` offers with `includesFutureVersions: true`. **But** the same page also says *"License keys, bundles and transfers are not delivered yet: checkout refuses an option that includes one."* **VERIFY in Staging** before building on it. Fallback: a `file` benefit (downloads) plus a `webhook_only` benefit, with keys issued by our own server.
- **Live selling is pilot-gated** (`LIVE_SELLING_NOT_ALLOWED`). Make sure this org is in the pilot before launch day.

### R4: Assets and FFmpeg (MEDIUM, already in the pack)

- Bundle **only** original, CC0 or explicitly redistributable fonts, music and SFX. Track every asset in a machine-readable inventory (FR-050).
- Remotion 4 **bundles its own FFmpeg** (inside `@remotion/compositor-*`) and downloads Chrome Headless Shell on first use. Record both in the license inventory, and note the network call at install time.

---

## 3. Repo A: the self-hostable product (new repo)

### 3.1 Recommended stack (PROPOSED)

| Concern | Choice | Why |
| --- | --- | --- |
| Monorepo | pnpm workspaces + Turborepo, Node 22 LTS, TypeScript strict | Matches the pack's `packages/*` layout |
| UI | Next.js app (`apps/studio`) | Same stack the team already runs here; Remotion `<Player>` drops in for previews |
| Render worker | Separate Node process (`apps/worker`) polling a job table | Renders take minutes and are CPU-heavy, so they must not run inside a web request |
| Storage | **SQLite** (Prisma or Drizzle) + local `./data/` folder | Nothing to install for self-hosters; Postgres optional later |
| Schema | Zod in `packages/project-schema`, exported as JSON Schema | One contract shared by the UI, external agents, planner and both engines |
| Engine 1 | `@remotion/bundler` + `@remotion/renderer` (`renderMedia`) | Headless, well documented, actively released (4.0.545, 2026-11-18) |
| Engine 2 | Motion Canvas through our headless harness, **or** Revideo `renderVideo()` | See R1 |
| Assembly | FFmpeg: normalize to 1080×1920 @ 30 fps, yuv420p, H.264 + AAC, then concat; `ffprobe` for QA | FR-021/022 |
| AI (later) | Import a plan JSON first. Then optional BYO-key adapters (Anthropic API, OpenAI API, Ollama) | D-005, D-006 |
| Deploy | Dockerfile (Node + Chromium deps + FFmpeg) + `docker-compose.yml` with a data volume | FR-043 |
| CI | GitHub Actions: unit tests + a real 2-scene render + ffprobe assertions on ubuntu | Release gate |

### 3.2 Layout

```
reelforge/
├── AGENTS.md, README.md, docs/, research/        ← copy the knowledge pack in as-is
├── apps/
│   ├── studio/                 # Next.js local UI: projects, plan review, render queue, preview
│   └── worker/                 # job runner: queued → running → succeeded/failed/cancelled
├── packages/
│   ├── project-schema/         # Zod schema v0.1 + JSON Schema export + migrations
│   ├── planner/                # validate/import plans, rules-based engine assignment
│   ├── engine-remotion/        # Remotion compositions + adapter (render one scene → clip)
│   ├── engine-motion-canvas/   # MC/Revideo scenes + headless adapter
│   ├── media-pipeline/         # normalize, concat, audio mix, ffprobe validation, frame grabs
│   ├── asset-registry/         # asset metadata, license, checksum, path-traversal guard
│   └── agent-kit/              # prompt pack + JSON schema so Claude Code/Codex can write plans
├── examples/sample-reel.json   # the no-API-key demo project
├── deployment/docker/
└── LICENSES/                   # third-party notices, asset inventory, Remotion correspondence
```

### 3.3 "Bring your own agent" done the legitimate way

The cleanest way to support customers' Claude Code or Codex subscriptions, without the app touching their credentials, is to ship `packages/agent-kit`:

- an `AGENTS.md` / `CLAUDE.md` plus a skill that teaches the agent the ReelForge plan schema and template catalog;
- the customer runs **their own** CLI in **their own** checkout, and it writes `plans/*.json`;
- the studio watches or imports that folder, validates it, and shows it for approval (FR-002/003/004/031).

This respects D-005/D-006 and provider terms (no token scraping, no subscription-as-API). In-app API adapters come later, BYO key only.

---

## 4. Repo B: this repo becomes the storefront

### 4.1 Keep (already works, needs rebranding)

Auth/session, `saas-provider`, team/workspaces (team licenses), invoices, waitlist, blog, changelog (product release notes), help/FAQ/docs browser, legal pages (rewrite Terms into a **EULA**), SEO/OG/sitemap, Sentry, webhooks + `WebhookEvent`, events mirroring, notifications (release announcements), assets (sample reels), contact form, cookie consent, MCP/`llms.txt` (point at ReelForge docs).

### 4.2 Remove or park (BuildBase demo material)

The tour (`src/tour/*`, dashboard tour page, `tour-preview`, `TourProgress` model), the Documents demo (`src/lib/documents`, `/api/documents/*`, `Document` model), links, collections, automations, tracking, reports, credits/credit store, usage, permissions demo. Also `scripts/seed-org.mjs` and `check-tour-sources.mjs`. Do this in one "strip the demo" PR so it's easy to review.

### 4.3 Add

| Feature | How (BuildBase) |
| --- | --- |
| Upgrade SDK 0.0.78 → 1.8.x | Do it first, alone, and fix breakages |
| Product landing page | Hero with a reel **rendered by ReelForge itself**, the two-engine story, honest cost/licensing disclosure (NFR-012) |
| Buy | Seller item "ReelForge" with tier variants, a one-time price, `lifetime` offer with `includesFutureVersions` (decide whether you want that; see Q4), `<BuyButton>` |
| Order page | `useMyOrder` / `useOrderByToken`, `<HoldingKeys>`, `<HoldingFiles>` |
| Downloads | `file` benefit tied to a release series `reelforge`, one release per version: source zip + checksums + notes (max 20 files per release) |
| "My licenses" dashboard | Keys, activations, downloads, release history |
| License activation API (optional) | `/api/license/activate` server route using the BuildBase server key, so the product never embeds our API key. The product must **work without it** (see Q5) |
| Optional GitHub access | On `grant.created`, invite the buyer to a private repo (needs a GitHub token in this app). Phase 2 |
| Docs | Install (macOS, Linux, Docker), deploy to VPS, Remotion licensing guide, asset rights, BYO-agent guide |
| Hackathon metrics | Real traffic and Stripe revenue come from this site. Don't fake either |

---

## 5. Timeline to 2026-12-16 (PROPOSED)

**Week 1 (Nov 21–27): de-risk**
- [ ] Email Remotion with the exact distribution model (R2).
- [ ] Create Repo A, copy the knowledge pack in, scaffold the monorepo, set up CI.
- [ ] **Spike:** one 3-second 9:16 Remotion clip + one 3-second 9:16 Motion Canvas clip (headless harness) → normalize → concat → ffprobe-verified MP4. No API key. If the MC harness is fragile by day 2, try Revideo (R1).
- [ ] Repo B: upgrade the SDK on its own branch; strip the demo; test a license-key item in Staging (R3).

**Week 2 (Nov 28–Dec 4): MVP vertical slice (Phase 1)**
- [ ] `project-schema` v0.1 with full validation tests (pack TEST_PLAN §1).
- [ ] Studio: create project → import/edit plan → scene list + timing → approve → render.
- [ ] Worker: job states, logs, cancel, retry, bounded concurrency.
- [ ] One polished Remotion template (kinetic title) + one MC template (animated explainer).
- [ ] Audio track (licensed sample only) + loudness normalization.
- [ ] Repo B: landing page, item and checkout in Staging, order page with keys and files.

**Week 3 (Dec 5–11): polish and package (Phase 2, trimmed)**
- [ ] Third template (product showcase), brand tokens, burned-in captions.
- [ ] Docker image + compose; clean-install test on a fresh Linux VM and on macOS.
- [ ] `agent-kit`: schema + prompt pack + example; test that Claude Code produces a valid plan.
- [ ] License inventory, NOTICE files, EULA draft.
- [ ] Repo B: docs, pricing page, refund and support policy, first release upload.

**Dec 12–16: ship**
- [ ] Run the TEST_PLAN release gate and record real results.
- [ ] Render the launch reel with ReelForge itself.
- [ ] Do a Staging test purchase and refund, then go live (pilot permitting).
- [ ] Submit to the hackathon with truthful claims.

**Explicitly after launch:** in-app LLM adapters, Ollama, trend features, template marketplace, Windows native, GPU acceleration.

---

## 6. MVP definition of done (from REQUIREMENTS.md, unchanged)

A fresh checkout can: install with documented steps → launch the UI → create or import the sample project → render one Remotion scene and one Motion Canvas scene → assemble a playable 9:16 MP4 → verify metadata and sample frames → run automated tests → do all of this **without an AI API key** → show the license notices.

---

## 7. Decisions needed from the founder

| # | Question | Recommendation |
| --- | --- | --- |
| Q1 | Motion Canvas is stale and editor-only for rendering. Do we accept **Revideo (MIT fork)** if our headless harness for upstream Motion Canvas is fragile? | Spike upstream first (2 days max), then fall back to Revideo |
| Q2 | Delivery format: source zip, Docker image, private GitHub access, or a mix? | MVP: source zip + Docker Compose. GitHub access later |
| Q3 | Supported OS for v1? | Linux (x64) + macOS (Apple Silicon) native, plus Docker. Windows through Docker/WSL2, labeled "untested" until it's tested |
| Q4 | Pricing structure and update policy: lifetime updates, or one year of updates? | Tiers by seats (Solo / Team / Agency), one year of updates + 30-day refund. Pick the numbers after 5 buyer conversations |
| Q5 | License enforcement in the product? | **None, or soft only.** Source code can't be DRM'd. Use the key to unlock downloads, updates and support, not to block rendering. Keeps D-003/D-004 honest |
| Q6 | Is the product's UI a local web app or a desktop app? | Local web app (Next.js + worker). Desktop (Electron/Tauri) later if buyers ask |
| Q7 | Are hackathon deadline and rules confirmed? | Check the official page today |

---

## 8. First commands once Q1–Q3 are answered

Repo A (empty):
1. Scaffold the monorepo + CI + knowledge pack (`AGENTS.md`, `docs/`, `research/`).
2. Build `packages/engine-remotion` with one composition and a `render(scene) → clip.mp4` adapter, plus a test that runs ffprobe on the result.
3. Build `packages/engine-motion-canvas` with the headless harness spike, plus the same test.
4. Build `packages/media-pipeline` with normalize + concat + validate, plus an end-to-end test that produces `out/sample-reel.mp4`.

Repo B (this one):
1. Branch: upgrade `@buildbase/sdk` to 1.8.x, fix types and build.
2. Branch: strip the BuildBase tour and demo modules.
3. Branch: ReelForge branding, landing page, commerce item, order page.

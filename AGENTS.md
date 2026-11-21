# AGENTS.md

Instructions for AI coding agents working in this repository. Read this first,
then [CONTRIBUTING.md](CONTRIBUTING.md).

## Contribution rules for AI agents (mandatory, every task)

These rules are enforced by the required `pr-policy` check and branch
protection on `main`. A pull request that breaks them cannot be merged. They
apply to this project's own agents and to anyone else's. Full rules:
[CONTRIBUTING.md](CONTRIBUTING.md).

1. **Work from an issue.** Every task has a GitHub issue; link it in the PR
   (`Closes #N` or `Refs #N`). No issue? Ask for one, or open it first with the
   _Task_ form.
2. **Branch:** never commit to `main`. Use `claude/<short-description>` (or your
   tool's prefix: `codex/`, `copilot/`, `cursor/`, `devin/`, `agent/`), or the
   branch your operator assigned.
3. **Pull request:** target `main`; open it as a **draft**; title is a
   Conventional Commit (`fix(render): …`); fill every template section; tick only
   checklist items that are true; under _AI assistance_ tick "AI-generated" or
   "AI-assisted", give `Tool:` and `model:`, and say what was checked on
   `Human checked:` (write "Not yet checked by a human" if nobody has).
4. **Before marking a PR ready:** run the project's checks locally (`npm run typecheck && npm run lint && npm test && npx prettier --check .`)
   and report the real result. Never claim a test, build or manual check you did
   not run.
5. **Never** delete, skip or weaken tests to go green; never commit secrets,
   keys, `.env` files or personal data; never force-push to a shared branch.
6. **Stay out of maintainer-only files** unless the task explicitly says so:
   `LICENSE*`, `NOTICE`, `*LICENSE*.md`, `TRADEMARK.md`, `CONTRIBUTING.md`,
   `AGENTS.md`, `CLAUDE.md`, `.github/`, and licence-enforcement code.
7. **Never merge or approve** a pull request, and never change repository
   settings, branch protection or rulesets. A human merges.
8. **Keep PRs small** (about 500 changed lines, generated files excluded) and to
   one purpose; split larger work into several PRs on the same issue.
9. **Commit attribution:** keep your tool's `Co-Authored-By:` trailer.

## Design and UI/UX rules (mandatory for any visual change)

ReelForge must never look AI-generated. Every agent that changes a page, a
component, a style, a reel template or a theme follows these rules, and so does
every human.

1. **Run the unslop skill.** It lives in this repository at
   [`.claude/skills/unslop/`](.claude/skills/unslop/SKILL.md) (Claude Code picks
   it up as `/unslop`; Codex reads it from `.agents/skills/unslop`, `$unslop`;
   any other agent: read `SKILL.md` and its `references/` and follow the same
   steps). Audit first against `references/signs.md`, write the direction, then
   fix in its pass order (spacing, color, icons, copy, type, layout, details,
   visuals, motion). Put the audit list and before/after screenshots (mobile
   390 px and desktop 1440 px) in the pull request. unslop is by Damir
   Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0; keep the credit.
2. **Simple, attractive color.** Tinted neutrals for the chrome, one accent
   color, and one bright element per screen (a real reel, a rendered object, a
   chart). No purple-to-blue gradients, glows, gradient text, glossy blobs,
   emoji labels, "New ✨" badges, uppercase tracked micro-labels or pulsing dots.
   Text meets WCAG AA contrast in light and dark themes.
3. **Motion that follows the scroll.** Parallax and reveal effects are driven by
   the scroll position: CSS scroll-driven animations (`animation-timeline:
view()` / `scroll()`) first, an IntersectionObserver fallback where needed.
   Animate only `transform` and `opacity`; no layout shift; no scroll-jacking or
   scroll snapping of the whole page; keep it at 60 fps on a mid-range phone.
   Use parallax sparingly (the hero visual and at most one more moment per page)
   so it reads as depth, not noise. Everything turns off under
   `prefers-reduced-motion: reduce`.
4. **Real product, real material.** Show real reels rendered by the studio, real
   tool calls and real numbers with a source. Never fabricate testimonials,
   logos, user counts or metrics; never use stock images you cannot license.
5. **Budgets.** Marketing pages: ≤ 150 KB first-load JS (gzip), LCP ≤ 2.0 s,
   CLS ≤ 0.05, Lighthouse mobile ≥ 90 for performance, accessibility, best
   practices and SEO. Report the numbers you measured in the PR.
6. **Reel templates and themes** (studio) follow the same rules: one idea per
   scene, deliberate type scale and easing, the theme's palette rather than
   default gradients, readable captions in the safe area, and a contact-sheet
   review before a template ships.

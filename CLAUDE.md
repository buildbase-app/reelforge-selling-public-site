# CLAUDE.md

Read [AGENTS.md](AGENTS.md) first: it is the shared contract for every coding
agent in this repo.

## Contribution rules (mandatory)

Before any change, follow "Contribution rules for AI agents" in [AGENTS.md](AGENTS.md):
work from an issue, never commit to `main`, open a draft PR with a Conventional
Commit title and the filled template (including AI assistance), run the checks,
stay out of maintainer-only files, and never merge or approve. PRs that break
these rules fail the required `pr-policy` check.

## Design rules

Any visual change follows "Design and UI/UX rules" in [AGENTS.md](AGENTS.md):
run the unslop skill (`/unslop`, in `.claude/skills/unslop/`), keep the palette
simple (tinted neutrals, one accent, one bright element), use scroll-driven
parallax and reveals with reduced-motion support, and meet the budgets.

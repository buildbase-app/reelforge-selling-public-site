# Dependency advisories: status

Known advisories in the store's dependencies, whether the live site is
affected, and what is planned. Update this file whenever `npm audit` or
Dependabot reports something new.

## Fixed

| Date       | Package                                                       | Advisory                                                | Fix                       |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------- | ------------------------- |
| 2026-11-21 | `@sentry/nextjs` 10.37 (direct)                               | critical: middleware bypass when using the tunnel route | `@sentry/nextjs` ^10.78.0 |
| 2026-11-21 | `prisma`, `@prisma/client`, `@prisma/adapter-d1` 7.8 (direct) | high (advisory range up to 7.10.0)                      | ^7.10.1                   |
| 2026-11-21 | `zod` 4.3 (direct)                                            | high: memory exhaustion on oversized input              | ^4.6.6                    |
| 2026-11-21 | Contentlayer and the packages only it pulled in (below)       | high and moderate, build time only, no upstream fix     | Removed (studio#48)       |

Contentlayer's tree: `contentlayer2`, `next-contentlayer2`, `mdx-bundler`,
`remark-mdx-frontmatter`, `toml`, `@effect-ts/*`, an old `zod` 3,
`@grpc/grpc-js`, the old OpenTelemetry chain and `js-yaml` 3. The blog and
changelog moved to BuildBase Blogs, so none of it is installed any more.

## Current counts (`npm audit`)

| Date       | State                                             | Critical | High | Moderate | Total |
| ---------- | ------------------------------------------------- | -------- | ---- | -------- | ----- |
| 2026-11-21 | Before (reelforge-studio#75)                      | 1        | 22   | 44       | 67    |
| 2026-11-21 | After the Sentry, Prisma and zod updates          | 0        | 19   | 41       | 60    |
| 2026-11-21 | After removing Contentlayer (reelforge-studio#48) | 0        | 8    | 26       | 34    |

Every high left is in the Prisma CLI or in development and build tooling
(below); none is in the code the Worker runs.

## Open, with a plan

| Package                                                                   | Where it comes from                                    | Live site affected?                    | Plan                                                                                                                                                                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma` CLI → `@prisma/config` → `effect`, `deepmerge-ts`                | The Prisma CLI (`prisma generate`, migrations)         | No: CLI only, not in the Worker bundle | Upgrade when Prisma ships a fixed 7.x (the audit's only "fix" is a downgrade to 6.12).                                                                                                                        |
| `vite` 8, `browserslist`, `source-map-js`, `brace-expansion`, `js-yaml` 4 | Test and lint tooling (vitest, eslint, the Next build) | No: development and build tools        | Refresh with the next tooling update. `npm audit fix` / `npm update` currently crash in npm 10.9.9's peer resolver (`Cannot read properties of null (reading 'edgesOut')`), so these are bumped individually. |

## How to check

```bash
npm audit
npm ls <package> --all   # who pulls it in
```

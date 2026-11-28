/**
 * Pure helpers behind `npm run setup` (scripts/dev/setup.mjs) and
 * `npm run dev:all` (scripts/dev/dev-all.mjs). Kept free of side effects
 * other than the explicit file helpers so they can be unit tested
 * (src/__tests__/dev-setup.test.ts).
 */
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/** The local dev server's port. Part of the contract with the studio's both.sh. */
export const DEV_PORT = 3000;

/**
 * The env file `npm run setup` writes. Next.js loads `.env.development.local`
 * under `next dev` only. `.env.local` would also be loaded by `next build`
 * (and embedded by OpenNext into the production Worker), so local values
 * would leak into a production build made on a laptop.
 */
export const ENV_FILE = '.env.development.local';

/** Wrangler's local vars file (`npm run preview`, and bindings under `next dev`). */
export const DEV_VARS_FILE = '.dev.vars';

/**
 * Wrangler needs Node >= 22.12 (its `engines`); Prisma 7 accepts ^22.12 or
 * >= 24. CI and the deploy workflow use Node 22.
 */
export const MIN_NODE = '22.12.0';

/** Room for node_modules (~2 GB) plus a `.next` build. */
export const MIN_FREE_DISK_GB = 3;

/**
 * The BuildBase **development** environment of the RenderWeld (ReelForge)
 * organization: its own users, sign-in client and Stripe test keys. Public
 * values; the same ones `npm run deploy:dev` builds dev.renderweld.com with.
 */
export const BUILDBASE_DEV = Object.freeze({
  serverUrl: 'https://api.console.buildbase.app',
  orgId: '6b01478bb42d2c444e99fcd8',
  environment: 'fsyqdskf',
  clientId: 'gqLbQtwsNKyzl2dKtx7v2u2GVAhP6AzPpAe1GvL7',
});

/** Secrets setup never generates: each developer brings their own. */
export const BRING_YOUR_OWN = [
  'BUILDBASE_CLIENT_SECRET',
  'BUILDBASE_WEBHOOK_SECRET',
  'BUILDBASE_CONTENT_WEBHOOK_SECRET',
  'BUILDBASE_API_TOKEN',
];

/** Strings that mark a value as an example, never a real secret. */
const PLACEHOLDER_MARKERS = [
  'your-',
  'change-me',
  'changeme',
  'placeholder',
  'example',
  'not-a-secret',
  'xxx',
];

/**
 * A URL-safe random secret: 48 bytes give 64 characters. Drawn again in the
 * rare case it happens to contain a placeholder marker (such as `xxx`), so
 * it always passes `isStrongSecret`.
 */
export function generateSecret(bytes = 48) {
  for (;;) {
    const secret = randomBytes(bytes).toString('base64url');
    if (isStrongSecret(secret)) return secret;
  }
}

/** True when `value` looks like a placeholder rather than a real value. */
export function isPlaceholder(value) {
  if (!value) return true;
  const v = String(value).toLowerCase();
  return PLACEHOLDER_MARKERS.some((m) => v.includes(m));
}

/**
 * Strong enough to sign tokens: at least 32 characters (what src/env.ts
 * demands), not a placeholder, and not a run of a few repeated characters.
 */
export function isStrongSecret(value) {
  if (typeof value !== 'string' || value.length < 32) return false;
  if (isPlaceholder(value)) return false;
  return new Set(value).size >= 12;
}

/** @typedef {Record<string, string | undefined>} EnvMap */

/**
 * Parses a dotenv file: `KEY=value`, optional `export `, `#` comments,
 * single or double quotes. Enough for the files this repo writes.
 *
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseEnv(text) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2];
    const quoted = value.match(/^(['"])(.*)\1$/);
    if (quoted) value = quoted[2];
    else value = value.replace(/\s+#.*$/, '').trim();
    out[m[1]] = value;
  }
  return out;
}

/**
 * What works with the values in an env object.
 *
 * @param {EnvMap} env
 */
export function credentialsState(env) {
  const has = (k) => !!env[k] && !isPlaceholder(env[k]);
  return {
    clientSecret: has('BUILDBASE_CLIENT_SECRET'),
    webhookSecret: has('BUILDBASE_WEBHOOK_SECRET'),
    apiToken: has('BUILDBASE_API_TOKEN'),
    systemSecret: isStrongSecret(env.SYSTEM_SECRET),
  };
}

/**
 * The contents of `.env.development.local`. `secrets` holds values carried
 * over from an earlier file or passed in the environment; anything missing
 * stays an empty placeholder. Without a client secret the file sets
 * SKIP_ENV_VALIDATION so the marketing pages still render.
 *
 * @param {{ systemSecret: string, secrets?: EnvMap, port?: number, date?: Date }} options
 * @returns {string}
 */
export function renderDevEnv({
  systemSecret,
  secrets = {},
  port = DEV_PORT,
  date = new Date(),
}) {
  if (!isStrongSecret(systemSecret)) {
    throw new Error('renderDevEnv: systemSecret must be a strong secret');
  }
  const url = `http://localhost:${port}`;
  const s = (k) => (secrets[k] && !isPlaceholder(secrets[k]) ? secrets[k] : '');
  const hasClientSecret = !!s('BUILDBASE_CLIENT_SECRET');
  const lines = [
    `# Written by \`npm run setup\` on ${date.toISOString().slice(0, 10)}. Git-ignored: never commit it.`,
    '# Read by `next dev` only (Next.js never loads .env.development.local in',
    '# `next build`), so production builds keep the values in .env.production.',
    '# Rewrite it with `npm run setup -- --force` (secrets are kept). DEVELOPMENT.md',
    '# explains every value.',
    '',
    '# --- Site ---',
    `SITE_URL=${url}`,
    `NEXT_PUBLIC_SITE_URL=${url}`,
    '',
    '# --- BuildBase: the DEVELOPMENT environment (test users, Stripe test keys) ---',
    `NEXT_PUBLIC_BUILDBASE_SERVER_URL=${BUILDBASE_DEV.serverUrl}`,
    `NEXT_PUBLIC_BUILDBASE_ORG_ID=${BUILDBASE_DEV.orgId}`,
    `NEXT_PUBLIC_BUILDBASE_ENVIRONMENT=${BUILDBASE_DEV.environment}`,
    `NEXT_PUBLIC_BUILDBASE_CLIENT_ID=${BUILDBASE_DEV.clientId}`,
    '# Must be listed as a redirect URL (and allowed origin) on the client above.',
    `NEXT_PUBLIC_BUILDBASE_REDIRECT_URL=${url}`,
    '',
    '# --- Generated locally by setup: signs tokens this app mints ---',
    `SYSTEM_SECRET=${systemSecret}`,
    '',
    '# --- Your own secrets (never shared, never committed) ---',
    "# The development client's secret: BuildBase console, organization",
    '# 6b01478bb42d2c444e99fcd8, environment "fsyqdskf", Auth, the client',
    `# ${BUILDBASE_DEV.clientId}. Ask a maintainer for console access.`,
    '# Empty: sign-in, checkout and the dashboard are off; marketing pages work.',
    `BUILDBASE_CLIENT_SECRET=${s('BUILDBASE_CLIENT_SECRET')}`,
    '# Signing secret of a webhook endpoint you registered for a public tunnel',
    '# URL (console, Settings, Webhooks). Empty: /api/webhooks/* answer 503.',
    `BUILDBASE_WEBHOOK_SECRET=${s('BUILDBASE_WEBHOOK_SECRET')}`,
    `BUILDBASE_CONTENT_WEBHOOK_SECRET=${s('BUILDBASE_CONTENT_WEBHOOK_SECRET')}`,
    '# App-server API key (console, Settings, API keys) with content-reader and',
    '# marketplace_items read. Empty: local FAQ defaults, prices read in the',
    '# browser, empty blog and changelog.',
    `BUILDBASE_API_TOKEN=${s('BUILDBASE_API_TOKEN')}`,
  ];
  if (!hasClientSecret) {
    lines.push(
      '',
      '# --- No client secret yet ---',
      '# src/env.ts would refuse to start without BUILDBASE_CLIENT_SECRET. Delete',
      '# this line once you have filled it in above.',
      'SKIP_ENV_VALIDATION=true'
    );
  }
  return lines.join('\n') + '\n';
}

/**
 * Builds the values for a (re)written env file: keeps a strong SYSTEM_SECRET
 * and every bring-your-own secret from the previous file, then lets the
 * process environment fill in what is still missing.
 *
 * @param {{ previous?: EnvMap, processEnv?: EnvMap }} [sources]
 * @returns {{ systemSecret: string, secrets: Record<string, string> }}
 */
export function collectSecrets({ previous = {}, processEnv = {} } = {}) {
  /** @type {Record<string, string>} */
  const secrets = {};
  for (const key of BRING_YOUR_OWN) {
    const old = previous[key];
    const fromEnv = processEnv[key];
    if (old && !isPlaceholder(old)) secrets[key] = old;
    else if (fromEnv && !isPlaceholder(fromEnv)) secrets[key] = fromEnv;
  }
  const systemSecret = isStrongSecret(previous.SYSTEM_SECRET)
    ? previous.SYSTEM_SECRET
    : generateSecret();
  return { systemSecret, secrets };
}

/**
 * Writes `content` to `file` unless it exists. With `force`, the old file is
 * first copied to `<file>.bak`. Returns what happened.
 *
 * @param {string} file
 * @param {string} content
 * @param {{ force?: boolean }} [options]
 * @returns {{ action: 'created' | 'kept' | 'overwritten', backup?: string }}
 */
export function writeFileSafe(file, content, { force = false } = {}) {
  if (fs.existsSync(file)) {
    if (!force) return { action: 'kept' };
    const backup = `${file}.bak`;
    fs.copyFileSync(file, backup);
    fs.writeFileSync(file, content, { mode: 0o600 });
    return { action: 'overwritten', backup };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, { mode: 0o600 });
  return { action: 'created' };
}

/** Compares dotted versions: -1, 0 or 1. Leading `v` is ignored. */
export function compareVersions(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map(Number);
  const pb = String(b).replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

/**
 * The Node version this repo needs: the higher of `.nvmrc` (a major such as
 * `22`, or a full version) and MIN_NODE.
 */
export function requiredNode(nvmrc) {
  const v = String(nvmrc ?? '')
    .trim()
    .replace(/^v/, '');
  if (!/^\d+(\.\d+){0,2}$/.test(v)) return MIN_NODE;
  return compareVersions(v, MIN_NODE) > 0 ? v : MIN_NODE;
}

/**
 * The studio checkout to read studio docs from (the MCP tool reference):
 * STUDIO_REPO_DIR when set, else `../reelforge-studio` next to this repo.
 * `explicit` says whether the developer asked for it, so callers can fail
 * loudly instead of falling back when an explicit path is wrong.
 *
 * @param {{ env?: EnvMap, repoRoot: string }} options
 * @returns {{ dir: string, explicit: boolean }}
 */
export function resolveStudioDir({ env = {}, repoRoot }) {
  const explicit = !!env.STUDIO_REPO_DIR;
  const dir = path.resolve(
    repoRoot,
    env.STUDIO_REPO_DIR || path.join('..', 'reelforge-studio')
  );
  return { dir, explicit };
}

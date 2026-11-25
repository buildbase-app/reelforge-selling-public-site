#!/usr/bin/env node
/**
 * Runs the whole site locally: `npm run dev:all`.
 *
 *   npm run dev:all                  # next dev on http://localhost:3000
 *   npm run dev:all -- --preview     # production build in the Workers runtime
 *                                    # (OpenNext + wrangler dev), same port
 *   npm run dev:all -- --skip-db     # do not apply local D1 migrations first
 *
 * Before starting it applies any new D1 migration to the local database and
 * checks that port 3000 is free. Values come from .env.development.local
 * (`npm run setup`); without that file it still starts, with the public
 * development-environment values and SKIP_ENV_VALIDATION, so the marketing
 * pages work. Ctrl-C (or SIGTERM from the studio's both.sh) stops everything.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BUILDBASE_DEV,
  DEV_PORT,
  ENV_FILE,
  credentialsState,
  generateSecret,
  parseEnv,
  resolveStudioDir,
} from './lib.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);
const argv = process.argv.slice(2);
const PREVIEW = argv.includes('--preview');
const SKIP_DB = argv.includes('--skip-db');
const IS_WIN = process.platform === 'win32';
const PORT = DEV_PORT;
const BASE = `http://localhost:${PORT}`;
const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
const log = (s = '') => console.log(`${paint(36, '[dev:all]')} ${s}`);

function bin(name) {
  return path.join(ROOT, 'node_modules', '.bin', IS_WIN ? `${name}.cmd` : name);
}

function portFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port);
  });
}

if (!fs.existsSync(bin('next'))) {
  console.error('Dependencies are not installed. Run `npm run setup` first.');
  process.exit(1);
}

if (!(await portFree(PORT))) {
  console.error(
    `Port ${PORT} is already in use. Stop whatever is listening there and try again:\n  ` +
      (IS_WIN
        ? `netstat -ano | findstr :${PORT}   then: taskkill /PID <pid> /F`
        : `lsof -nP -iTCP:${PORT} -sTCP:LISTEN   then: kill <pid>`) +
      `\nThe site must run on ${PORT}: it is the redirect URL registered on the BuildBase development client.`
  );
  process.exit(1);
}

// --- Local values ---------------------------------------------------------
const envPath = path.join(ROOT, ENV_FILE);
let fileEnv = {};
const childEnv = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: '1',
  WRANGLER_SEND_METRICS: 'false',
};
if (fs.existsSync(envPath)) {
  fileEnv = parseEnv(fs.readFileSync(envPath, 'utf8'));
} else {
  log(
    paint(
      33,
      `${ENV_FILE} not found: starting with public development values only (run \`npm run setup\`).`
    )
  );
  Object.assign(childEnv, {
    SITE_URL: BASE,
    NEXT_PUBLIC_SITE_URL: BASE,
    NEXT_PUBLIC_BUILDBASE_SERVER_URL: BUILDBASE_DEV.serverUrl,
    NEXT_PUBLIC_BUILDBASE_ORG_ID: BUILDBASE_DEV.orgId,
    NEXT_PUBLIC_BUILDBASE_ENVIRONMENT: BUILDBASE_DEV.environment,
    NEXT_PUBLIC_BUILDBASE_CLIENT_ID: BUILDBASE_DEV.clientId,
    NEXT_PUBLIC_BUILDBASE_REDIRECT_URL: BASE,
    SYSTEM_SECRET: process.env.SYSTEM_SECRET || generateSecret(),
    SKIP_ENV_VALIDATION: 'true',
  });
  fileEnv = { ...childEnv };
}
const creds = credentialsState({ ...fileEnv, ...process.env });
if (
  !creds.clientSecret &&
  !fileEnv.SKIP_ENV_VALIDATION &&
  !process.env.SKIP_ENV_VALIDATION
) {
  log(
    paint(
      33,
      'No BUILDBASE_CLIENT_SECRET: adding SKIP_ENV_VALIDATION=true so the marketing pages start.'
    )
  );
  childEnv.SKIP_ENV_VALIDATION = 'true';
}

// --- Local D1 -------------------------------------------------------------
if (!SKIP_DB) {
  log('Applying new D1 migrations to the local database...');
  const r = spawnSync(
    bin('wrangler'),
    ['d1', 'migrations', 'apply', 'DB', '--local'],
    {
      cwd: ROOT,
      env: { ...childEnv, CI: process.env.CI ?? '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      shell: IS_WIN,
    }
  );
  if (r.status !== 0) {
    process.stdout.write(r.stdout ?? '');
    process.stderr.write(r.stderr ?? '');
    console.error(
      'Local D1 migrations failed. Reset with: rm -rf .wrangler/state && npm run db:migrate:local'
    );
    process.exit(1);
  }
  log(
    /No migrations to apply/.test(r.stdout)
      ? 'Local D1 is up to date.'
      : 'Local D1 migrated.'
  );
}

// --- Start ----------------------------------------------------------------
let child;
let stopping = false;

function start(cmd, cmdArgs, env) {
  child = spawn(cmd, cmdArgs, {
    cwd: ROOT,
    env,
    stdio: 'inherit',
    shell: IS_WIN,
  });
  child.on('exit', (code, signal) => {
    if (!stopping) log(`${path.basename(cmd)} exited (${signal ?? code}).`);
    process.exit(stopping ? 0 : (code ?? (signal ? 1 : 0)));
  });
}

for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => {
    stopping = true;
    if (child && child.exitCode === null) child.kill(sig);
    else process.exit(0);
    // Give the server a moment to stop its workers, then leave regardless.
    setTimeout(() => process.exit(0), 5000).unref();
  });
}

async function waitAndAnnounce() {
  const deadline = Date.now() + 5 * 60_000;
  while (Date.now() < deadline && !stopping) {
    try {
      const res = await fetch(`${BASE}/`, { redirect: 'manual' });
      if (res.status) break;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (stopping) return;
  const { dir: studioDir } = resolveStudioDir({
    env: process.env,
    repoRoot: ROOT,
  });
  const studio = fs.existsSync(path.join(studioDir, 'package.json'))
    ? studioDir
    : null;
  const yes = (b) => (b ? paint(32, 'on ') : paint(33, 'off'));
  console.log(
    [
      '',
      paint(
        1,
        `RenderWeld site is up (${PREVIEW ? 'OpenNext preview, Workers runtime' : 'next dev'})`
      ),
      `  Site          ${BASE}/`,
      `  Pricing       ${BASE}/pricing`,
      `  Agents / MCP  ${BASE}/agents   ${BASE}/api/mcp`,
      `  Health        ${BASE}/api/health?deep=true`,
      '',
      `  ${yes(true)} marketing pages`,
      `  ${yes(creds.clientSecret)} sign-in, checkout, dashboard  (BUILDBASE_CLIENT_SECRET in ${ENV_FILE})`,
      `  ${yes(creds.apiToken)} console FAQs, blocks, blog, server-rendered prices  (BUILDBASE_API_TOKEN)`,
      `  ${yes(creds.webhookSecret)} webhooks  (BUILDBASE_WEBHOOK_SECRET; BuildBase cannot reach localhost:`,
      `      run \`cloudflared tunnel --url ${BASE}\` and register <tunnel>/api/webhooks/buildbase in the console)`,
      '',
      PREVIEW
        ? '  This is the production build in workerd. For hot reload: npm run dev:all'
        : '  Workers-faithful run (OpenNext + workerd): npm run dev:all -- --preview',
      studio
        ? `  Studio checkout: ${studio} (STUDIO_REPO_DIR; npm run check:mcp-tools reads its docs)`
        : '  No studio checkout found (STUDIO_REPO_DIR, default ../reelforge-studio): check:mcp-tools reads GitHub',
      '  Stop: Ctrl-C.  Guide: DEVELOPMENT.md',
      '',
    ].join('\n')
  );
}

if (PREVIEW) {
  // `next build` reads .env.production, never .env.development.local, so the
  // development values are passed in the environment and inlined instead
  // (as `npm run deploy:dev` does for dev.renderweld.com). At runtime,
  // .dev.vars sets NEXTJS_ENV=development, so the Worker reads the secrets
  // from .env.development.local, which OpenNext embeds into the local build.
  const publicKeys = Object.keys(fileEnv).filter(
    (k) => k.startsWith('NEXT_PUBLIC_') || k === 'SITE_URL'
  );
  const buildEnv = { ...childEnv, SKIP_ENV_VALIDATION: 'true' };
  for (const k of publicKeys) buildEnv[k] = fileEnv[k];
  for (const k of [
    'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
    'NEXT_PUBLIC_BING_SITE_VERIFICATION',
    'NEXT_PUBLIC_YANDEX_SITE_VERIFICATION',
  ])
    buildEnv[k] = '';
  log(
    'Building for Cloudflare Workers (opennextjs-cloudflare build; a few minutes)...'
  );
  const b = spawnSync(bin('opennextjs-cloudflare'), ['build'], {
    cwd: ROOT,
    env: buildEnv,
    stdio: 'inherit',
    shell: IS_WIN,
  });
  if (b.status !== 0) {
    console.error('OpenNext build failed (see above).');
    process.exit(b.status ?? 1);
  }
  log(`Starting wrangler dev on ${BASE} ...`);
  start(
    bin('opennextjs-cloudflare'),
    ['preview', '--port', String(PORT), '--ip', 'localhost'],
    childEnv
  );
} else {
  log(`Starting next dev on ${BASE} ...`);
  start(bin('next'), ['dev', '--turbopack', '--port', String(PORT)], childEnv);
}
waitAndAnnounce();

#!/usr/bin/env node
/**
 * One-command developer setup: `npm run setup`. Safe to run again at any time.
 *
 *   1. Checks prerequisites and prints a fix for each problem (Node, npm,
 *      disk space, port 3000, Playwright browsers, a stray .env.local).
 *   2. Installs dependencies with `npm ci` (skipped when package-lock.json has
 *      not changed since the last install).
 *   3. Writes `.env.development.local` for the BuildBase development
 *      environment with a generated SYSTEM_SECRET, and `.dev.vars` for
 *      Wrangler. Existing files are never overwritten without --force.
 *   4. Applies the D1 migrations to the local database (.wrangler/state).
 *
 * Flags:
 *   --force         rewrite the env files (old copies saved as *.bak; your
 *                   SYSTEM_SECRET and secrets are carried over)
 *   --skip-install  do not run npm ci
 *   --skip-db       do not apply the local D1 migrations
 *   --check         only check prerequisites, change nothing
 *
 * Secrets: BUILDBASE_CLIENT_SECRET, BUILDBASE_WEBHOOK_SECRET,
 * BUILDBASE_CONTENT_WEBHOOK_SECRET and BUILDBASE_API_TOKEN, when set in the
 * environment of this command, are written into the new env file. They are
 * never generated and never printed. See DEVELOPMENT.md.
 *
 * Works standalone and when the studio's scripts/dev/both.sh calls it; it
 * never prompts.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEV_PORT,
  DEV_VARS_FILE,
  ENV_FILE,
  MIN_FREE_DISK_GB,
  collectSecrets,
  compareVersions,
  credentialsState,
  parseEnv,
  renderDevEnv,
  requiredNode,
  writeFileSafe,
} from './lib.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..'
);
const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const CHECK_ONLY = args.has('--check');
const SKIP_INSTALL = args.has('--skip-install') || CHECK_ONLY;
const SKIP_DB = args.has('--skip-db') || CHECK_ONLY;
const IS_WIN = process.platform === 'win32';
const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);

const problems = [];
const warnings = [];
const ok = (msg) => console.log(`  ${paint(32, 'ok')}    ${msg}`);
const warn = (msg, fix) => {
  warnings.push(msg);
  console.log(
    `  ${paint(33, 'warn')}  ${msg}${fix ? `\n        fix: ${fix}` : ''}`
  );
};
const fail = (msg, fix) => {
  problems.push(msg);
  console.log(
    `  ${paint(31, 'fail')}  ${msg}${fix ? `\n        fix: ${fix}` : ''}`
  );
};
const step = (title) => console.log(`\n${paint(1, title)}`);

function run(cmd, cmdArgs, opts = {}) {
  return spawnSync(cmd, cmdArgs, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: IS_WIN,
    ...opts,
  });
}

function capture(cmd, cmdArgs) {
  const r = spawnSync(cmd, cmdArgs, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: IS_WIN,
  });
  return r.status === 0 ? r.stdout.trim() : null;
}

function portFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port);
  });
}

function lockHash() {
  return createHash('sha256')
    .update(fs.readFileSync(path.join(ROOT, 'package-lock.json')))
    .digest('hex');
}

const STAMP = path.join(ROOT, 'node_modules', '.setup-lock-hash');

function playwrightBrowsersDir() {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH)
    return process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (process.platform === 'darwin')
    return path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
  if (IS_WIN)
    return path.join(process.env.LOCALAPPDATA || os.homedir(), 'ms-playwright');
  return path.join(os.homedir(), '.cache', 'ms-playwright');
}

async function checkPrerequisites() {
  step('1. Prerequisites');

  const nvmrc = fs.existsSync(path.join(ROOT, '.nvmrc'))
    ? fs.readFileSync(path.join(ROOT, '.nvmrc'), 'utf8')
    : '';
  const needNode = requiredNode(nvmrc);
  if (compareVersions(process.version, needNode) >= 0) {
    ok(`Node ${process.version} (needs >= ${needNode})`);
  } else {
    fail(
      `Node ${process.version} is too old: this repo needs >= ${needNode} (Wrangler's minimum).`,
      'nvm install && nvm use   (or: fnm use --install-if-missing, volta install node@22, brew install node@22)'
    );
  }

  const npmVersion = capture('npm', ['--version']);
  if (!npmVersion)
    fail(
      'npm was not found on PATH.',
      'reinstall Node.js 22 from https://nodejs.org (npm comes with it)'
    );
  else if (compareVersions(npmVersion, '10.0.0') < 0)
    fail(
      `npm ${npmVersion} is too old (needs >= 10).`,
      'npm install -g npm@10'
    );
  else ok(`npm ${npmVersion}`);

  if (typeof fs.statfsSync === 'function') {
    try {
      const st = fs.statfsSync(ROOT);
      const freeGb = (st.bavail * st.bsize) / 1024 ** 3;
      const needsInstall = !fs.existsSync(path.join(ROOT, 'node_modules'));
      if (freeGb < MIN_FREE_DISK_GB && needsInstall && !SKIP_INSTALL) {
        fail(
          `Only ${freeGb.toFixed(1)} GB free; node_modules needs about 2 GB and a build about 1 GB more.`,
          `free at least ${MIN_FREE_DISK_GB} GB (old .next/, .open-next/ and node_modules/ folders are safe to delete)`
        );
      } else if (freeGb < MIN_FREE_DISK_GB) {
        warn(
          `Only ${freeGb.toFixed(1)} GB free: a build (.next, .open-next) may run out of space.`,
          'delete .next/ and .open-next/ when you are done with a build'
        );
      } else ok(`${freeGb.toFixed(1)} GB free disk`);
    } catch {
      warn('Could not read free disk space.');
    }
  }

  if (await portFree(DEV_PORT)) ok(`port ${DEV_PORT} is free`);
  else
    warn(
      `Port ${DEV_PORT} is in use: \`npm run dev:all\` needs it (the BuildBase redirect URL is http://localhost:${DEV_PORT}).`,
      IS_WIN
        ? `netstat -ano | findstr :${DEV_PORT}   then: taskkill /PID <pid> /F`
        : `lsof -nP -iTCP:${DEV_PORT} -sTCP:LISTEN   then stop that process (kill <pid>)`
    );

  if (fs.existsSync(path.join(ROOT, '.env.local'))) {
    warn(
      '.env.local exists. `next build`, `npm run preview` and `npm run deploy` also read it, and it overrides .env.production.',
      `move its values into ${ENV_FILE} (read by \`next dev\` only) and delete .env.local`
    );
  }
  if (fs.existsSync(path.join(ROOT, '.env'))) {
    warn(
      '.env exists. Production builds read it too, and OpenNext embeds it into the Worker.',
      `keep local values in ${ENV_FILE} instead`
    );
  }

  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) {
    ok('HTTPS proxy set (npm, Wrangler and Playwright use HTTPS_PROXY)');
    if (!process.env.NODE_EXTRA_CA_CERTS)
      console.log(
        '        note: if TLS fails behind the proxy, export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem (DEVELOPMENT.md, "Corporate proxies")'
      );
  }
}

function checkInstalledTools() {
  const wranglerPkg = path.join(
    ROOT,
    'node_modules',
    'wrangler',
    'package.json'
  );
  if (fs.existsSync(wranglerPkg)) {
    const { version } = JSON.parse(fs.readFileSync(wranglerPkg, 'utf8'));
    ok(
      `wrangler ${version} (local, node_modules/.bin/wrangler; no global install needed)`
    );
  } else if (!CHECK_ONLY) {
    fail('wrangler is missing from node_modules.', 'npm ci');
  } else {
    warn('Dependencies are not installed yet.', 'npm run setup');
  }

  // Playwright: optional, only for `npm run test:e2e` and the e2e:* scripts.
  const browsersJson = path.join(
    ROOT,
    'node_modules',
    'playwright-core',
    'browsers.json'
  );
  if (fs.existsSync(browsersJson)) {
    const { browsers } = JSON.parse(fs.readFileSync(browsersJson, 'utf8'));
    const chromium = browsers.find((b) => b.name === 'chromium');
    const dir = playwrightBrowsersDir();
    const have =
      chromium &&
      fs.existsSync(path.join(dir, `chromium-${chromium.revision}`));
    if (have)
      ok(`Playwright Chromium ${chromium.browserVersion} (for e2e tests)`);
    else
      warn(
        'Playwright browsers are not installed (optional: only the e2e tests need them).',
        process.platform === 'linux'
          ? 'npx playwright install --with-deps chromium'
          : 'npx playwright install chromium'
      );
  }
}

function install() {
  step('2. Dependencies');
  if (SKIP_INSTALL) {
    console.log('  skipped (--skip-install)');
    return true;
  }
  const hash = lockHash();
  const stamped =
    fs.existsSync(STAMP) && fs.readFileSync(STAMP, 'utf8').trim() === hash;
  if (stamped && fs.existsSync(path.join(ROOT, 'node_modules', '.bin'))) {
    ok(
      'node_modules matches package-lock.json (npm ci skipped; delete node_modules to force it)'
    );
    return true;
  }
  console.log('  npm ci (a few minutes the first time)...');
  const r = run('npm', ['ci', '--no-audit', '--no-fund']);
  if (r.status !== 0) {
    fail(
      'npm ci failed.',
      'read the error above. Behind a proxy: set HTTPS_PROXY and NODE_EXTRA_CA_CERTS. On EBADENGINE: switch to Node 22 (nvm use)'
    );
    return false;
  }
  fs.writeFileSync(STAMP, hash + '\n');
  ok('dependencies installed (Prisma client generated by postinstall)');
  return true;
}

function writeEnvFiles() {
  step('3. Local configuration');
  const envPath = path.join(ROOT, ENV_FILE);
  const previous = fs.existsSync(envPath)
    ? parseEnv(fs.readFileSync(envPath, 'utf8'))
    : {};

  if (CHECK_ONLY) {
    if (fs.existsSync(envPath)) ok(`${ENV_FILE} exists`);
    else warn(`${ENV_FILE} is missing.`, 'npm run setup');
  } else {
    const { systemSecret, secrets } = collectSecrets({
      previous,
      processEnv: process.env,
    });
    const result = writeFileSafe(
      envPath,
      renderDevEnv({ systemSecret, secrets }),
      { force: FORCE }
    );
    if (result.action === 'kept')
      ok(
        `${ENV_FILE} already exists: kept as is (rewrite with \`npm run setup -- --force\`)`
      );
    else if (result.action === 'overwritten')
      ok(
        `${ENV_FILE} rewritten (old copy: ${path.basename(result.backup)}; secrets carried over)`
      );
    else
      ok(
        `${ENV_FILE} written: BuildBase development environment, generated SYSTEM_SECRET`
      );
  }

  const devVarsPath = path.join(ROOT, DEV_VARS_FILE);
  if (!CHECK_ONLY) {
    const example = path.join(ROOT, `${DEV_VARS_FILE}.example`);
    const content = fs.existsSync(example)
      ? fs.readFileSync(example, 'utf8')
      : 'NEXTJS_ENV=development\n';
    const r = writeFileSafe(devVarsPath, content, { force: FORCE });
    if (r.action === 'kept') ok(`${DEV_VARS_FILE} already exists: kept as is`);
    else
      ok(
        `${DEV_VARS_FILE} written from ${DEV_VARS_FILE}.example (NEXTJS_ENV=development)`
      );
  }
  if (fs.existsSync(devVarsPath)) {
    const vars = parseEnv(fs.readFileSync(devVarsPath, 'utf8'));
    if (vars.NEXTJS_ENV !== 'development')
      warn(
        `${DEV_VARS_FILE} does not set NEXTJS_ENV=development, so \`npm run dev:all -- --preview\` will not read ${ENV_FILE}.`,
        `add NEXTJS_ENV=development to ${DEV_VARS_FILE}`
      );
  }

  const current = fs.existsSync(envPath)
    ? parseEnv(fs.readFileSync(envPath, 'utf8'))
    : {};
  return credentialsState(current);
}

function migrate() {
  step('4. Local database (D1)');
  if (SKIP_DB) {
    console.log(`  skipped (${CHECK_ONLY ? '--check' : '--skip-db'})`);
    return true;
  }
  const r = run('npm', ['run', '-s', 'db:migrate:local'], {
    env: {
      ...process.env,
      CI: process.env.CI ?? '1',
      WRANGLER_SEND_METRICS: 'false',
    },
  });
  if (r.status !== 0) {
    fail(
      'Applying the local D1 migrations failed.',
      'read the Wrangler error above; to start from an empty database: rm -rf .wrangler/state && npm run db:migrate:local'
    );
    return false;
  }
  ok('local D1 is up to date (.wrangler/state/v3/d1)');
  return true;
}

function summary(creds) {
  step('Summary');
  if (problems.length) {
    console.log(
      paint(
        31,
        `  ${problems.length} problem(s) to fix, then run \`npm run setup\` again:`
      )
    );
    for (const p of problems) console.log(`    - ${p}`);
    return;
  }
  if (CHECK_ONLY) {
    console.log('  Prerequisites checked; nothing was changed.');
    return;
  }
  const yes = (b) => (b ? paint(32, 'yes') : paint(33, 'no '));
  console.log(
    `  Marketing pages (/, /pricing, /agents, /gallery, legal)  ${yes(true)}`
  );
  console.log(
    `  Sign-in, checkout, dashboard (BUILDBASE_CLIENT_SECRET)   ${yes(creds?.clientSecret)}`
  );
  console.log(
    `  Console content, server prices (BUILDBASE_API_TOKEN)     ${yes(creds?.apiToken)}`
  );
  console.log(
    `  Webhooks (BUILDBASE_WEBHOOK_SECRET + a tunnel)           ${yes(creds?.webhookSecret)}`
  );
  if (!creds?.clientSecret) {
    console.log(
      `\n  To sign in locally, put the development client's secret in ${ENV_FILE}`
    );
    console.log(
      '  (BUILDBASE_CLIENT_SECRET), delete its SKIP_ENV_VALIDATION line, and make sure'
    );
    console.log(
      `  http://localhost:${DEV_PORT} is a redirect URL and allowed origin on that client.`
    );
    console.log(
      '  DEVELOPMENT.md, "BuildBase credentials", says where to get it.'
    );
  }
  console.log(
    `\n  Next: ${paint(1, 'npm run dev:all')}   then open http://localhost:${DEV_PORT}`
  );
}

await checkPrerequisites();
let creds;
if (!problems.length) {
  if (install()) {
    step('   Installed tools');
    checkInstalledTools();
    creds = writeEnvFiles();
    migrate();
  }
}
summary(creds);
process.exit(problems.length ? 1 : 0);

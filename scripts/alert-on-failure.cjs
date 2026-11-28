/* eslint-disable @typescript-eslint/no-require-imports -- a plain Node CommonJS script */
// Run one npm script and post to ALERT_WEBHOOK_URL if it fails (studio
// issue #605), for the nightly e2e:personal run against the test site:
//
//   node scripts/alert-on-failure.cjs e2e:personal
//
// Exits with the script's own code, so the job still fails.
const { spawnSync } = require('node:child_process');
const { sendAlert } = require('./lib/smoke.cjs');

const name = process.argv[2];
if (!name || !/^[a-z0-9:_-]+$/i.test(name)) {
  console.error('Usage: alert-on-failure.cjs <npm script name>');
  process.exit(2);
}
const run = spawnSync('npm', ['run', name], { stdio: 'inherit' });
const code = run.status ?? 1;
if (code === 0) process.exit(0);
sendAlert(
  `Nightly npm run ${name} failed (exit ${code}) on ${process.env.SITE || 'its default site'}.`
).finally(() => process.exit(code));

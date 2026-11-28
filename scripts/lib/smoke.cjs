// Helpers for the post-deploy sign-in smoke test and the nightly e2e run
// (studio issue #605). No browser here, so the tests can load it.

/** How long Sign In may take to reach the hosted page, in milliseconds. */
const SIGN_IN_DEADLINE_MS = 10_000;

/**
 * The browser has left the store for the hosted sign-in page: an https
 * address on another host. When `hostedHost` is given (HOSTED_HOST), the
 * page must be on that host or one of its subdomains.
 */
function reachedHostedSignIn(siteUrl, currentUrl, hostedHost) {
  let site;
  let now;
  try {
    site = new URL(siteUrl);
    now = new URL(currentUrl);
  } catch {
    return false;
  }
  if (now.protocol !== 'https:' || now.host === site.host) return false;
  if (!hostedHost) return true;
  const want = hostedHost.toLowerCase();
  const host = now.hostname.toLowerCase();
  return host === want || host.endsWith(`.${want}`);
}

/**
 * Post a one-line alert to ALERT_WEBHOOK_URL (a Slack-style incoming
 * webhook taking `{ text }`). Without the variable it only logs, and the
 * job's own failure is the alert. Never throws: an alert that can't be sent
 * must not hide the failure it reports.
 */
async function sendAlert(text, env = process.env, fetchImpl = fetch) {
  const url = env.ALERT_WEBHOOK_URL;
  if (!url) {
    console.error(`ALERT (no ALERT_WEBHOOK_URL set): ${text}`);
    return false;
  }
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) console.error(`Alert webhook answered ${res.status}`);
    return res.ok;
  } catch (error) {
    console.error(`Alert webhook failed: ${error && error.message}`);
    return false;
  }
}

module.exports = { SIGN_IN_DEADLINE_MS, reachedHostedSignIn, sendAlert };

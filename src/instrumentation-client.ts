/**
 * Browser Sentry, loaded late (studio issue #79).
 *
 * Only when NEXT_PUBLIC_SENTRY_DSN is set at build time, and only once the
 * page is idle (or on the first interaction, whichever comes first), so the
 * SDK and session replay never count towards the first load. Without a DSN
 * this file compiles to nothing. Server-side Sentry is unchanged
 * (src/instrumentation.ts).
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== 'undefined') {
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    void import('../sentry.client.config');
  };
  const events = ['pointerdown', 'keydown'] as const;
  for (const name of events) {
    window.addEventListener(name, load, { once: true, passive: true });
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(load, { timeout: 5000 });
  } else {
    setTimeout(load, 3000);
  }
}

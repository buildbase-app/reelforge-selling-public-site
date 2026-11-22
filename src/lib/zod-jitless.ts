import { z } from 'zod';

/**
 * zod v4 without its eval probe (studio issue #193).
 *
 * The first `z.object()` zod builds checks whether the page may compile code
 * with `new Function("")`. The store's nonce CSP (store #17) has no
 * `'unsafe-eval'`, so the browser blocks that call and reports a
 * `script-src 'eval'` violation on every page that runs zod (`/pricing`,
 * `/order`, `/dashboard/*`), even though zod catches the error. With
 * `jitless` zod never makes the call. It already ran without its JIT under
 * this CSP, so parsing is unchanged.
 *
 * zod reads the setting when it builds a schema, and the SDK builds some as
 * soon as its module runs. So this module must run before the SDK's: it is
 * the first import of every client module that imports the SDK's React
 * entry (or zod). One entry point is not enough, because the browser may
 * evaluate a page's module before its layout's (seen on `/dashboard/*`).
 * src/__tests__/zod-jitless.test.ts checks every such module.
 *
 * The SDK does not bundle zod: it imports this same `zod` package, and zod
 * keeps the setting on `globalThis`, so the SDK's schemas follow it.
 *
 * Not in `instrumentation-client.ts`: that runs on every page, and even
 * zod's `config` alone adds about 5 KB to the provider-free public pages,
 * which takes them over their 150 KB budget.
 */
z.config({ jitless: true });

/**
 * The self-hosted Geist file every page preloads (src/app/layout.tsx,
 * src/app/geist.css): its latin "core", which draws ASCII and the site's
 * punctuation. Geist is the interface face, so every page's text uses it.
 */
export const GEIST_CORE_URL = '/fonts/geist-latin-core.8e4a2f39.woff2';

/**
 * The self-hosted Geist Mono file a page can preload (src/app/geist-mono.css):
 * its latin "core", which draws ASCII and the site's punctuation. Without a
 * preload the browser finds a font only after the stylesheet is parsed and
 * the page laid out, so on a slow link the text that needs it waits a round
 * trip more. /agents preloads it: its largest element is a terminal snippet
 * in Geist Mono. (Next's own font preloads never reach the HTML on Workers.)
 */
export const GEIST_MONO_CORE_URL =
  '/fonts/geist-mono-latin-core.1afdd3db.woff2';

/**
 * A font preload; React hoists it into <head> from anywhere in the tree.
 *
 * It is a <link> element on purpose, not `ReactDOM.preload()`: during the
 * server render Next lets React move font preloads made with `preload()`
 * into a `Link` response header, and on Workers the response arrives with
 * only the Link header src/proxy.ts sets, so the font was found only after
 * the stylesheet was parsed (studio issue #189; this is also why next/font's
 * own preloads were missing). An element stays in the HTML wherever it
 * renders, from a server component too.
 */
export function FontPreload({ href }: { href: string }) {
  return (
    <link
      rel="preload"
      href={href}
      as="font"
      type="font/woff2"
      crossOrigin=""
    />
  );
}

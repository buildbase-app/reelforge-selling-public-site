'use client';

import {
  lazy,
  Suspense,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from 'react';

const subscribe = () => () => {};

/**
 * A component loaded with `import()` and rendered in the browser only, like
 * `next/dynamic` with `ssr: false`, on React's own `lazy` and `Suspense`.
 * `next/dynamic` adds about 1.4 KB gzip to every chunk that uses it, and
 * the public pages' first load has several (studio issue #79). The server
 * and the hydrating render show `fallback`; the component loads right
 * after hydration.
 */
export function clientOnly<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
  fallback: ReactNode = null
) {
  const Lazy = lazy(load);
  function ClientOnly(props: P) {
    const hydrated = useSyncExternalStore(
      subscribe,
      () => true,
      () => false
    );
    if (!hydrated) return fallback;
    return (
      <Suspense fallback={fallback}>
        <Lazy {...props} />
      </Suspense>
    );
  }
  return ClientOnly;
}

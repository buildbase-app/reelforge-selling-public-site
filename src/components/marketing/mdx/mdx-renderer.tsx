'use client';

import { useSyncExternalStore } from 'react';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import { mdxComponents } from './mdx-components';

interface MdxRendererProps {
  /** Pre-compiled MDX code emitted by Contentlayer (doc.body.code). */
  code: string;
  /** The same body rendered to static HTML at build time (doc.bodyHtml). */
  html: string;
}

const subscribe = () => () => {};

/**
 * Renders Contentlayer MDX.
 *
 * On the server (and during hydration) this outputs `html`, the body
 * pre-rendered at build time: Cloudflare Workers forbid `new Function`, which
 * `useMDXComponent` uses to evaluate the compiled MDX. Once mounted in the
 * browser it swaps in the real MDX component, which adds the custom JSX
 * components (`<Callout>`, `<WhenAuthenticated>`, ...) and interactivity.
 */
export function MdxRenderer({ code, html }: MdxRendererProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  if (!mounted) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <MdxContent code={code} />;
}

/**
 * useMDXComponent memoizes internally on `code`, so the "component created
 * during render" warning is a false positive here.
 */
/* eslint-disable react-hooks/static-components */
function MdxContent({ code }: { code: string }) {
  const Content = useMDXComponent(code);
  return <Content components={mdxComponents} />;
}
/* eslint-enable react-hooks/static-components */

import { docHref, type DocsNav, type NavPage, visibleTags } from './nav';

/**
 * The Markdown forms of the docs, for agents: the twin of each page
 * (`/docs/<path>.md`, or `Accept: text/markdown` on the page), the twin of the
 * index (`/docs.md`) and the docs sections of llms.txt / llms-full.txt.
 * Pure string builders; the routes and the proxy wire them up.
 */

interface TwinPage {
  title: string;
  description?: string;
  content?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  tags?: Parameters<typeof visibleTags>[0];
}

const abs = (base: string, path: string) => `${base.replace(/\/$/, '')}${path}`;

/** Site-relative links (`/docs/...`) made absolute, so the twin works on its own. */
export function absoluteLinks(markdown: string, base: string): string {
  return markdown.replace(
    /\]\((\/(?!\/)[^)\s]*)\)/g,
    (_, path: string) => `](${abs(base, path)})`
  );
}

export function docTwin(
  page: TwinPage,
  path: string,
  base: string,
  nav?: DocsNav
): string {
  const updated = page.updatedAt ?? page.publishedAt ?? null;
  const tags = visibleTags(page.tags);
  const i = nav ? nav.pages.findIndex((p) => p.path === path) : -1;
  const prev = i > 0 ? nav!.pages[i - 1] : null;
  const next = i >= 0 ? (nav!.pages[i + 1] ?? null) : null;
  return [
    `# ${page.title}`,
    '',
    ...(page.description ? [`> ${page.description}`, ''] : []),
    `URL: ${abs(base, docHref(path))}`,
    ...(updated ? [`Last updated: ${updated.slice(0, 10)}`] : []),
    ...(tags.length ? [`Tags: ${tags.join(', ')}`] : []),
    '',
    '---',
    '',
    absoluteLinks((page.content ?? '').trim(), base),
    '',
    ...(prev || next ? ['---', ''] : []),
    ...(prev
      ? [`Previous: [${prev.title}](${abs(base, `${prev.href}.md`)})`]
      : []),
    ...(next ? [`Next: [${next.title}](${abs(base, `${next.href}.md`)})`] : []),
    '',
  ].join('\n');
}

function line(p: NavPage, base: string): string {
  return `- [${p.title}](${abs(base, p.href)})${p.description ? `: ${p.description}` : ''} (Markdown: ${abs(base, `${p.href}.md`)})`;
}

/** The docs index as Markdown: every section and page. */
export function docsIndexTwin(nav: DocsNav, base: string): string {
  const out = [
    '# RenderWeld docs',
    '',
    '> Install RenderWeld, connect your AI agent over MCP or REST, and make reels. Published from the studio repository to BuildBase Docs.',
    '',
    `URL: ${abs(base, '/docs')}`,
    '',
  ];
  const walk = (sections: DocsNav['sections'], depth: number) => {
    for (const s of sections) {
      out.push(`${'#'.repeat(Math.min(depth, 6))} ${s.name}`, '');
      out.push(...s.pages.map((p) => line(p, base)), '');
      walk(s.sections, depth + 1);
    }
  };
  walk(nav.sections, 2);
  if (nav.rootPages.length) {
    out.push('## More', '', ...nav.rootPages.map((p) => line(p, base)), '');
  }
  if (!nav.pages.length) out.push('No docs are published yet.', '');
  return out.join('\n');
}

/** The "Docs" section of llms.txt: one line per page. */
export function llmsDocsSection(nav: DocsNav, base: string): string {
  if (!nav.pages.length) return '';
  return [
    '## Docs',
    '',
    `Every page also as Markdown: add \`.md\` to its URL. Index: ${abs(base, '/docs.md')}`,
    '',
    ...nav.pages.map((p) => line(p, base)),
    '',
  ].join('\n');
}

/** Headings one level down (`## x` -> `### x`), leaving code blocks alone. */
export function demoteHeadings(markdown: string, by = 1): string {
  let fence: string | null = null;
  return markdown
    .split('\n')
    .map((l) => {
      const f = l.match(/^\s*(```+|~~~+)/);
      if (f) {
        fence = fence ? (l.trim().startsWith(fence) ? null : fence) : f[1];
        return l;
      }
      if (fence) return l;
      return l.replace(
        /^(#{1,6}) /,
        (_, h: string) => `${'#'.repeat(Math.min(6, h.length + by))} `
      );
    })
    .join('\n');
}

/** The docs part of llms-full.txt: every page in full, in reading order. */
export function llmsFullDocsSection(
  nav: DocsNav,
  docs: Array<TwinPage & { _id: string }>,
  base: string
): string {
  if (!nav.pages.length) return '';
  const byId = new Map(docs.map((d) => [d._id, d]));
  const parts = nav.pages.map((p) => {
    const d = byId.get(p.id);
    // Page headings sit below the page title (`###`).
    const body = demoteHeadings(
      absoluteLinks((d?.content ?? '').trim(), base),
      2
    );
    return [
      `### ${p.title}`,
      '',
      `URL: ${abs(base, p.href)}`,
      '',
      ...(p.description ? [p.description, ''] : []),
      body,
      '',
    ].join('\n');
  });
  return ['## Docs', '', ...parts].join('\n');
}

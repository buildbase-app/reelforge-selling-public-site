/**
 * The docs navigation, built from what BuildBase Docs returns: the folder
 * tree (`content.docs.tree()`) and the published pages (`content.docs.list()`).
 * Pure functions, so they are unit-tested without the API.
 *
 * Order:
 * - top-level folders in FOLDER_ORDER (the studio repo's docs allowlist uses
 *   the same list), then any other folder by name, so a folder created in the
 *   console appears without a deploy;
 * - pages inside a folder follow their `suggestedDocs` chain (the studio's
 *   docs sync stores "the next page" there, because BuildBase docs have no
 *   order field); pages outside a chain, such as ones written in the console,
 *   come after it by title.
 */

export const DOCS_BASE = '/docs';

export const FOLDER_ORDER = [
  'start',
  'install',
  'api',
  'mcp',
  'providers',
  'manifest',
  'cookbook',
  'privacy',
  'troubleshooting',
] as const;

/** Tags the docs sync uses for bookkeeping; never shown to readers. */
export const HIDDEN_TAG_PREFIX = 'source-';

export interface DocsTreeNode {
  _id?: string;
  name?: string;
  slug?: string;
  path?: string;
  subfolders?: DocsTreeNode[] | string[];
  children?: DocsTreeNode[];
  [key: string]: unknown;
}

type Ref = string | { _id?: string; id?: string; slug?: string } | null;

export interface DocsPageInput {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  folder?: Ref | { _id: string; name?: string; slug?: string };
  suggestedDocs?: Ref[];
  tags?: Ref[];
  published?: boolean;
  publishedAt?: string | null;
  updatedAt?: string;
  createdAt?: string;
}

export interface NavPage {
  id: string;
  title: string;
  description: string;
  /** `folder/slug`, as `content.docs.byPath()` takes it. */
  path: string;
  /** Site URL path, e.g. `/docs/start/quick-start`. */
  href: string;
  section: string | null;
  updatedAt: string | null;
}

export interface NavSection {
  id: string;
  name: string;
  path: string;
  pages: NavPage[];
  sections: NavSection[];
}

export interface DocsNav {
  sections: NavSection[];
  /** Pages outside any folder. */
  rootPages: NavPage[];
  /** Every page in reading order (sidebar order), for prev/next. */
  pages: NavPage[];
}

const idOf = (ref: unknown): string | null => {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object') {
    const r = ref as { _id?: unknown; id?: unknown };
    const id = r._id ?? r.id;
    return typeof id === 'string' ? id : null;
  }
  return null;
};

export function docHref(path: string): string {
  return `${DOCS_BASE}/${path}`;
}

/** Tag slugs a reader may see (the sync's bookkeeping tags removed). */
export function visibleTags(tags: Ref[] | undefined): string[] {
  return (tags ?? [])
    .map((t) => (t && typeof t === 'object' ? t.slug : null))
    .filter((s): s is string => !!s && !s.startsWith(HIDDEN_TAG_PREFIX));
}

function childrenOf(node: DocsTreeNode): DocsTreeNode[] {
  const kids = node.children ?? node.subfolders ?? [];
  return (kids as unknown[]).filter(
    (k): k is DocsTreeNode => !!k && typeof k === 'object'
  );
}

/** Folder id -> folder path (`api`, `guides/advanced`), from slugs down the tree. */
export function folderPaths(tree: DocsTreeNode[]): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (nodes: DocsTreeNode[], parent: string) => {
    for (const n of nodes) {
      if (!n.slug) continue;
      const path = parent ? `${parent}/${n.slug}` : n.slug;
      if (n._id) out.set(n._id, path);
      walk(childrenOf(n), path);
    }
  };
  walk(tree, '');
  return out;
}

/** Pages of one folder in reading order: suggestedDocs chains first, the rest by title. */
export function orderPages<T extends { id: string; title: string }>(
  pages: T[],
  nextOf: (page: T) => string | null
): T[] {
  const byId = new Map(pages.map((p) => [p.id, p]));
  const next = new Map<string, string>();
  const pointedTo = new Set<string>();
  for (const p of pages) {
    const n = nextOf(p);
    if (n && n !== p.id && byId.has(n) && !pointedTo.has(n)) {
      next.set(p.id, n);
      pointedTo.add(n);
    }
  }
  const chainFrom = (start: T): T[] => {
    const out: T[] = [];
    const seen = new Set<string>();
    let cur: T | undefined = start;
    while (cur && !seen.has(cur.id)) {
      out.push(cur);
      seen.add(cur.id);
      const n = next.get(cur.id);
      cur = n ? byId.get(n) : undefined;
    }
    return out;
  };
  const byTitle = (a: T, b: T) => a.title.localeCompare(b.title);
  const chains = pages
    .filter((p) => !pointedTo.has(p.id))
    .map(chainFrom)
    .sort((a, b) => b.length - a.length || byTitle(a[0], b[0]));
  const ordered = chains.flat();
  // Pages only reachable inside a cycle: append by title.
  const placed = new Set(ordered.map((p) => p.id));
  return [...ordered, ...pages.filter((p) => !placed.has(p.id)).sort(byTitle)];
}

function folderRank(slug: string): number {
  const i = (FOLDER_ORDER as readonly string[]).indexOf(slug);
  return i === -1 ? FOLDER_ORDER.length : i;
}

export function buildDocsNav(
  tree: DocsTreeNode[],
  docs: DocsPageInput[]
): DocsNav {
  const paths = folderPaths(tree);
  const published = docs.filter((d) => d.published !== false && d.slug);

  const pageFor = (d: DocsPageInput, folderPath: string | null): NavPage => {
    const path = folderPath ? `${folderPath}/${d.slug}` : d.slug;
    return {
      id: d._id,
      title: d.title,
      description: d.description ?? '',
      path,
      href: docHref(path),
      section: null,
      updatedAt: d.updatedAt ?? d.publishedAt ?? null,
    };
  };

  const byFolder = new Map<string, DocsPageInput[]>();
  const root: DocsPageInput[] = [];
  for (const d of published) {
    const fid = idOf(d.folder);
    if (!fid) root.push(d);
    else if (paths.has(fid)) {
      byFolder.set(fid, [...(byFolder.get(fid) ?? []), d]);
    }
    // A page in a folder the tree does not show (archived) is not listed.
  }
  const nextOf = (docsById: Map<string, DocsPageInput>) => (p: NavPage) =>
    idOf(docsById.get(p.id)?.suggestedDocs?.[0] ?? null);
  const docsById = new Map(published.map((d) => [d._id, d]));

  const build = (nodes: DocsTreeNode[], parent: string, top: boolean) => {
    const sections: NavSection[] = [];
    const sorted = [...nodes]
      .filter((n) => n.slug && n._id)
      .sort((a, b) =>
        top
          ? folderRank(a.slug!) - folderRank(b.slug!) ||
            String(a.name ?? a.slug).localeCompare(String(b.name ?? b.slug))
          : String(a.name ?? a.slug).localeCompare(String(b.name ?? b.slug))
      );
    for (const n of sorted) {
      const path = parent ? `${parent}/${n.slug}` : n.slug!;
      const name = String(n.name ?? n.slug);
      const pages = orderPages(
        (byFolder.get(n._id!) ?? []).map((d) => ({
          ...pageFor(d, path),
          section: name,
        })),
        nextOf(docsById)
      );
      const children = build(childrenOf(n), path, false);
      if (pages.length || children.length) {
        sections.push({ id: n._id!, name, path, pages, sections: children });
      }
    }
    return sections;
  };

  const sections = build(tree, '', true);
  const rootPages = orderPages(
    root.map((d) => pageFor(d, null)),
    nextOf(docsById)
  );
  const flatten = (s: NavSection[]): NavPage[] =>
    s.flatMap((x) => [...x.pages, ...flatten(x.sections)]);
  return { sections, rootPages, pages: [...flatten(sections), ...rootPages] };
}

/** The pages before and after one in reading order. */
export function neighbours(
  nav: DocsNav,
  path: string
): { prev: NavPage | null; next: NavPage | null; current: NavPage | null } {
  const i = nav.pages.findIndex((p) => p.path === path);
  if (i === -1) return { prev: null, next: null, current: null };
  return {
    prev: nav.pages[i - 1] ?? null,
    next: nav.pages[i + 1] ?? null,
    current: nav.pages[i],
  };
}

/** A path from the URL is safe to pass to `byPath`: slugs joined by `/`. */
export function isDocPath(segments: string[]): boolean {
  return (
    segments.length > 0 &&
    segments.length <= 6 &&
    segments.every((s) => /^[a-z0-9][a-z0-9-]{0,127}$/.test(s))
  );
}

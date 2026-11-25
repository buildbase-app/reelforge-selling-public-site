import 'server-only';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { toString as hastToString } from 'hast-util-to-string';
import { createHighlighterCore, type HighlighterCore } from '@shikijs/core';
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript';
import type { Element, ElementContent, Root, RootContent } from 'hast';
import { externalLinks, schema } from '@/lib/platform/markdown';

/**
 * Long-form rich text from the CMS (blog posts, release notes, docs pages):
 * BuildBase Markdown, raw HTML allowed, to sanitised HTML on the server.
 *
 * Raw HTML is parsed and cleaned first (`schema`, GitHub's allow-list plus a
 * few presentational tags): no script, style, iframe, object, event handler
 * or `javascript:` URL survives. Only then do trusted steps add markup:
 *
 * - an `# h1` in a body is moved down a level (and the rest with it), so the
 *   page title stays the page's only h1;
 * - heading ids (`rehype-slug`) and a link on each h2-h4 to itself;
 * - in-page links follow the `md-` prefix the sanitiser gives authored ids;
 * - GitHub alerts (`> [!NOTE]`, TIP, IMPORTANT, WARNING, CAUTION) become
 *   callouts;
 * - an image alone in a paragraph becomes a figure, captioned by its title
 *   (`![alt](src "caption")`); one pointing at .mp4 or .webm becomes a video
 *   (the CSP's `media-src` decides which hosts can play);
 * - code highlighting with Shiki's core and its JavaScript regex engine, with
 *   only the grammars below (the full bundle would put every grammar and the
 *   Oniguruma WebAssembly into the Worker); unknown languages stay plain;
 * - tables scroll inside a focusable region on narrow screens;
 * - task-list checkboxes are labelled "Done" or "Not done";
 * - external links open in a new tab with `rel="noopener noreferrer"`.
 *
 * Runs on the server only; the browser gets finished HTML.
 */

export const CODE_THEMES = {
  light: 'github-light',
  dark: 'github-dark',
} as const;

/** Fence names that mean one of the loaded grammars. */
const ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  yml: 'yaml',
  ts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  docker: 'dockerfile',
  conf: 'ini',
};

/**
 * GitHub's themes have a few token colours under WCAG AA (4.5:1) on the
 * site's code background (`--muted`): these replace them, each at least 4.7:1
 * on `--muted` and `--card` in its theme.
 */
const READABLE: Record<'light' | 'dark', Record<string, string>> = {
  light: {
    '#E36209': '#A84A00', // orange, 3.0:1 -> 5.0:1
    '#D73A49': '#C4303E', // red, 4.0:1 -> 4.8:1
    '#22863A': '#1D7534', // green, 4.0:1 -> 5.0:1
    '#6A737D': '#57606A', // comments, 4.2:1 -> 5.6:1
  },
  dark: {
    '#6A737D': '#959DA5', // comments, 3.1:1 -> 5.0:1
  },
};

/** Shiki's `--shiki-light:#…;--shiki-dark:#…` with the readable colours. */
export function readableTokenStyle(style: string): string {
  return style.replace(
    /--shiki-(light|dark):(#[0-9a-f]{6})/gi,
    (all, theme: 'light' | 'dark', hex: string) => {
      const swap = READABLE[theme][hex.toUpperCase()];
      return swap ? `--shiki-${theme}:${swap}` : all;
    }
  );
}

let highlighter: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [
      import('@shikijs/themes/github-light'),
      import('@shikijs/themes/github-dark'),
    ],
    langs: [
      import('@shikijs/langs/bash'),
      import('@shikijs/langs/json'),
      import('@shikijs/langs/jsonc'),
      import('@shikijs/langs/yaml'),
      import('@shikijs/langs/toml'),
      import('@shikijs/langs/typescript'),
      import('@shikijs/langs/javascript'),
      import('@shikijs/langs/tsx'),
      import('@shikijs/langs/dockerfile'),
      import('@shikijs/langs/diff'),
      import('@shikijs/langs/python'),
      import('@shikijs/langs/ini'),
      import('@shikijs/langs/http'),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

type Parent = Root | Element;

const el = (
  tagName: string,
  properties: Element['properties'],
  children: ElementContent[]
): Element => ({ type: 'element', tagName, properties, children });

const isEl = (node: RootContent | undefined, tag?: string): node is Element =>
  node?.type === 'element' && (!tag || node.tagName === tag);

/** True when `node` is a frame this module made (`docs-code`, `table-scroll`). */
const isFrame = (node: Parent, name: string) =>
  node.type === 'element' &&
  Array.isArray(node.properties?.className) &&
  node.properties.className.includes(name);

const isBlank = (node: RootContent) =>
  node.type === 'text' && !node.value.trim();

/** Calls `fn` for every element, parents before children. */
function walk(
  tree: Parent,
  fn: (node: Element, parent: Parent, index: number) => void
) {
  const visit = (parent: Parent) => {
    parent.children.forEach((child, i) => {
      if (child.type !== 'element') return;
      fn(child, parent, i);
      visit(parent.children[i] as Element);
    });
  };
  visit(tree);
}

function languageOf(code: Element): string | null {
  const cls = code.properties?.className;
  const list = Array.isArray(cls) ? cls : typeof cls === 'string' ? [cls] : [];
  const tag = list.map(String).find((c) => c.startsWith('language-'));
  if (!tag) return null;
  const name = tag.slice('language-'.length).toLowerCase();
  return ALIASES[name] ?? name;
}

/** `# Title` in a body would be a second h1: move every heading down one. */
function demoteHeadings() {
  return (tree: Root) => {
    let hasH1 = false;
    walk(tree, (node) => {
      if (node.tagName === 'h1') hasH1 = true;
    });
    if (!hasH1) return;
    walk(tree, (node) => {
      const m = /^h([1-5])$/.exec(node.tagName);
      if (m) node.tagName = `h${Number(m[1]) + 1}`;
    });
  };
}

/**
 * The sanitiser prefixes authored ids with `md-` (so content cannot clobber
 * the page's own ids); `#x` then points at `md-x` when only that exists.
 * Footnotes rely on this.
 */
function inPageLinks() {
  return (tree: Root) => {
    const ids = new Set<string>();
    walk(tree, (node) => {
      if (typeof node.properties?.id === 'string') ids.add(node.properties.id);
    });
    walk(tree, (node) => {
      const href = node.properties?.href;
      if (node.tagName !== 'a' || typeof href !== 'string') return;
      if (!href.startsWith('#')) return;
      const id = decodeURIComponent(href.slice(1));
      if (!ids.has(id) && ids.has(`md-${id}`))
        node.properties.href = `#md-${id}`;
    });
  };
}

const CALLOUTS: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

/** `> [!NOTE]` blockquotes (GitHub alerts) as labelled callouts. */
function callouts() {
  return (tree: Root) => {
    walk(tree, (node, parent, index) => {
      if (node.tagName !== 'blockquote') return;
      const first = node.children.find((c) => !isBlank(c));
      if (!isEl(first, 'p')) return;
      const lead = first.children[0];
      if (lead?.type !== 'text') return;
      const m = /^\s*\[!(note|tip|important|warning|caution)\]\s*/i.exec(
        lead.value
      );
      if (!m) return;
      const kind = m[1].toLowerCase();
      lead.value = lead.value.slice(m[0].length);
      if (!lead.value) first.children.shift();
      if (isEl(first.children[0], 'br')) first.children.shift();
      const body = node.children.filter(
        (c) => !(c === first && first.children.length === 0)
      );
      parent.children[index] = el(
        'div',
        { className: ['callout'], dataCallout: kind, role: 'note' },
        [
          el('p', { className: ['callout-title'] }, [
            { type: 'text', value: CALLOUTS[kind] },
          ]),
          ...(body as ElementContent[]),
        ]
      );
    });
  };
}

const VIDEO = /\.(mp4|webm)(?:[?#]|$)/i;

/** Lone images become figures (with a caption) or videos; images load lazily. */
function media() {
  return (tree: Root) => {
    walk(tree, (node, parent, index) => {
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
      }
      if (node.tagName !== 'p') return;
      const content = node.children.filter((c) => !isBlank(c));
      const img = content[0];
      if (content.length !== 1 || !isEl(img, 'img')) return;
      const src = String(img.properties.src ?? '');
      const alt = String(img.properties.alt ?? '');
      const caption =
        typeof img.properties.title === 'string' ? img.properties.title : '';
      delete img.properties.title;
      const isVideo = VIDEO.test(src);
      if (!caption && !isVideo) return;
      const shown = isVideo
        ? el(
            'video',
            {
              src,
              controls: true,
              preload: 'metadata',
              playsInline: true,
              ...(alt && { ariaLabel: alt }),
            },
            []
          )
        : img;
      parent.children[index] = el('figure', {}, [
        shown,
        ...(caption
          ? [el('figcaption', {}, [{ type: 'text', value: caption }])]
          : []),
      ]);
    });
  };
}

/** Replaces `<pre><code class="language-x">` with Shiki's highlighted `<pre>`. */
function highlightCode() {
  return async (tree: Root) => {
    const h = await getHighlighter();
    const loaded = new Set(h.getLoadedLanguages());
    walk(tree, (node, parent, index) => {
      const code = node.children[0];
      if (node.tagName !== 'pre' || !isEl(code, 'code')) return;
      const lang = languageOf(code);
      if (!lang || !loaded.has(lang)) return;
      const text = hastToString(code).replace(/\n$/, '');
      const out = h.codeToHast(text, {
        lang,
        themes: CODE_THEMES,
        defaultColor: false,
      });
      const pre = out.children.find((n): n is Element => n.type === 'element');
      if (!pre) return;
      pre.properties = { ...pre.properties, dataLanguage: lang };
      walk(pre, (token) => {
        if (typeof token.properties?.style === 'string') {
          token.properties.style = readableTokenStyle(token.properties.style);
        }
      });
      parent.children[index] = pre;
    });
  };
}

/** Wraps every `<pre>` in a frame with a Copy button (wired by `<CopyCodeButtons>`). */
function copyButtons() {
  return (tree: Root) => {
    walk(tree, (node, parent, index) => {
      if (node.tagName !== 'pre' || isFrame(parent, 'docs-code')) return;
      parent.children[index] = el('div', { className: ['docs-code'] }, [
        el(
          'button',
          {
            type: 'button',
            className: ['docs-copy'],
            dataCopyCode: '',
            ariaLabel: 'Copy code',
          },
          [{ type: 'text', value: 'Copy' }]
        ),
        node,
      ]);
    });
  };
}

/** Tables scroll sideways inside a focusable, labelled region. */
function scrollingTables() {
  return (tree: Root) => {
    walk(tree, (node, parent, index) => {
      if (node.tagName !== 'table' || isFrame(parent, 'table-scroll')) return;
      parent.children[index] = el(
        'div',
        {
          className: ['table-scroll'],
          role: 'region',
          ariaLabel: 'Table',
          tabIndex: 0,
        },
        [node]
      );
    });
  };
}

/** A task list's checkboxes say what they mean to screen readers. */
function taskCheckboxes() {
  return (tree: Root) => {
    walk(tree, (node) => {
      if (node.tagName !== 'input' || node.properties?.type !== 'checkbox') {
        return;
      }
      node.properties.ariaLabel = node.properties.checked ? 'Done' : 'Not done';
    });
  };
}

/** Each h2-h4 links to itself, so a section can be shared by its URL. */
function headingAnchors() {
  return (tree: Root) => {
    walk(tree, (node) => {
      if (!/^h[2-4]$/.test(node.tagName)) return;
      const id = node.properties?.id;
      if (typeof id !== 'string') return;
      let hasLink = false;
      walk(node, (child) => {
        if (child.tagName === 'a') hasLink = true;
      });
      if (hasLink) return;
      node.children = [
        el('a', { href: `#${id}`, className: ['heading-anchor'] }, [
          ...node.children,
        ]),
      ];
    });
  };
}

function build(withCopyButtons: boolean) {
  const p = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(demoteHeadings)
    .use(rehypeSlug)
    .use(inPageLinks)
    .use(callouts)
    .use(media)
    .use(highlightCode)
    .use(scrollingTables)
    .use(taskCheckboxes);
  if (withCopyButtons) p.use(copyButtons);
  return p.use(headingAnchors).use(externalLinks);
}

const articleProcessor = build(false);
const docsProcessor = build(true);
const stringify = unified().use(rehypeStringify);

export interface RichTextHeading {
  id: string;
  text: string;
}

export interface RenderedRichText {
  /** Sanitised HTML, safe for `dangerouslySetInnerHTML`. */
  html: string;
  /** The h2 headings, for "On this page". */
  headings: RichTextHeading[];
}

function headingsOf(tree: Root): RichTextHeading[] {
  const out: RichTextHeading[] = [];
  for (const node of tree.children) {
    if (isEl(node, 'h2') && typeof node.properties?.id === 'string') {
      out.push({ id: node.properties.id, text: hastToString(node).trim() });
    }
  }
  return out;
}

export async function renderRichText(
  markdown: string | null | undefined,
  options: { copyButtons?: boolean } = {}
): Promise<RenderedRichText> {
  const source = markdown ?? '';
  if (!source.trim()) return { html: '', headings: [] };
  const processor = options.copyButtons ? docsProcessor : articleProcessor;
  const tree = (await processor.run(processor.parse(source))) as Root;
  return { html: stringify.stringify(tree), headings: headingsOf(tree) };
}

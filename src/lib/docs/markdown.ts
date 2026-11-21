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
 * Docs pages: BuildBase Markdown -> sanitised HTML with highlighted code.
 *
 * The same sanitising as every other BuildBase body (src/lib/platform/
 * markdown.ts, GitHub's allow-list): raw HTML is parsed and cleaned before
 * anything else, so no script, style, iframe, handler or javascript: URL from
 * the CMS survives. Only then do trusted steps add markup:
 *
 * - heading ids (`rehype-slug`), so in-page links like `#errors` work;
 * - code highlighting with Shiki's core and its JavaScript regex engine, with
 *   only the grammars below. Not `rehype-pretty-code`: it imports Shiki's full
 *   bundle, which puts every grammar and the Oniguruma WebAssembly into the
 *   Worker, close to Cloudflare's bundle size limit. Unknown languages render
 *   as plain text;
 * - a Copy button per code block, wired by `<CopyCodeButtons>` (client).
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

function languageOf(code: Element): string | null {
  const cls = code.properties?.className;
  const list = Array.isArray(cls) ? cls : typeof cls === 'string' ? [cls] : [];
  const tag = list.map(String).find((c) => c.startsWith('language-'));
  if (!tag) return null;
  const name = tag.slice('language-'.length).toLowerCase();
  return ALIASES[name] ?? name;
}

/** Replaces `<pre><code class="language-x">` with Shiki's highlighted `<pre>`. */
function highlightCode() {
  return async (tree: Root) => {
    const h = await getHighlighter();
    const loaded = new Set(h.getLoadedLanguages());
    const visit = (node: Root | Element) => {
      node.children.forEach((child, i) => {
        if (child.type !== 'element') return;
        const code = child.children[0];
        if (
          child.tagName === 'pre' &&
          code?.type === 'element' &&
          code.tagName === 'code'
        ) {
          const lang = languageOf(code);
          if (!lang || !loaded.has(lang)) return;
          const text = hastToString(code).replace(/\n$/, '');
          const out = h.codeToHast(text, {
            lang,
            themes: CODE_THEMES,
            defaultColor: false,
          });
          const pre = out.children.find(
            (n): n is Element => n.type === 'element'
          );
          if (!pre) return;
          pre.properties = { ...pre.properties, dataLanguage: lang };
          (node.children as RootContent[])[i] = pre;
          return;
        }
        visit(child);
      });
    };
    visit(tree);
  };
}

/** Wraps every `<pre>` in a frame with a Copy button. */
function copyButtons() {
  const button = (): Element => ({
    type: 'element',
    tagName: 'button',
    properties: {
      type: 'button',
      className: ['docs-copy'],
      dataCopyCode: '',
      ariaLabel: 'Copy code',
    },
    children: [{ type: 'text', value: 'Copy' }],
  });
  return (tree: Root) => {
    const visit = (node: Root | Element) => {
      node.children.forEach((child, i) => {
        if (child.type !== 'element') return;
        if (child.tagName === 'pre') {
          const frame: Element = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['docs-code'] },
            children: [button(), child as ElementContent],
          };
          (node.children as RootContent[])[i] = frame;
          return;
        }
        visit(child);
      });
    };
    visit(tree);
  };
}

export interface DocHeading {
  id: string;
  text: string;
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, schema)
  .use(rehypeSlug)
  .use(highlightCode)
  .use(copyButtons)
  .use(externalLinks);

const stringify = unified().use(rehypeStringify);

function headingsOf(tree: Root): DocHeading[] {
  const out: DocHeading[] = [];
  for (const node of tree.children) {
    if (node.type === 'element' && node.tagName === 'h2') {
      const id = node.properties?.id;
      if (typeof id === 'string') {
        out.push({ id, text: hastToString(node).trim() });
      }
    }
  }
  return out;
}

export interface RenderedDoc {
  /** Sanitised HTML, safe for `dangerouslySetInnerHTML`. */
  html: string;
  /** The `##` headings, for "On this page". */
  headings: DocHeading[];
}

export async function renderDocMarkdown(
  markdown: string | null | undefined
): Promise<RenderedDoc> {
  const source = markdown ?? '';
  if (!source.trim()) return { html: '', headings: [] };
  const tree = (await processor.run(processor.parse(source))) as Root;
  return { html: stringify.stringify(tree), headings: headingsOf(tree) };
}

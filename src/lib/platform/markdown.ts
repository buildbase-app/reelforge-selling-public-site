import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { toString as hastToString } from 'hast-util-to-string';
import type { Element, Root, RootContent } from 'hast';

/**
 * BuildBase content bodies (FAQ answers, content blocks, docs) are Markdown,
 * stored exactly as the editor typed them, raw HTML included
 * (https://docs.buildbase.app/content/delivering-content#what-a-read-returns).
 *
 * This turns them into HTML on the server: Markdown and GFM are parsed, any
 * raw HTML is parsed too, and the result goes through `rehype-sanitize`
 * (GitHub's allow-list): no `<script>`, `<style>`, `<iframe>`, event
 * handlers or `javascript:` URLs survive. External links then get
 * `rel="noopener noreferrer"` and open in a new tab.
 *
 * Runs at render time on the server only; nothing here ships to the browser.
 */

export interface RenderedMarkdown {
  /** Sanitised HTML, safe for `dangerouslySetInnerHTML`. */
  html: string;
  /** The same content as plain text (JSON-LD, meta descriptions). */
  text: string;
}

const schema = {
  ...defaultSchema,
  // Keep heading ids readable: no `user-content-` prefix is needed because
  // nothing on these pages uses the same ids.
  clobberPrefix: 'md-',
};

/** Marks absolute http(s) links as external. Runs after sanitising. */
function externalLinks() {
  return (tree: Root) => {
    const visit = (node: Root | RootContent) => {
      if (node.type === 'element') {
        const el = node as Element;
        const href = el.properties?.href;
        if (el.tagName === 'a' && typeof href === 'string') {
          if (/^https?:\/\//i.test(href)) {
            el.properties.target = '_blank';
            el.properties.rel = ['noopener', 'noreferrer'];
          }
        }
      }
      if ('children' in node) node.children.forEach(visit);
    };
    visit(tree);
  };
}

const BLOCK = new Set([
  'p',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'pre',
  'blockquote',
  'tr',
  'br',
]);

/** Plain text with a space between blocks, whitespace collapsed. */
function plainText(tree: Root): string {
  const parts: string[] = [];
  const walk = (node: Root | RootContent) => {
    if (node.type === 'text') parts.push(node.value);
    else if (node.type === 'element') {
      const el = node as Element;
      if (BLOCK.has(el.tagName)) {
        parts.push(' ', hastToString(el), ' ');
        return;
      }
      el.children.forEach(walk);
    } else if (node.type === 'root') node.children.forEach(walk);
  };
  walk(tree);
  return parts.join('').replace(/\s+/g, ' ').trim();
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // Heading ids (`md-<slug>` once sanitised) for in-page links and the blog's
  // table of contents.
  .use(rehypeSlug)
  .use(rehypeSanitize, schema)
  .use(externalLinks);

const stringify = unified().use(rehypeStringify);

/** Markdown (with optional raw HTML) to sanitised HTML and plain text. */
export function renderMarkdown(
  markdown: string | null | undefined
): RenderedMarkdown {
  const source = markdown ?? '';
  if (!source.trim()) return { html: '', text: '' };
  const tree = processor.runSync(processor.parse(source)) as Root;
  return { html: stringify.stringify(tree), text: plainText(tree) };
}

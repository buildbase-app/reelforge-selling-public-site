/**
 * Pure helpers for `migrate-blog-to-buildbase.mjs`: parse the old
 * Contentlayer files (front matter + MDX body) and turn them into BuildBase
 * Blogs payloads. No network, no file system, so the unit tests can cover
 * them (src/__tests__/blog-migration.test.ts).
 */

/** Lower-case, dash-separated slug (`Early access` -> `early-access`). */
export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** `early-access` -> `Early access`. */
export function humanize(slug) {
  const words = String(slug).replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value === '') return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => parseScalar(item))
      .filter((item) => item !== '');
  }
  return value;
}

/**
 * Front matter as the old content used it: `key: scalar`, `key: [a, b]`,
 * and one level of `key:` followed by `- a: b` maps or `- item` lines.
 * Anything else throws, so a file the migration does not understand is never
 * half-imported.
 *
 * @param {string} source
 * @returns {{ data: Record<string, any>, body: string }}
 */
export function parseFrontMatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) return { data: {}, body: source };
  /** @type {Record<string, any>} */
  const data = {};
  const lines = match[1].split(/\r?\n/);
  let listKey = null;
  let current = null;
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const top = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (top) {
      listKey = null;
      current = null;
      if (top[2] === '') {
        listKey = top[1];
        data[listKey] = [];
      } else {
        data[top[1]] = parseScalar(top[2]);
      }
      continue;
    }
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && listKey) {
      const pair = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(item[1]);
      if (pair) {
        current = { [pair[1]]: parseScalar(pair[2]) };
        data[listKey].push(current);
      } else {
        current = null;
        data[listKey].push(parseScalar(item[1]));
      }
      continue;
    }
    const cont = /^\s+([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (cont && current) {
      current[cont[1]] = parseScalar(cont[2]);
      continue;
    }
    throw new Error(`Unsupported front matter line: ${line}`);
  }
  return { data, body: match[2] };
}

const CALLOUT_LABELS = {
  info: 'Note',
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Warning',
  error: 'Warning',
};

/**
 * MDX-only constructs to Markdown. BuildBase bodies are Markdown, so:
 *
 * - `import` / `export` lines are removed;
 * - `<Callout type="…">text</Callout>` becomes a `> **Note:** text` quote;
 * - any other JSX component, or a `{expression}` outside code, is left in
 *   place and reported, for a person to rewrite.
 *
 * Fenced and inline code is never touched.
 */
export function mdxToMarkdown(mdx) {
  const issues = [];
  const parts = mdx.split(/(```[\s\S]*?```)/g);
  const out = parts.map((part) => {
    if (part.startsWith('```')) return part;
    let text = part
      .split('\n')
      .filter((line) => {
        if (/^(import|export)\s/.test(line)) {
          issues.push(`removed MDX line: ${line.trim()}`);
          return false;
        }
        return true;
      })
      .join('\n');
    text = text.replace(
      /<Callout(?:\s+type=["']([a-z]+)["'])?\s*>([\s\S]*?)<\/Callout>/g,
      (_m, type, inner) => {
        const label = CALLOUT_LABELS[type ?? 'info'] ?? 'Note';
        const lines = inner.trim().split('\n');
        return lines
          .map((l, i) => (i === 0 ? `> **${label}:** ${l}` : `> ${l}`))
          .join('\n');
      }
    );
    const withoutInlineCode = text.replace(/`[^`\n]*`/g, '');
    for (const m of withoutInlineCode.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
      issues.push(`JSX component <${m[1]}> left as is`);
    }
    for (const m of withoutInlineCode.matchAll(/\{[^}\n]*\}/g)) {
      issues.push(`MDX expression ${m[0]} left as is`);
    }
    return text;
  });
  return { markdown: out.join('').trim() + '\n', issues };
}

/**
 * A changelog entry's structured `highlights` (kind, title, body) as a
 * Markdown list, ahead of the entry's prose, in the order the file lists them.
 */
export function highlightsToMarkdown(highlights) {
  if (!Array.isArray(highlights) || highlights.length === 0) return '';
  const lines = highlights.map((h) => {
    const kind = String(h.kind ?? '').trim();
    const title = String(h.title ?? '').replace(/\.$/, '');
    return `- **${kind}: ${title}.** ${String(h.body ?? '').trim()}`;
  });
  return ['## Highlights', '', ...lines].join('\n');
}

/** `v0-1-0` -> `0.1.0`; null when the slug is not a version. */
export function versionFromSlug(slug) {
  const m = /^v(\d+)-(\d+)-(\d+)$/.exec(slug);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : null;
}

/** Words that must never describe ReelForge (it is source-available). */
const FORBIDDEN = [/\bopen[- ]source\b/i];

function checkWording(text, where, issues) {
  for (const re of FORBIDDEN) {
    if (re.test(text)) {
      issues.push(
        `${where}: says "open source"; ReelForge is source-available`
      );
    }
  }
}

/**
 * One old blog post or changelog entry as the BuildBase post it becomes.
 * `kind` is `blog` or `changelog` (the BuildBase folder slug).
 */
export function toBuildBasePost({ kind, slug, source }) {
  const { data, body } = parseFrontMatter(source);
  const { markdown, issues } = mdxToMarkdown(body);
  const notes = [];

  let content = markdown;
  let tagNames = [];
  if (kind === 'changelog') {
    const highlights = highlightsToMarkdown(data.highlights);
    content = [highlights, markdown.trim()].filter(Boolean).join('\n\n') + '\n';
    const derived = versionFromSlug(slug);
    if (data.version && derived !== String(data.version)) {
      issues.push(
        `version ${data.version} does not match the slug (${derived ?? 'none'}); the site derives the version from the slug`
      );
    }
    if (data.tag) {
      notes.push(
        `tag "${data.tag}" dropped: the site marks the newest entry as the latest`
      );
    }
  } else {
    if (data.category) tagNames.push(String(data.category));
    if (Array.isArray(data.tags)) tagNames.push(...data.tags.map(String));
  }

  const seen = new Set();
  const tags = [];
  for (const name of tagNames) {
    const tagSlug = slugify(name);
    if (!tagSlug || seen.has(tagSlug)) continue;
    seen.add(tagSlug);
    tags.push({ slug: tagSlug, title: humanize(tagSlug) });
  }

  if (data.image) {
    notes.push(
      `cover image ${data.image} not migrated: upload it as an asset and set it in the console`
    );
  }
  if (data.updated) notes.push(`updated date ${data.updated} not migrated`);
  if (data.date) {
    notes.push(
      `date ${data.date}: BuildBase stamps publishedAt when the post is published`
    );
  }

  const title = String(data.title ?? '').trim();
  const description = String(data.description ?? '').trim();
  checkWording(`${title}\n${description}\n${content}`, slug, issues);

  return {
    folder: kind,
    slug,
    title,
    description,
    content,
    published: data.draft !== true,
    author: data.author ? String(data.author) : null,
    tags,
    seo: {
      title,
      description,
      keywords: tags.map((t) => t.title),
    },
    issues,
    notes,
  };
}

/** An old author file as a BuildBase blog author. */
export function toBuildBaseAuthor({ username, source }) {
  const { data, body } = parseFrontMatter(source);
  const notes = [];
  if (data.role) notes.push(`role "${data.role}" dropped (no author field)`);
  if (data.bio) notes.push('bio dropped (no author field)');
  if (body.trim()) notes.push('profile body dropped (no author field)');
  if (data.github) notes.push('github link dropped (no author field)');
  const links = {};
  if (data.website) links.website = String(data.website);
  if (data.twitter) links.twitter = String(data.twitter);
  if (data.linkedin) links.linkedin = String(data.linkedin);
  const image =
    typeof data.avatar === 'string' && /^https?:\/\//.test(data.avatar)
      ? data.avatar
      : undefined;
  if (data.avatar && !image) {
    notes.push(`avatar ${data.avatar} dropped (needs an absolute image URL)`);
  }
  return {
    username,
    name: String(data.name ?? username),
    ...(image && { image }),
    links,
    notes,
  };
}

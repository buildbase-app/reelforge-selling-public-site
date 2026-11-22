#!/usr/bin/env node
/**
 * One-off, re-runnable migration of the old Contentlayer blog, changelog and
 * authors into BuildBase Blogs (reelforge-studio#48).
 *
 * The source files were removed from the repository with Contentlayer, so by
 * default they are read from the last commit that had them (`--ref`, default
 * 7f454e7). `--dir <path>` reads a directory laid out like the old
 * `src/content` instead.
 *
 * What it does, matching everything by slug so a second run changes nothing:
 *
 * - folders `blog` and `changelog`;
 * - one author per `authors/*.mdx` (matched by username = file name);
 * - one tag per category and tag (matched by slug);
 * - one post per `blog/<locale>/<slug>.mdx` (folder `blog`) and
 *   `changelog/<slug>.mdx` (folder `changelog`), with its title, summary,
 *   SEO fields, Markdown body, author and tags, published unless it was a
 *   draft. A post that already matches is left alone, so no webhook fires.
 *
 * MDX-only constructs are converted to Markdown, and anything that could not
 * be converted (or was dropped) is listed at the end.
 *
 *   BUILDBASE_API_TOKEN=<org token> node scripts/content/migrate-blog-to-buildbase.mjs [--dry-run]
 *
 * The token is an org API token (or an environment's token) with create and
 * update on blogs, blog folders, blog tags and blog authors. The server is
 * `NEXT_PUBLIC_BUILDBASE_SERVER_URL` (default https://api.console.buildbase.app).
 * Both may also come from `.env.local`. The token is never printed.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toBuildBaseAuthor, toBuildBasePost } from './blog-migration-lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const DRY_RUN = flag('--dry-run');
const REF = option('--ref', '7f454e7');
const DIR = option('--dir', null);

try {
  for (const line of readFileSync(resolve(root, '.env.local'), 'utf8').split(
    '\n'
  )) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  /* no .env.local: rely on the environment */
}

const serverUrl = (
  process.env.NEXT_PUBLIC_BUILDBASE_SERVER_URL ??
  'https://api.console.buildbase.app'
).replace(/\/$/, '');
const token = process.env.BUILDBASE_API_TOKEN;
if (!token && !DRY_RUN) {
  console.error('Set BUILDBASE_API_TOKEN (or pass --dry-run).');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Source files
// ---------------------------------------------------------------------------

/** `[{ path, source }]` for every .mdx under the content folders. */
function readSources() {
  const wanted = /^(blog\/[^/]+\/[^/]+|changelog\/[^/]+|authors\/[^/]+)\.mdx$/;
  if (DIR) {
    const base = resolve(DIR);
    const files = [];
    const walk = (dir) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else files.push(full);
      }
    };
    walk(base);
    return files
      .map((full) => ({ path: relative(base, full), full }))
      .filter((f) => wanted.test(f.path))
      .map((f) => ({ path: f.path, source: readFileSync(f.full, 'utf8') }));
  }
  const git = (...a) =>
    execFileSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 24 });
  return git('ls-tree', '-r', '--name-only', REF, 'src/content')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ full: p, path: p.replace(/^src\/content\//, '') }))
    .filter((f) => wanted.test(f.path))
    .map((f) => ({ path: f.path, source: git('show', `${REF}:${f.full}`) }));
}

// ---------------------------------------------------------------------------
// BuildBase org API
// ---------------------------------------------------------------------------

async function api(method, path, body) {
  const res = await fetch(`${serverUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const detail = typeof json === 'string' ? json : JSON.stringify(json);
    throw new Error(`${method} ${path}: ${res.status} ${detail.slice(0, 300)}`);
  }
  return json;
}

/** Every item of a paginated org API list. */
async function listAll(path, extra = '') {
  const items = [];
  for (let page = 1; page < 50; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await api('GET', `${path}${sep}limit=100&page=${page}${extra}`);
    items.push(...(res?.docs ?? []));
    if (!res?.hasNextPage) break;
  }
  return items;
}

const idOf = (ref) => (typeof ref === 'string' ? ref : ref?._id);
const sameSet = (a, b) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const log = [];
const say = (line) => {
  log.push(line);
  console.log(line);
};

const sources = readSources();
const authorsIn = sources
  .filter((s) => s.path.startsWith('authors/'))
  .map((s) =>
    toBuildBaseAuthor({
      username: s.path.replace(/^authors\//, '').replace(/\.mdx$/, ''),
      source: s.source,
    })
  );
const postsIn = sources
  .filter((s) => !s.path.startsWith('authors/'))
  .map((s) => {
    const kind = s.path.startsWith('changelog/') ? 'changelog' : 'blog';
    const slug = s.path
      .split('/')
      .pop()
      .replace(/\.mdx$/, '');
    return toBuildBasePost({ kind, slug, source: s.source });
  });

say(
  `Source: ${DIR ? DIR : `git ${REF}`}: ${postsIn.length} posts, ${authorsIn.length} authors`
);
say(`Target: ${serverUrl}${DRY_RUN ? ' (dry run, nothing is written)' : ''}`);

const write = async (what, fn) => {
  if (DRY_RUN) {
    say(`  would ${what}`);
    return null;
  }
  const result = await fn();
  say(`  ${what}`);
  return result;
};

const existing =
  DRY_RUN && !token
    ? { folders: [], tags: [], authors: [], posts: [] }
    : {
        folders: await listAll('/api/blogs/folders'),
        tags: await listAll('/api/blogs/tags'),
        authors: await listAll('/api/blogs/authors'),
        posts: await listAll('/api/blogs', '&draftPreview=true'),
      };

// Folders
const folderIds = {};
for (const [slug, name] of [
  ['blog', 'Blog'],
  ['changelog', 'Changelog'],
]) {
  const found = existing.folders.find(
    (f) => f.slug === slug && !f.parentFolder && !f.archived
  );
  if (found) {
    folderIds[slug] = found._id;
    say(`folder ${slug}: exists`);
  } else {
    say(`folder ${slug}:`);
    const created = await write(`create folder ${slug}`, () =>
      api('POST', '/api/blogs/folders', { name, slug })
    );
    folderIds[slug] = created?._id ?? `<new ${slug}>`;
  }
}

// Authors
const authorIds = {};
for (const a of authorsIn) {
  const found = existing.authors.find((x) => x.username === a.username);
  const body = {
    name: a.name,
    username: a.username,
    ...(a.image && { image: a.image }),
    links: a.links,
  };
  if (found) {
    authorIds[a.username] = found._id;
    const changed =
      found.name !== a.name ||
      (a.image && found.image !== a.image) ||
      JSON.stringify(found.links ?? {}) !== JSON.stringify(a.links);
    say(`author ${a.username}: ${changed ? 'update' : 'unchanged'}`);
    if (changed) {
      await write(`update author ${a.username}`, () =>
        api('PATCH', `/api/blogs/authors/${found._id}`, body)
      );
    }
  } else {
    say(`author ${a.username}:`);
    const created = await write(`create author ${a.username}`, () =>
      api('POST', '/api/blogs/authors', body)
    );
    authorIds[a.username] = created?._id ?? `<new ${a.username}>`;
  }
}

// Tags
const tagIds = {};
const tagsWanted = new Map();
for (const p of postsIn) for (const t of p.tags) tagsWanted.set(t.slug, t);
for (const t of tagsWanted.values()) {
  const found = existing.tags.find((x) => x.slug === t.slug);
  if (found) {
    tagIds[t.slug] = found._id;
    say(`tag ${t.slug}: exists`);
  } else {
    say(`tag ${t.slug}:`);
    const created = await write(`create tag ${t.slug}`, () =>
      api('POST', '/api/blogs/tags', {
        title: t.title,
        slug: t.slug,
        public: true,
        seo: {
          title: t.title,
          description: `ReelForge posts tagged ${t.title}.`,
          keywords: [t.title],
        },
      })
    );
    tagIds[t.slug] = created?._id ?? `<new ${t.slug}>`;
  }
}

// Posts
const summary = { created: 0, updated: 0, unchanged: 0 };
for (const p of postsIn) {
  const folderId = folderIds[p.folder];
  const found = existing.posts.find(
    (x) => x.slug === p.slug && idOf(x.folder) === folderId
  );
  const wantTags = p.tags.map((t) => tagIds[t.slug]);
  const wantAuthors =
    p.author && authorIds[p.author] ? [authorIds[p.author]] : [];
  if (p.author && !authorIds[p.author]) {
    p.issues.push(`author "${p.author}" has no author file; post has none`);
  }
  const fields = {
    title: p.title,
    description: p.description,
    content: p.content,
    seo: p.seo,
  };

  if (!found) {
    say(`post ${p.folder}/${p.slug}: create`);
    summary.created++;
    const created = await write(`create draft "${p.title}"`, () =>
      api('POST', '/api/blogs', { title: p.title })
    );
    const id = created?._id;
    await write(`set slug, folder, summary, body and SEO`, () =>
      api('PATCH', `/api/blogs/${id}`, {
        ...fields,
        slug: p.slug,
        folder: folderId,
      })
    );
    if (wantTags.length) {
      await write(`set tags ${p.tags.map((t) => t.slug).join(', ')}`, () =>
        api('PATCH', `/api/blogs/${id}/tags`, { tags: wantTags })
      );
    }
    if (wantAuthors.length) {
      await write(`set author ${p.author}`, () =>
        api('PATCH', `/api/blogs/${id}/authors`, { authors: wantAuthors })
      );
    }
    if (p.published) {
      await write('publish', () =>
        api('PATCH', `/api/blogs/${id}`, { published: true })
      );
    }
    continue;
  }

  const changes = {};
  for (const [k, v] of Object.entries(fields)) {
    if (JSON.stringify(found[k] ?? null) !== JSON.stringify(v)) changes[k] = v;
  }
  if (Boolean(found.published) !== p.published) changes.published = p.published;
  const tagsChanged =
    wantTags.length > 0 && !sameSet((found.tags ?? []).map(idOf), wantTags);
  const authorsChanged =
    wantAuthors.length > 0 &&
    !sameSet((found.authors ?? []).map(idOf), wantAuthors);

  if (!Object.keys(changes).length && !tagsChanged && !authorsChanged) {
    say(`post ${p.folder}/${p.slug}: unchanged`);
    summary.unchanged++;
    continue;
  }
  say(`post ${p.folder}/${p.slug}: update`);
  summary.updated++;
  if (Object.keys(changes).length) {
    await write(`update ${Object.keys(changes).join(', ')}`, () =>
      api('PATCH', `/api/blogs/${found._id}`, changes)
    );
  }
  if (tagsChanged) {
    await write('update tags', () =>
      api('PATCH', `/api/blogs/${found._id}/tags`, { tags: wantTags })
    );
  }
  if (authorsChanged) {
    await write('update authors', () =>
      api('PATCH', `/api/blogs/${found._id}/authors`, { authors: wantAuthors })
    );
  }
}

say(
  `\nPosts: ${summary.created} created, ${summary.updated} updated, ${summary.unchanged} unchanged.`
);

const report = [
  ...authorsIn.flatMap((a) =>
    a.notes.map((n) => `authors/${a.username}: ${n}`)
  ),
  ...postsIn.flatMap((p) => [
    ...p.issues.map((n) => `${p.folder}/${p.slug}: NOT CONVERTED: ${n}`),
    ...p.notes.map((n) => `${p.folder}/${p.slug}: ${n}`),
  ]),
];
if (report.length) {
  say('\nConversion report:');
  for (const line of report) say(`- ${line}`);
}
if (postsIn.some((p) => p.issues.length)) process.exitCode = 2;

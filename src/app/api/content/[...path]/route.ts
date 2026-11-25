import { NextRequest } from 'next/server';
import { defaultLocale } from '@/i18n/config';
import { siteUrl } from '@/env';
import { localeUrl } from '@/lib/i18n-url';
import { getPost } from '@/lib/blog/source';
import { postMarkdown } from '@/lib/blog/twin';
import { getDocsSite, getPublishedDoc } from '@/lib/docs/source';
import { isDocPath } from '@/lib/docs/nav';
import { docTwin, docsIndexTwin } from '@/lib/docs/twin';

/**
 * Markdown content negotiation endpoint.
 *
 * When an AI agent requests a page with `Accept: text/markdown`, the
 * middleware (or the agent directly) can hit this endpoint to get the
 * raw markdown version of the content.
 *
 * Posts come from BuildBase Blogs (src/lib/blog/source.ts), cached under
 * the `buildbase:blog` tag that the `blog.*` webhook revalidates.
 *
 * Routes:
 *   GET /api/content/blog/{slug}           → blog post markdown
 *   GET /api/content/blog/{locale}/{slug}  → localized blog post
 *   GET /api/content/changelog/{slug}      → changelog entry markdown
 *   GET /api/content/docs                  → docs index markdown (/docs.md)
 *   GET /api/content/docs/{folder}/{slug}  → a docs page's twin (/docs/x.md)
 *
 * The docs twins are reached as `/docs/<path>.md` (or with
 * `Accept: text/markdown` on a docs page): src/proxy.ts rewrites those here.
 *
 * Returns 404 if content not found, 400 if path is invalid.
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (path?.[0] === 'docs') return docsMarkdown(path.slice(1));

  if (!path || path.length === 0) {
    return Response.json(
      {
        error:
          'Path required. Use /api/content/blog/{slug} or /api/content/changelog/{slug}',
      },
      { status: 400 }
    );
  }

  const [type, ...rest] = path;

  // --- Blog posts (BuildBase Blogs) and release notes (collection `changelog`) ---
  if (type === 'blog' || type === 'changelog') {
    // /api/content/blog/{slug}, or /api/content/blog/en/{slug}: the blog is
    // English only.
    const slug =
      rest.length === 1
        ? rest[0]
        : rest.length === 2 && type === 'blog' && rest[0] === defaultLocale
          ? rest[1]
          : null;
    if (!slug) {
      return Response.json(
        { error: `Use /api/content/${type}/{slug}` },
        { status: 400 }
      );
    }
    const post = await getPost(type, slug);
    if (!post) {
      return Response.json(
        { error: type === 'blog' ? 'Post not found' : 'Entry not found' },
        { status: 404 }
      );
    }
    const url = localeUrl(siteUrl, defaultLocale, `/${type}/${slug}`);
    return new Response(postMarkdown(post, url), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        Vary: 'Accept',
      },
    });
  }

  return Response.json(
    {
      error: `Unknown content type "${type}". Use "blog", "changelog" or "docs".`,
    },
    { status: 400 }
  );
}

/** Docs twins, read from BuildBase Docs (cached; see src/lib/docs/source.ts). */
async function docsMarkdown(segments: string[]): Promise<Response> {
  const headers = {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    Vary: 'Accept',
  };
  const base = siteUrl.replace(/\/$/, '');
  if (segments.length === 0) {
    const { nav } = await getDocsSite();
    return new Response(docsIndexTwin(nav, base), { headers });
  }
  const clean = [...segments];
  clean[clean.length - 1] = clean[clean.length - 1].replace(/\.md$/, '');
  if (!isDocPath(clean)) {
    return new Response('Not found\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  const path = clean.join('/');
  const found = await getPublishedDoc(path);
  if (!found) {
    return new Response(
      `# Not found\n\nNo docs page at /docs/${path}. Index: ${base}/docs.md\n`,
      {
        status: 404,
        headers: { ...headers, 'Cache-Control': 'public, max-age=60' },
      }
    );
  }
  return new Response(docTwin(found.page, path, base, found.site.nav), {
    headers,
  });
}

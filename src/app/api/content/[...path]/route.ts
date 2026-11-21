import { NextRequest } from 'next/server';
import { defaultLocale } from '@/i18n/config';
import { siteUrl } from '@/env';
import { localeUrl } from '@/lib/i18n-url';
import { getPost } from '@/lib/blog/source';
import { postMarkdown } from '@/lib/blog/twin';

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
 *
 * Returns 404 if content not found, 400 if path is invalid.
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

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

  // --- Blog posts and changelog entries (BuildBase Blogs) ---
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
    { error: `Unknown content type "${type}". Use "blog" or "changelog".` },
    { status: 400 }
  );
}

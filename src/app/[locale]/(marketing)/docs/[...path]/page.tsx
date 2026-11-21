import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';
import { getPublishedDoc } from '@/lib/docs/source';
import { docHref, isDocPath, neighbours, visibleTags } from '@/lib/docs/nav';
import { renderDocMarkdown } from '@/lib/docs/markdown';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { DocsJsonLd } from '@/components/docs/docs-json-ld';
import { CopyCodeButtons } from '@/components/docs/copy-code-buttons';
import styles from '@/components/docs/docs-prose.module.css';

interface DocPageProps {
  params: Promise<{ locale: string; path: string[] }>;
}

/**
 * Rendered on request like /help (the locale layout reads request data), from
 * BuildBase reads cached in Next's data cache under the SDK's `buildbase:doc*`
 * tags. The content webhook (`doc.*`) revalidates those tags and the page
 * path, so a page published or edited in the console shows without a deploy.
 * The hour is the safety net (CONTENT_REVALIDATE_SECONDS, as a literal).
 */
export const revalidate = 3600;

async function load(segments: string[]) {
  if (!isDocPath(segments)) return null;
  const path = segments.join('/');
  const found = await getPublishedDoc(path);
  return found ? { ...found, path } : null;
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { locale, path: segments } = await params;
  const found = await load(segments);
  if (!found) return { title: 'Not found', robots: { index: false } };
  const { page, path } = found;
  const updated = page.updatedAt ?? page.publishedAt ?? undefined;
  return buildMarketingMetadata({
    path: docHref(path),
    locale: locale as Locale,
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.description || page.title,
    type: 'article',
    publishedTime: page.publishedAt ?? undefined,
    modifiedTime: updated,
    articleTags: visibleTags(page.tags),
    alternatesTypes: { 'text/markdown': `${docHref(path)}.md` },
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
}

export default async function DocPage({ params }: DocPageProps) {
  const { locale, path: segments } = await params;
  setRequestLocale(locale);
  const found = await load(segments);
  if (!found) notFound();
  const { page, site, path } = found;
  const { prev, next, current } = neighbours(site.nav, path);
  const { html } = await renderDocMarkdown(page.content);
  const updated = page.updatedAt ?? page.publishedAt ?? null;
  const section = current?.section ?? null;
  const href = docHref(path);
  // The section crumb points at its heading on the docs index (folders have no page).
  const folderPath = path.includes('/')
    ? path.slice(0, path.lastIndexOf('/'))
    : null;
  const breadcrumbs = [
    { name: 'Docs', url: '/docs' },
    ...(section && folderPath
      ? [{ name: section, url: `/docs#${folderPath.split('/')[0]}` }]
      : []),
    { name: page.title, url: href },
  ];

  return (
    <div className={`${styles.root} flex-1 px-4 py-8 sm:px-6 lg:py-12`}>
      <DocsJsonLd
        title={page.title}
        description={page.description}
        url={href}
        datePublished={page.publishedAt}
        dateModified={updated}
        section={section}
        keywords={visibleTags(page.tags)}
        breadcrumbs={breadcrumbs}
      />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        <aside>
          <DocsSidebar nav={site.nav} currentPath={path} />
        </aside>
        <article id="doc-article" className="max-w-3xl min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="text-muted-foreground mb-4 text-sm"
          >
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/docs" className="hover:text-foreground">
                  Docs
                </Link>
              </li>
              {section && folderPath && (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link
                      href={`/docs#${folderPath.split('/')[0]}`}
                      className="hover:text-foreground"
                    >
                      {section}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-muted-foreground mt-3 text-lg text-pretty">
              {page.description}
            </p>
          )}
          <p className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {updated && (
              <span>
                Updated <time dateTime={updated}>{formatDate(updated)}</time>
              </span>
            )}
            <a
              href={`${href}.md`}
              title="This page as Markdown, for agents"
              className={`${styles.line} hover:text-foreground rounded-md border px-2 py-0.5 font-mono text-xs transition-colors`}
            >
              {path.split('/').pop()}.md
            </a>
          </p>
          <div
            className={`${styles.prose} mt-8`}
            // Sanitised on the server by renderDocMarkdown (src/lib/docs/markdown.ts).
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <CopyCodeButtons containerId="doc-article" />
          {(prev || next) && (
            <nav
              aria-label="Previous and next pages"
              className={`${styles.line} mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2`}
            >
              {prev ? (
                <Link
                  href={prev.href}
                  rel="prev"
                  className={`${styles.line} hover:bg-muted rounded-xl border p-4 transition-colors`}
                >
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <ArrowLeft className="h-3 w-3" aria-hidden /> Previous
                  </span>
                  <span className="mt-1 block font-medium">{prev.title}</span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {next && (
                <Link
                  href={next.href}
                  rel="next"
                  className={`${styles.line} hover:bg-muted rounded-xl border p-4 text-end transition-colors`}
                >
                  <span className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
                    Next <ArrowRight className="h-3 w-3" aria-hidden />
                  </span>
                  <span className="mt-1 block font-medium">{next.title}</span>
                </Link>
              )}
            </nav>
          )}
        </article>
      </div>
    </div>
  );
}

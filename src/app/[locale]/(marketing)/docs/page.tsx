import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/config';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';
import { getDocsSite } from '@/lib/docs/source';
import type { NavSection } from '@/lib/docs/nav';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { hasContentApi } from '@/lib/platform/content';
import styles from '@/components/docs/docs-prose.module.css';

interface DocsIndexProps {
  params: Promise<{ locale: string }>;
}

/** ISR like the doc pages; the `doc.*` webhook revalidates /docs. */
export const revalidate = 3600;

const TITLE = 'Docs';
const DESCRIPTION =
  'Install RenderWeld with Docker, connect your AI agent over MCP or REST, and render videos at any size: quick start, API and MCP reference, manifest, cookbook, privacy and troubleshooting.';

export async function generateMetadata({
  params,
}: DocsIndexProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMarketingMetadata({
    path: '/docs',
    locale: locale as Locale,
    title: TITLE,
    description: DESCRIPTION,
    alternatesTypes: { 'text/markdown': '/docs.md' },
  });
}

const anchor = (s: NavSection) => s.path.replace(/\//g, '-');

export default async function DocsIndex({ params }: DocsIndexProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { nav } = await getDocsSite();
  const start = nav.pages[0];

  return (
    <div className={`${styles.root} flex-1 px-4 py-8 sm:px-6 lg:py-12`}>
      <BreadcrumbJsonLd items={[{ name: 'Docs', url: '/docs' }]} />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        <aside>
          <DocsSidebar nav={nav} />
        </aside>
        <div className={`max-w-3xl min-w-0`}>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            RenderWeld docs
          </h1>
          <p className="text-muted-foreground max-w-measure mt-3 text-lg text-pretty">
            {DESCRIPTION}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
            {start && (
              <Link
                href={start.href}
                className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-2 rounded-lg px-4 font-medium transition-opacity hover:opacity-90"
              >
                Start with {start.title}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
            <a
              href="/docs.md"
              title="The docs index as Markdown, for agents"
              className={`${styles.line} text-muted-foreground hover:text-foreground rounded-md border px-2 py-0.5 font-mono text-xs transition-colors`}
            >
              docs.md
            </a>
            <a
              href="/llms-full.txt"
              title="Every page in one file, for agents"
              className={`${styles.line} text-muted-foreground hover:text-foreground rounded-md border px-2 py-0.5 font-mono text-xs transition-colors`}
            >
              llms-full.txt
            </a>
          </div>

          {nav.pages.length === 0 ? (
            <p
              className={`${styles.line} text-muted-foreground mt-12 rounded-xl border p-6 text-sm`}
            >
              {hasContentApi()
                ? 'No docs are published yet.'
                : 'The docs could not be loaded on this server (no BuildBase token configured).'}{' '}
              The same docs are in the{' '}
              <a
                href="https://github.com/buildbase-app/reelforge-studio/tree/main/docs"
                className="underline underline-offset-2"
              >
                RenderWeld repository
              </a>
              .
            </p>
          ) : (
            <div className="mt-12">
              {nav.sections.map((s) => (
                <SectionRow key={s.id} section={s} />
              ))}
              {nav.rootPages.length > 0 && (
                <SectionRow
                  section={{
                    id: 'more',
                    name: 'More',
                    path: 'more',
                    pages: nav.rootPages,
                    sections: [],
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * One folder as a row of the table of contents: its name on the left, its
 * pages with their descriptions on the right, hairlines between folders.
 */
function SectionRow({ section }: { section: NavSection }) {
  const pages = [section, ...section.sections].flatMap((s) => s.pages);
  return (
    <section
      id={anchor(section)}
      aria-labelledby={`${anchor(section)}-title`}
      className={`${styles.line} grid scroll-mt-24 gap-3 border-t py-6 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-8`}
    >
      <h2 id={`${anchor(section)}-title`} className="font-medium">
        {section.name}
      </h2>
      <ul className="space-y-4">
        {pages.map((p) => (
          <li key={p.id}>
            <Link
              href={p.href}
              className="font-medium underline-offset-4 hover:underline"
            >
              {p.title}
            </Link>
            {p.description && (
              <p className="text-muted-foreground mt-1 text-sm text-pretty">
                {p.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

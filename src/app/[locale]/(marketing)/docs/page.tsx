import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';
import { getDocsSite } from '@/lib/docs/source';
import type { NavSection } from '@/lib/docs/nav';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { hasContentApi } from '@/lib/platform/content';

interface DocsIndexProps {
  params: Promise<{ locale: string }>;
}

/** ISR like the doc pages; the `doc.*` webhook revalidates /docs. */
export const revalidate = 3600;

const TITLE = 'Docs';
const DESCRIPTION =
  'Install ReelForge Studio with Docker, connect your AI agent over MCP or REST, and make vertical videos: quick start, API and MCP reference, manifest, cookbook, privacy and troubleshooting.';

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
    <div className="flex-1 px-4 py-8 sm:px-6 lg:py-12">
      <BreadcrumbJsonLd items={[{ name: 'Docs', url: '/docs' }]} />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        <aside>
          <DocsSidebar nav={nav} />
        </aside>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ReelForge docs
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
            {DESCRIPTION}
          </p>
          <p className="text-muted-foreground mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a
              href="/docs.md"
              className="hover:text-foreground underline underline-offset-2"
            >
              View as Markdown
            </a>
            <a
              href="/llms-full.txt"
              className="hover:text-foreground underline underline-offset-2"
            >
              Everything in one file (llms-full.txt)
            </a>
          </p>
          {start && (
            <Link
              href={start.href}
              className="bg-primary text-primary-foreground mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
            >
              Start with {start.title}{' '}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}

          {nav.pages.length === 0 ? (
            <p className="text-muted-foreground mt-10 rounded-xl border p-6 text-sm">
              {hasContentApi()
                ? 'No docs are published yet.'
                : 'The docs could not be loaded on this server (no BuildBase token configured).'}{' '}
              The same docs are in the{' '}
              <a
                href="https://github.com/buildbase-app/reelforge-studio/tree/main/docs"
                className="underline underline-offset-2"
              >
                ReelForge Studio repository
              </a>
              .
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {nav.sections.map((s) => (
                <SectionCard key={s.id} section={s} />
              ))}
              {nav.rootPages.length > 0 && (
                <SectionCard
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

function SectionCard({ section }: { section: NavSection }) {
  const pages = [section, ...section.sections].flatMap((s) => s.pages);
  return (
    <section
      id={anchor(section)}
      className="bg-card scroll-mt-24 rounded-xl border p-5"
    >
      <h2 className="font-semibold">{section.name}</h2>
      <ul className="mt-3 space-y-3">
        {pages.map((p) => (
          <li key={p.id}>
            <Link
              href={p.href}
              className="font-medium underline-offset-2 hover:underline"
            >
              {p.title}
            </Link>
            {p.description && (
              <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                {p.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

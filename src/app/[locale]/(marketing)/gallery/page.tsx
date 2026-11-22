import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/seo/json-ld';
import { GalleryCard } from '@/components/gallery/gallery-card';
import { GalleryReveal } from '@/components/gallery/gallery-reveal';
import { absoluteUrl } from '@/config/seo';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';
import {
  ENGINE_LABELS,
  applyFilter,
  categories,
  filterHref,
  getGallery,
  parseFilter,
} from '@/lib/gallery';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';
import '@/components/gallery/gallery.css';

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const TITLE = 'Gallery: reels rendered by ReelForge Studio';
const DESCRIPTION =
  'Short vertical videos an AI agent planned and ReelForge Studio rendered, each with the prompt, the engines, the MCP tools it called and how long the render took.';

export async function generateMetadata({
  params,
}: GalleryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const reels = await getGallery();
  return buildMarketingMetadata({
    path: '/gallery',
    locale: locale as Locale,
    title: TITLE,
    description: DESCRIPTION,
    titleAbsolute: true,
    ...(reels[0] ? { image: reels[0].poster.jpg } : {}),
  });
}

/**
 * Every reel in the BuildBase Collection `gallery`, server-rendered from the
 * SDK's cached read (the content webhook refreshes it when a record changes).
 * Filters are links with URL parameters (`?category=…&engine=…`): no client
 * fetching, no secrets in the browser. The only client islands are the card
 * players and the scroll-reveal fallback.
 */
export default async function GalleryPage({
  params,
  searchParams,
}: GalleryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const all = await getGallery();
  const filter = parseFilter(await searchParams, all);
  const shown = applyFilter(all, filter);
  const filtered = Boolean(filter.category || filter.engine);
  const featured = filtered ? [] : shown.filter((r) => r.featured).slice(0, 3);
  const rest = shown.filter((r) => !featured.includes(r));
  const cats = categories(all);
  const engineCounts = Object.keys(ENGINE_LABELS)
    .map((e) => ({
      id: e,
      label: ENGINE_LABELS[e]!,
      count: all.filter((r) => r.engines.includes(e)).length,
    }))
    .filter((e) => e.count > 0);
  const hardware = all[0]?.hardware;

  return (
    <div className="gl flex w-full flex-1 flex-col">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Gallery', url: absoluteUrl('/gallery') },
        ]}
      />
      <ItemListJsonLd
        name="ReelForge gallery"
        url="/gallery"
        items={shown.map((r) => ({
          name: r.title,
          url: `/gallery/${r.slug}`,
          description: r.description,
        }))}
      />

      <div className="mx-auto w-full max-w-[1240px] px-4 pt-12 pb-24 md:px-6 md:pt-20">
        <header className="max-w-[720px]">
          <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Reels an agent planned and ReelForge rendered
          </h1>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">
            Each clip came out of ReelForge Studio from the prompt on its page,
            over MCP. Open one to copy the prompt and the manifest.
          </p>
          {all.length > 0 && (
            <p className="gl-receipt text-muted-foreground mt-4 text-sm">
              {all.length} reels · 4 engines
              {hardware ? ` · rendered on ${hardware}` : ''}
            </p>
          )}
        </header>

        {all.length === 0 ? (
          <p className="text-muted-foreground mt-16 max-w-[60ch]">
            The gallery is being rendered. Meanwhile the{' '}
            <Link href="/#reels" className="text-foreground underline">
              reels on the home page
            </Link>{' '}
            show what the studio makes.
          </p>
        ) : (
          <>
            <nav aria-label="Filter reels" className="mt-10 space-y-3">
              <ul className="gl-chips" aria-label="Category">
                <li>
                  <Link
                    href={filterHref({ engine: filter.engine })}
                    className="gl-chip"
                    aria-current={filter.category ? undefined : 'true'}
                  >
                    All
                  </Link>
                </li>
                {cats.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={filterHref({
                        category: filter.category === c.slug ? null : c.slug,
                        engine: filter.engine,
                      })}
                      className="gl-chip"
                      aria-current={
                        filter.category === c.slug ? 'true' : undefined
                      }
                    >
                      {c.label}
                      <span className="text-muted-foreground gl-receipt text-xs">
                        {c.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="gl-chips" aria-label="Engine">
                {engineCounts.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={filterHref({
                        category: filter.category,
                        engine: filter.engine === e.id ? null : e.id,
                      })}
                      className="gl-chip"
                      aria-current={filter.engine === e.id ? 'true' : undefined}
                    >
                      {e.label}
                      <span className="text-muted-foreground gl-receipt text-xs">
                        {e.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div id="gallery-grid">
              {featured.length > 0 && (
                <section aria-label="Featured reels" className="mt-12">
                  <ul className="gl-featured">
                    {featured.map((r, i) => (
                      <GalleryCard
                        key={r.slug}
                        reel={r}
                        large
                        priority={i === 0}
                      />
                    ))}
                  </ul>
                </section>
              )}
              <section
                aria-label={filtered ? 'Matching reels' : 'All reels'}
                className="mt-14"
              >
                {filtered && (
                  <p
                    className="text-muted-foreground mb-6 text-sm"
                    aria-live="polite"
                  >
                    {shown.length} {shown.length === 1 ? 'reel' : 'reels'}
                    {' · '}
                    <Link href="/gallery" className="text-foreground underline">
                      Clear filters
                    </Link>
                  </p>
                )}
                {rest.length > 0 ? (
                  <ul className="gl-grid">
                    {rest.map((r, i) => (
                      <GalleryCard
                        key={r.slug}
                        reel={r}
                        priority={filtered && i < 2}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    No reel matches both filters.
                  </p>
                )}
              </section>
            </div>
            <GalleryReveal targetId="gallery-grid" />
          </>
        )}
      </div>
    </div>
  );
}

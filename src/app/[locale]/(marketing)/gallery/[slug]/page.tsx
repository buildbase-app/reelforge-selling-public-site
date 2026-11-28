import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, Download } from 'lucide-react';
import { BreadcrumbJsonLd, VideoObjectJsonLd } from '@/components/seo/json-ld';
import { CopyButton } from '@/components/product/copy-button';
import { ReelVideo } from '@/components/product/reel-video';
import { formatSeconds, receipt } from '@/components/gallery/gallery-card';
import { absoluteUrl } from '@/config/seo';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/config';
import {
  ENGINE_LABELS,
  agentSnippet,
  getGalleryReel,
  videoObject,
} from '@/lib/gallery';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';
import '@/components/gallery/gallery.css';

interface ReelPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * Rendered on request, like the blog posts: no `generateStaticParams`. The
 * build has no API token, so it found no reels and marked the route static
 * (SSG); an unknown slug then rendered the 404 in a static render, where the
 * root layout's `headers()` (the CSP nonce) and next-intl threw, and the
 * visitor got a 500 instead of the 404 (studio issue #186).
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: ReelPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const reel = await getGalleryReel(slug);
  if (!reel) return { title: 'Reel not found' };
  const base = buildMarketingMetadata({
    path: `/gallery/${reel.slug}`,
    locale: locale as Locale,
    title: `${reel.title}: made with RenderWeld`,
    description:
      reel.description ||
      `A ${formatSeconds(reel.durationSeconds)}-second reel rendered by RenderWeld.`,
    image: reel.poster.jpg,
  });
  return {
    ...base,
    other: {
      'og:video': reel.mp4,
      'og:video:type': 'video/mp4',
      'og:video:width': '720',
      'og:video:height': '1280',
    },
  };
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[136px_1fr] gap-4 border-t py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/**
 * One reel's watch page: the video, a prompt for your agent, how it was made
 * (a hand-written manifest rendered over MCP by the studio's gallery script:
 * engines, the MCP tools it called, render time with the hardware,
 * studio version and date, all from the studio's own render manifest) and a
 * snippet to make it again with your agent. VideoObject JSON-LD; the poster is
 * the OG image.
 */
export default async function ReelPage({ params }: ReelPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const reel = await getGalleryReel(slug);
  if (!reel) notFound();
  const pageUrl = absoluteUrl(`/gallery/${reel.slug}`);
  const date = reel.renderedAt ? new Date(reel.renderedAt) : null;
  const snippet = agentSnippet(reel);

  return (
    <div className="gl flex w-full flex-1 flex-col">
      <VideoObjectJsonLd id={reel.slug} data={videoObject(reel, pageUrl)} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Gallery', url: absoluteUrl('/gallery') },
          { name: reel.title, url: pageUrl },
        ]}
      />
      <div className="mx-auto w-full max-w-[1120px] px-4 pt-8 pb-24 md:px-6 md:pt-12">
        <Link
          href="/gallery"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Gallery
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,400px)_minmax(0,1fr)] md:gap-16">
          <div className="md:sticky md:top-24 md:self-start">
            <div className="gl-frame mx-auto max-w-[400px]">
              <ReelVideo
                priority
                className="absolute inset-0 [&_img]:absolute [&_img]:inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:absolute [&_video]:inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
                sources={[
                  {
                    webm: reel.webm,
                    mp4: reel.mp4,
                    avif: reel.poster.avif,
                    jpg: reel.poster.jpg,
                    webmType: 'video/webm; codecs="vp9"',
                    label: `Silent ${formatSeconds(reel.durationSeconds)}-second reel: ${reel.title}`,
                  },
                ]}
              />
            </div>
            <p className="gl-receipt text-muted-foreground mt-3 text-center text-xs">
              Preview: 720×1280 without sound. The full render is 1080×1920 with
              music.
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-muted-foreground text-sm">{reel.category}</p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-balance md:text-4xl">
              {reel.title}
            </h1>
            <p className="gl-receipt text-muted-foreground mt-3 text-sm">
              {receipt(reel)}
            </p>

            <section aria-labelledby="prompt-title" className="mt-10">
              <h2 id="prompt-title" className="text-lg font-medium">
                A prompt for your agent
              </h2>
              <p className="text-muted-foreground mt-2 text-sm text-pretty">
                The request this reel answers, written with its manifest. Give
                it to your agent to make one like it.
              </p>
              <blockquote className="gl-prompt bg-muted/50 mt-3 rounded-xl border p-5 text-[15px] leading-relaxed text-pretty">
                {reel.prompt}
              </blockquote>
              <CopyButton
                text={reel.prompt}
                label="Copy prompt"
                ariaLabel={`Copy the prompt for: ${reel.title}`}
                goal="copy_reel_prompt"
                goalProps={{ reel: reel.slug }}
                className="mt-3"
              />
            </section>

            <section aria-labelledby="how-title" className="mt-12">
              <h2 id="how-title" className="text-lg font-medium">
                How it was made
              </h2>
              <p className="text-muted-foreground mt-2 text-sm text-pretty">
                We wrote the manifest (its scenes, templates and timing) for
                this gallery. The gallery script sent it to RenderWeld over MCP
                with the same tool calls an agent makes, and RenderWeld rendered
                it. These facts come from RenderWeld&apos;s own render report
                {reel.manifestUrl ? (
                  <>
                    ; the{' '}
                    <a
                      href={reel.manifestUrl}
                      download={`${reel.slug}.json`}
                      className="text-foreground underline"
                    >
                      project manifest
                    </a>{' '}
                    lists every scene with its engine and template
                  </>
                ) : null}
                .
              </p>
              <dl className="mt-4 border-b">
                <Fact label="Engines">
                  {reel.engines.map((e) => ENGINE_LABELS[e] ?? e).join(', ')}
                </Fact>
                {reel.theme && <Fact label="Theme">{reel.theme}</Fact>}
                <Fact label="Output">
                  1080×1920, {reel.fps} fps, {reel.frames} frames,{' '}
                  {formatSeconds(reel.durationSeconds)} s
                </Fact>
                {reel.renderSeconds > 0 && (
                  <Fact label="Render time">
                    {formatSeconds(reel.renderSeconds)} s
                    {reel.hardware && (
                      <span className="text-muted-foreground">
                        {' '}
                        on {reel.hardware}
                      </span>
                    )}
                  </Fact>
                )}
                {reel.studioVersion && (
                  <Fact label="Version">
                    RenderWeld {reel.studioVersion}
                    {reel.engineVersions && (
                      <span className="text-muted-foreground block text-xs">
                        {reel.engineVersions}
                      </span>
                    )}
                  </Fact>
                )}
                {date && !Number.isNaN(date.getTime()) && (
                  <Fact label="Rendered">
                    <time dateTime={reel.renderedAt}>
                      {date.toISOString().slice(0, 10)}
                    </time>
                  </Fact>
                )}
                {reel.tools.length > 0 && (
                  <Fact label="MCP tools">
                    <ol className="flex flex-wrap gap-1.5">
                      {reel.tools.map((t) => (
                        <li key={t}>
                          <code className="bg-muted rounded-md px-2 py-0.5 text-xs">
                            {t}
                          </code>
                        </li>
                      ))}
                    </ol>
                    {reel.mcpCalls > 0 && (
                      <span className="text-muted-foreground mt-2 block text-xs">
                        {reel.mcpCalls} calls in this order, recorded by the
                        gallery pipeline
                      </span>
                    )}
                  </Fact>
                )}
              </dl>
            </section>

            <section aria-labelledby="agent-title" className="mt-12">
              <h2 id="agent-title" className="text-lg font-medium">
                Make this with your agent
              </h2>
              <p className="text-muted-foreground mt-2 text-sm text-pretty">
                Connect your agent to your RenderWeld server (
                <Link href="/agents" className="text-foreground underline">
                  how
                </Link>
                ), then give it this.
              </p>
              <pre className="bg-muted/50 mt-3 overflow-x-auto rounded-xl border p-5 text-[13px] leading-relaxed whitespace-pre-wrap">
                <code>{snippet}</code>
              </pre>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <CopyButton
                  text={snippet}
                  label="Copy for your agent"
                  goal="copy_reel_agent_snippet"
                  goalProps={{ reel: reel.slug }}
                />
                {reel.manifestUrl && (
                  <a
                    href={reel.manifestUrl}
                    download={`${reel.slug}.json`}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Manifest (JSON)
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/link';
import { siteConfig } from '@/config/site';
import {
  enginesOf,
  getReel,
  hardwareLabel,
  reels,
  toolCatalog,
  toolCatalogSource,
  type Reel,
} from '@/lib/agents/catalog';
import {
  heroDemoShown,
  heroEntry,
  marqueeRows,
  showcaseReels,
} from '@/lib/gallery/showcase';
import { CopyButton } from './copy-button';
import { ReelVideo, type ReelSource } from './reel-video';
import './product.css';

/**
 * The homepage's product story (studio issue #44, the private site plan
 * §B.2; RenderWeld rename, studio #411 and #457): one idea per section, real
 * reels, footnotes on every number. Server components; the only client
 * islands are the reel player, the copy buttons, the agent tabs and the
 * store's own price and CTA components. English only for now (src/i18n/config.ts), so the copy lives
 * here, together, for translation.
 *
 * Every claim is checkable in the studio repository's `main` (2026-11-24):
 * docs/public/manifest/formats.md, docs/CAPTIONS.md, docs/WORKSPACES.md,
 * docs/PROVIDERS.md, docs/ISOLATION.md, docs/cloud/overview.md,
 * docs/PERFORMANCE.md, docs/SCALE.md and docs/STATUS.md; every number comes
 * from src/data/*.json or has a footnote saying where it comes from.
 */

/** A footnote marker that links to its note at the bottom of the page. */
export function Fn({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 text-[0.7em] font-medium">
      <a href={`#fn-${n}`} aria-label={`Footnote ${n}`}>
        {n}
      </a>
    </sup>
  );
}

export function reelSource(reel: Reel): ReelSource {
  return {
    webm: reel.files.webm,
    mp4: reel.files.mp4,
    avif: reel.files.avif,
    jpg: reel.files.jpg,
    avifSrcSet: reel.files.avifSrcSet,
    webpSrcSet: reel.files.webpSrcSet,
    label: `Silent ${reel.output.durationSeconds}-second reel rendered by RenderWeld. On screen: ${reel.scenes
      .map((s) => s.text)
      .filter(Boolean)
      .join(' / ')}`,
  };
}

/** The weld point: the brand's orange dot, where two things join. */
function Weld({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`rf-weld ${className}`} style={style} aria-hidden="true" />
  );
}

/** The phone's screen width (`.rf-phone`: min(72vw, 300px), 10px padding). */
const PHONE_SIZES = '(min-width: 417px) 280px, calc(72vw - 20px)';

/** A rail card's width (`.rf-rail`). */
const RAIL_SIZES = '(min-width: 768px) 368px, min(78vw, 300px)';

function Phone({
  sources,
  priority,
  className = '',
}: {
  sources: ReelSource[];
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`rf-phone ${className}`}>
      <ReelVideo
        sources={sources}
        priority={priority}
        sizes={PHONE_SIZES}
        className="rf-screen"
      />
    </div>
  );
}

/**
 * The hero's demo: a replay of a recorded Claude Code session that makes a
 * four-engine reel over MCP (store #18, `public/walkthroughs/`; recorded on
 * 2026-11-21, waits shortened). It plays in the site's own reel player, so
 * it adds no JavaScript: the poster (AVIF or WebP, 480 or 640 px) is the
 * only thing fetched with the page and is preloaded at high priority; the
 * silent video starts once the window is on screen, pauses when it leaves,
 * never plays on its own under reduced motion, and has a pause button.
 */
const DEMO = {
  base: `/walkthroughs/${heroEntry.file}`,
  seconds: 35,
  prompt: 'make a 9-second reel that mixes all four engines',
};
/** The demo window's width: the hero's right column, or the screen. */
const DEMO_SIZES =
  '(min-width: 1248px) 500px, (min-width: 1024px) 40vw, calc(100vw - 32px)';
const demoSet = (ext: 'avif' | 'webp') =>
  `${DEMO.base}-480.${ext} 480w, ${DEMO.base}-640.${ext} 640w`;
const DEMO_SOURCE: ReelSource = {
  webm: `${DEMO.base}.webm`,
  mp4: `${DEMO.base}.mp4`,
  avif: `${DEMO.base}-640.avif`,
  jpg: `${DEMO.base}.jpg`,
  avifSrcSet: demoSet('avif'),
  webpSrcSet: demoSet('webp'),
  webmType: 'video/webm; codecs="vp9"',
  label: `Silent ${DEMO.seconds}-second replay of a recorded session: Claude Code is asked to ${DEMO.prompt}, calls the RenderWeld MCP tools to create, check and render the project, and the finished reel plays on the right.`,
};

/**
 * Hero: the promise, the buttons, and a real agent session in a window.
 * Two layers give it depth: the welded frames of the brand mark sit behind
 * the window and move slower than it on scroll (still offset, so the depth
 * stays under reduced motion). The session follows the gallery bar (studio
 * issue #807): below it, only the welded frames show and nothing is
 * preloaded.
 */
export function Hero({
  heading,
  ctas,
  showDemo = heroDemoShown(),
}: {
  heading: React.ReactNode;
  ctas: React.ReactNode;
  showDemo?: boolean;
}) {
  const duration = `0:${String(DEMO.seconds).padStart(2, '0')}`;
  return (
    <section
      id="overview"
      aria-labelledby="hero-title"
      className="dark rf-stage rf-hero w-full scroll-mt-(--header-h) overflow-hidden"
      data-parallax=""
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-4 pt-16 pb-24 md:px-6 md:pt-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:pb-32">
        <div>
          <h1 id="hero-title" className="rf-display rf-fade-up">
            {heading}
          </h1>
          <p className="rf-muted rf-fade-up-2 rf-lede mt-6 text-lg leading-relaxed text-pretty md:text-xl">
            Your AI agent plans every scene over MCP or REST. RenderWeld renders
            it on your own server, at the size and frame rate you ask for, and
            checks the file before it hands it back.
          </p>
          {/* Its own line, so the subhead above (the LCP text on phones)
              never waits for the mono face. */}
          <p className="rf-fade-up-2 mt-4 text-[15px] leading-loose">
            <span className="rf-muted">Like this: </span>
            <code className="rf-chip">
              make a <span className="whitespace-nowrap">9-second</span> reel
              that mixes all four engines
            </code>
          </p>
          <div className="rf-fade-up-2 mt-8 [&>div]:items-start [&>div]:justify-start">
            {ctas}
          </div>
          <p className="rf-muted mt-6 text-sm">
            Free for personal use. One-time Commercial licence. No per-video
            fees
            <Fn n={1} />
          </p>
        </div>
        {showDemo ? (
          <figure className="relative min-w-0">
            {/* The far layer: the mark's two frames, welded, behind the
                window. Decoration only. */}
            <div className="rf-hero-frames rf-par-far" aria-hidden="true">
              <span className="rf-hero-tall" />
              <span className="rf-hero-wide" />
              <Weld className="rf-hero-weld" />
            </div>
            <div className="rf-par-near relative">
              <div className="rf-window rf-demo">
                <div className="rf-demo-bar border-b border-white/10">
                  <span className="rf-receipt truncate">
                    Claude Code over MCP · agent-session.mp4
                  </span>
                  <span className="rf-receipt shrink-0">{duration}</span>
                </div>
                <div className="rf-demo-screen">
                  <ReelVideo
                    sources={[DEMO_SOURCE]}
                    priority
                    sizes={DEMO_SIZES}
                    className="absolute inset-0"
                  />
                </div>
                <div className="rf-demo-bar border-t border-white/10">
                  <span className="rf-receipt">
                    prompt, MCP calls, checked MP4
                  </span>
                  <span className="rf-receipt shrink-0">silent</span>
                </div>
              </div>
              <figcaption className="rf-receipt mt-4">
                A replay of a recorded session on 2026-11-21: the real prompt,
                tool calls, results and reel, with the waits shortened.
              </figcaption>
            </div>
          </figure>
        ) : (
          <div className="relative min-w-0" aria-hidden="true">
            <div className="rf-hero-frames rf-par-far">
              <span className="rf-hero-tall" />
              <span className="rf-hero-wide" />
              <Weld className="rf-hero-weld" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Frames from gallery reels the studio rendered (`public/reels/marquee`,
 * 288×512 WebP, about 4 KB each), in two rows that drift in opposite
 * directions. Each name ends in the first 8 hex digits of the file's SHA-256,
 * because public/_headers caches /reels/* as immutable: a changed poster
 * needs a new name. Only posters of reels that meet the gallery bar are
 * shown (src/data/showcase.json, studio issue #807).
 */
function MarqueeRow({
  slugs,
  reverse,
}: {
  slugs: string[];
  reverse?: boolean;
}) {
  // One copy that drifts to its end and back, so no poster is sent twice.
  return (
    <div className={`rf-marquee ${reverse ? 'rf-marquee-rev' : ''}`}>
      <ul>
        {slugs.map((slug) => (
          <li key={slug}>
            {/* A fixed 288 px poster from public/: nothing for next/image to do. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/reels/marquee/${slug}.webp`}
              alt=""
              width={288}
              height={512}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The light card: real reel posters drifting past, and what RenderWeld is. */
export function ReelMarquee() {
  const rows = marqueeRows();
  // "Every poster here is a real render" needs posters: no section without.
  if (rows[0].length + rows[1].length === 0) return null;
  return (
    <section
      aria-labelledby="made-title"
      className="dark rf-stage rf-marquee-band w-full"
    >
      <div className="mx-auto max-w-[1200px] px-4 pb-24 md:px-6 md:pb-32">
        <div className="rf-paper overflow-hidden py-6 md:py-8">
          <div aria-hidden="true">
            <MarqueeRow slugs={rows[0]} />
          </div>
          <div className="mx-auto max-w-[760px] px-6 py-10 text-center md:py-14">
            <h2 id="made-title" className="rf-headline">
              Every poster here is a real render
            </h2>
            <p className="rf-muted max-w-measure mx-auto mt-4 text-lg text-pretty">
              Frames from reels in the gallery. A script sent each manifest to
              RenderWeld over MCP, the way your agent would, and RenderWeld
              rendered it.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <ul aria-label="Not this" className="contents">
                {['Prompt packs', 'Per-video credits', 'A hosted editor'].map(
                  (item) => (
                    <li key={item} className="rf-not">
                      {item}
                    </li>
                  )
                )}
              </ul>
              <ArrowRight
                className="rf-muted mx-1 h-4 w-4 shrink-0"
                aria-hidden
              />
              <p className="rf-is">
                <span className="sr-only">But this: </span>
                <Weld />A renderer on your own server
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Link
                href="/gallery"
                className="rf-link inline-flex items-center"
              >
                See every reel in the gallery
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              <label className="rf-pause">
                <input type="checkbox" />
                Pause the posters
              </label>
            </div>
          </div>
          <div aria-hidden="true">
            <MarqueeRow slugs={rows[1]} reverse />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The sizes in the formats guide (docs/public/manifest/formats.md), drawn
 * to scale on one baseline and welded at the joints: the brand's one
 * illustration, with the product's real numbers in it.
 */
const FRAMES = [
  { ratio: '9:16', w: 1080, h: 1920 },
  { ratio: '4:5', w: 1080, h: 1350 },
  { ratio: '1:1', w: 1080, h: 1080 },
  { ratio: '16:9', w: 1920, h: 1080 },
  { ratio: '21:9', w: 2560, h: 1080 },
] as const;

type Frame = (typeof FRAMES)[number];

const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;

/** Frames side by side on one baseline, sharing walls, welded at the joints. */
function FrameRow({ frames }: { frames: readonly Frame[] }) {
  const total = frames.reduce((sum, f) => sum + f.w, 0);
  const tallest = Math.max(...frames.map((f) => f.h));
  const placed = frames.map((f, i) => ({
    ...f,
    i,
    at: frames.slice(0, i).reduce((sum, g) => sum + g.w, 0),
  }));
  return (
    <div className="rf-frames" style={{ aspectRatio: `${total} / ${tallest}` }}>
      {placed.map((f) => (
        <div
          key={f.ratio}
          className="rf-frame"
          style={
            {
              left: pct(f.at, total),
              width: pct(f.w, total),
              height: pct(f.h, tallest),
              '--rf-spread': f.i - (frames.length - 1) / 2,
            } as React.CSSProperties
          }
        >
          <span className="rf-frame-ratio">{f.ratio}</span>
          <span className="rf-frame-size">
            {f.w}×{f.h}
          </span>
        </div>
      ))}
      {placed.slice(1).map((f) => (
        // The weld sits where the shorter frame's top edge meets the wall.
        <Weld
          key={`weld-${f.ratio}`}
          className="rf-frame-weld"
          style={{
            left: pct(f.at, total),
            bottom: pct(Math.min(placed[f.i - 1].h, f.h), tallest),
          }}
        />
      ))}
    </div>
  );
}

const FORMAT_FACTS: { term: string; detail: string }[] = [
  {
    term: 'Sizes',
    detail:
      'Any even width and height from 16 to 4096 pixels, 4K included. Built-in templates lay themselves out again for each frame.',
  },
  {
    term: 'Frame rates',
    detail:
      '23.976, 24, 25, 29.97, 30, 48, 50, 59.94 and 60. NTSC rates are exact fractions, checked in the finished file.',
  },
  {
    term: 'Files',
    detail:
      'MP4 (H.264), ProRes MOV with alpha, WebM (VP9 or AV1), GIF, a PNG sequence, or the soundtrack alone as M4A or WAV.',
  },
  {
    term: 'Layouts',
    detail:
      'Split screen, picture-in-picture, lower thirds and grids, placed in safe areas so they reflow at every size.',
  },
  {
    term: 'Captions',
    detail:
      'Off, burned in, sidecar SRT, WebVTT and ASS files, or both, chosen per render.',
  },
];

/**
 * Formats: the page's engineered peak. The frames start apart and weld into
 * one row as the drawing scrolls into view (a CSS scroll-driven animation,
 * transform and opacity only); under reduced motion they stand welded and
 * only the welds fade in.
 */
export function Formats() {
  return (
    <section
      id="formats"
      aria-labelledby="formats-title"
      className="w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <h2 id="formats-title" className="rf-headline">
              Every size from one manifest
            </h2>
            <p className="text-muted-foreground max-w-measure mt-5 text-lg text-pretty">
              Set the output once, or list variants: one render call starts a
              render for each size and file type, laid out again for its frame
              and grouped under one batch id
              <Fn n={7} />.
            </p>
          </div>
          <dl className="rf-facts">
            {FORMAT_FACTS.map((fact) => (
              <div key={fact.term}>
                <dt>{fact.term}</dt>
                <dd>{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="rf-weld-figure mt-16 md:mt-20">
          <div className="hidden md:block">
            <FrameRow frames={FRAMES} />
          </div>
          <div className="space-y-6 md:hidden">
            <FrameRow frames={FRAMES.slice(0, 3)} />
            <FrameRow frames={FRAMES.slice(3)} />
          </div>
          <figcaption className="rf-receipt mt-6">
            Drawn to scale from the studio&apos;s formats guide. The built-in
            templates are checked for overflow on rendered pixels at 9:16, 4:5,
            1:1, 16:9 and 4K
            <Fn n={7} />.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/** "Your agent is the editor": the prompt, the recorded tool calls, the reel. */
export function AgentTranscript() {
  const reel = getReel('agent-directs');
  const last = reel.toolCalls.length - 1;
  return (
    <section
      id="agent"
      aria-labelledby="agent-title"
      className="dark rf-stage w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="max-w-[760px]">
          <h2 id="agent-title" className="rf-headline">
            One prompt in. A checked video out
          </h2>
          <p className="rf-muted max-w-measure mt-5 text-lg text-pretty">
            The agent reads what the server can do, writes the scenes, checks
            them and renders. These are the real calls that made the reel on the
            right.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <ol
            className="rf-window space-y-2 p-4 font-mono text-[13px] md:p-6"
            aria-label="MCP calls, in order"
          >
            <li className="rf-step rounded-lg bg-white/5 p-3 font-sans text-sm leading-relaxed">
              <span className="rf-receipt block">Prompt</span>
              {reel.prompt}
            </li>
            {reel.toolCalls.map((call, i) => (
              <li
                key={`${call.tool}-${i}`}
                className="rf-step flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/5 py-2 last:border-0"
                style={{ '--i': i + 1 } as React.CSSProperties}
              >
                <span className="inline-flex items-center gap-1.5">
                  <ChevronRight
                    className="rf-muted h-3.5 w-3.5 shrink-0"
                    aria-hidden
                  />
                  {call.tool}
                </span>
                <span className="rf-muted text-xs">
                  {i === last
                    ? `${reel.output.width}×${reel.output.height} · ${reel.output.fps} fps · ${reel.output.videoCodec.toUpperCase()} + ${reel.output.audioCodec.toUpperCase()} · checks pass`
                    : call.tool === 'get_job'
                      ? `${call.note} after ${(call.ms / 1000).toFixed(1)} s`
                      : call.note}
                </span>
              </li>
            ))}
          </ol>
          <figure className="flex flex-col items-center">
            <Phone sources={[reelSource(reel)]} />
            <figcaption className="rf-receipt mt-4 max-w-[300px] text-center">
              {enginesOf(reel).join(' · ')}: four engines,{' '}
              {reel.output.durationSeconds} seconds, rendered in{' '}
              {reel.renderSeconds} s<Fn n={2} />.
            </figcaption>
          </figure>
        </div>
        <p className="rf-muted max-w-measure mt-10 text-xs leading-relaxed">
          We sent these calls from a short script that follows the studio&apos;s
          own workflow guide, so you can rerun them. In the studio&apos;s Docker
          test, headless Claude Code made a reel with the same tools
          <Fn n={5} />.
        </p>
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: 'Run the server',
    body: 'One Docker image with FFmpeg and a headless browser inside, on your computer or a server you run. Keep a copy of the secret key, and of the admin key it prints once.',
    code: `git clone ${siteConfig.repo.url}.git renderweld
cd renderweld
echo "RENDERWELD_SECRET_KEY=$(openssl rand -base64 32)" >> .env
docker compose up -d --build
docker compose ps   # wait until the server shows (healthy)
docker compose exec renderweld renderweld keys create --name admin --scopes admin`,
    fn: 6,
  },
  {
    title: 'Add your licence key',
    body: 'Claim the free Personal key, or buy a Commercial key, on this site. The server checks it once a day and keeps rendering for 14 days without a connection.',
    code: `export ADMIN_KEY=rf_...   # the admin key from step 1
curl -s -X POST http://127.0.0.1:4321/v1/licence \\
  -H "Authorization: Bearer $ADMIN_KEY" -H 'content-type: application/json' \\
  -d '{"key":"YOUR-LICENCE-KEY"}'`,
  },
  {
    title: 'Connect your agent',
    body: 'Make a key for your agent that can build and render but not change the server, give it the MCP address, then ask for a reel. Or call the REST API from a script.',
    code: `docker compose exec renderweld renderweld keys create --name agent --scopes read,write,render
claude mcp add --transport http renderweld http://127.0.0.1:4321/mcp \\
  --header "Authorization: Bearer rf_..."   # the agent key`,
  },
] as const;

/** Sticky "how it works": the title stays while three steps scroll past. */
export function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="rf-how w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-4 py-24 md:px-6 md:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:self-start">
          <h2 id="how-title" className="rf-headline">
            Three steps to your first reel
          </h2>
          <p className="text-muted-foreground max-w-measure mt-5 text-lg text-pretty">
            Everything after the first key happens from your agent: projects,
            renders, more keys, settings.
          </p>
          <nav aria-label="Steps" className="rf-how-rail mt-10 hidden lg:block">
            <span className="rf-how-track" aria-hidden />
            <span className="rf-how-fill" aria-hidden />
            <ol className="text-[15px]">
              {STEPS.map((step, i) => (
                <li key={step.title} className="rf-how-label">
                  <a
                    href={`#how-step-${i + 1}`}
                    className="text-muted-foreground hover:text-foreground grid transition-colors"
                  >
                    <span className="col-start-1 row-start-1">
                      {step.title}
                    </span>
                    <span
                      className="rf-how-on col-start-1 row-start-1"
                      aria-hidden
                    >
                      {step.title}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <ol className="rf-how-steps space-y-16 lg:space-y-32">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              id={`how-step-${i + 1}`}
              className="scroll-mt-[calc(var(--header-h)+1rem)]"
            >
              <h3 className="text-2xl font-medium tracking-tight md:text-3xl">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
                {'fn' in step ? <Fn n={step.fn} /> : null}
              </h3>
              <p className="text-muted-foreground max-w-measure mt-3 text-pretty">
                {step.body}
              </p>
              <div className="rf-window mt-5 min-w-0">
                <div className="flex items-center justify-end border-b border-white/10 px-3 py-2">
                  <CopyButton
                    text={step.code}
                    ariaLabel={`Copy the commands for step ${i + 1}`}
                    goal={i === 2 ? 'copy_agent_snippet' : 'copy_install_step'}
                    goalProps={{ step: String(i + 1), section: 'how' }}
                  />
                </div>
                <pre
                  tabIndex={0}
                  className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed"
                >
                  <code>{step.code}</code>
                </pre>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Wrapper for the connect-your-agent tabs on the homepage. */
export function ConnectAgent({ tabs }: { tabs: React.ReactNode }) {
  return (
    <section
      id="connect"
      aria-labelledby="connect-title"
      className="dark rf-stage w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[980px] px-4 py-24 md:px-6 md:py-32">
        <div className="text-center">
          <h2 id="connect-title" className="rf-headline">
            Paste one line. Ask for a reel
          </h2>
          <p className="rf-muted max-w-measure mx-auto mt-5 text-lg text-pretty">
            Your server, your keys. Keys carry scopes (read, write, render,
            admin, owner), are stored hashed, and see only their own workspace.
          </p>
        </div>
        <div className="mt-12">{tabs}</div>
        <p className="mt-6 text-center text-sm">
          <Link href="/agents" className="rf-link inline-flex items-center">
            Every client, a prompt cookbook and all {toolCatalog.count} tools
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}

const ENGINES = [
  {
    name: 'Remotion',
    version: reels[0].versions.engines.remotion,
    template: 'kinetic-title',
    body: 'React components, rendered frame by frame.',
    fn: 1,
  },
  {
    name: 'Motion Canvas',
    version: reels[0].versions.engines['motion-canvas'],
    template: 'animated-explainer',
    body: 'Generator-based scenes, rendered without the editor by RenderWeld’s own headless harness.',
  },
  {
    name: 'HTML and CSS',
    version: null,
    template: 'html-title',
    body: 'Your agent can write the scene itself. Animations are seeked frame by frame in a browser sandbox with no network.',
  },
  {
    name: 'HyperFrames',
    version: reels[0].versions.engines.hyperframes?.replace(
      /^hyperframes /,
      ''
    ),
    template: 'hyperframes-title',
    body: 'Timeline compositions, rendered locally by the HyperFrames renderer with its telemetry switched off.',
  },
] as const;

export function Engines() {
  return (
    <section
      id="engines"
      aria-labelledby="engines-title"
      className="w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="max-w-[760px]">
          <h2 id="engines-title" className="rf-headline">
            Four engines. One timeline
          </h2>
          <p className="text-muted-foreground max-w-measure mt-5 text-lg text-pretty">
            Each scene names its engine. RenderWeld renders the clips and joins
            them with exact frame counts, so the timing your agent wrote is the
            timing you get.
          </p>
        </div>
        <ul className="mt-14 border-t">
          {ENGINES.map((engine) => (
            <li
              key={engine.name}
              className="grid gap-2 border-b py-6 md:grid-cols-[220px_minmax(0,1fr)_220px] md:gap-8 md:py-8"
            >
              <h3 className="text-xl font-medium tracking-tight">
                {engine.name}
                {'fn' in engine ? <Fn n={engine.fn} /> : null}
              </h3>
              <p className="text-muted-foreground max-w-measure text-pretty">
                {engine.body}
              </p>
              <p className="rf-receipt md:pt-1 md:text-right">
                {engine.template}
                {engine.version ? ` · v${engine.version}` : ''}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Real reels with the prompt that made each one: only those that meet the
 * gallery bar (studio issue #807). With none, the section is left out
 * rather than showing an empty rail.
 */
export function ReelGallery() {
  const shown = showcaseReels();
  if (shown.length === 0) return null;
  return (
    <section
      id="reels"
      aria-labelledby="reels-title"
      className="bg-muted/40 w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="max-w-[760px]">
            <h2 id="reels-title" className="rf-headline">
              Real renders. Nothing mocked up
            </h2>
            <p className="text-muted-foreground max-w-measure mt-5 text-lg text-pretty">
              Every clip here was rendered by RenderWeld over MCP. The prompt
              under it asks for the same reel: copy one and give it to your
              agent.
            </p>
          </div>
          <Link href="/gallery" className="rf-link inline-flex items-center">
            See all reels in the gallery
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="rf-rail mt-14 pb-4">
          {shown.map((reel, i) => (
            <li
              key={reel.slug}
              className="rf-reveal flex min-w-0 flex-col"
              style={{ '--i': i } as React.CSSProperties}
            >
              <div className="dark rf-stage relative aspect-[9/16] overflow-hidden rounded-2xl">
                <ReelVideo
                  sources={[reelSource(reel)]}
                  sizes={RAIL_SIZES}
                  className="rf-screen absolute inset-0"
                />
              </div>
              <h3 className="mt-4 font-medium">{reel.title}</h3>
              <p className="rf-receipt mt-1">
                {enginesOf(reel).join(' · ')} · {reel.output.durationSeconds} s
                · rendered in {reel.renderSeconds} s<Fn n={2} />
              </p>
              <p className="text-muted-foreground relative mt-3 flex-1 text-sm text-pretty">
                <span className="sr-only">Prompt: </span>
                {reel.prompt}
              </p>
              <CopyButton
                text={reel.prompt}
                label="Copy prompt"
                ariaLabel={`Copy prompt for the ${reel.title} reel`}
                goal="copy_reel_prompt"
                goalProps={{ reel: reel.slug }}
                className="mt-4 self-start"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Measured numbers, each with its conditions: a table, not a row of big
 * figures. All from docs/PERFORMANCE.md and docs/SCALE.md in the studio,
 * on a shared 4-vCPU test machine, so lower bounds.
 */
const MEASURED: { area: string; result: string; detail: string }[] = [
  {
    area: 'API traffic',
    result: '297 requests/s',
    detail:
      '200 keys, a full create, update, read and list mix; p99 426 ms, 0 errors',
  },
  {
    area: 'Renders under that traffic',
    result: '0 lost, 0 duplicated',
    detail: '550 render jobs on 50 workers; queue wait p99 637 ms',
  },
  {
    area: 'Queue throughput',
    result: '219 to 330 jobs/s',
    detail: 'picked up by 10 to 200 workers, each job exactly once',
  },
  {
    area: 'Deep queue',
    result: '2.9 ms per claim',
    detail:
      'database time with 20,000 jobs waiting on PostgreSQL 17, flat from 5,000',
  },
  {
    area: 'Overload',
    result: '0 errors',
    detail:
      'a burst of 5,000 renders: the excess refused with 503 and Retry-After',
  },
  {
    area: 'Memory per render',
    result: '772 MB',
    detail: 'peak at 1080×1920, 30 fps, 10 s; 1,643 MB at 3840×2160',
  },
];

export function NumbersBand() {
  return (
    <section
      id="measured"
      aria-labelledby="measured-title"
      className="w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-32">
        <div className="max-w-[760px]">
          <h2 id="measured-title" className="rf-headline">
            Measured, with the conditions
          </h2>
          <p className="text-muted-foreground max-w-measure mt-5 text-lg text-pretty">
            Load tests of the API, the job queue and the database around the
            renders. Lower bounds from a shared test machine, not a benchmark
            <Fn n={8} />.
          </p>
        </div>
        <table className="rf-measured mt-12 w-full">
          <caption className="sr-only">
            Measured load-test results and their conditions
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Area</th>
              <th scope="col">Result</th>
              <th scope="col">Conditions</th>
            </tr>
          </thead>
          <tbody>
            {MEASURED.map((row) => (
              <tr key={row.area}>
                <th scope="row">{row.area}</th>
                <td className="rf-measured-result">{row.result}</td>
                <td className="text-muted-foreground">{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-muted-foreground max-w-measure mt-6 text-sm text-pretty">
          Not measured yet: hundreds of workers rendering at the same time on
          cloud machines. Each render needs its own slot, so that run needs real
          hardware; it will be published here when it exists.
        </p>
      </div>
    </section>
  );
}

const STAYS = [
  'Projects, manifests, assets, renders and logs, in your data folder or your own bucket.',
  'API keys, stored as salted hashes. Provider keys, encrypted at rest.',
  'No telemetry, no update checks, no error reports from RenderWeld.',
  'Installations never talk to each other: no shared cache, relay or peer discovery.',
];
const LEAVES = [
  'The licence check: your key and a random instance id, at start and once a day.',
  'ElevenLabs, when you set its key and your agent asks for a voice. Speech-to-text with faster-whisper runs on your server.',
  'Web addresses you ask it to fetch: https only, private networks refused.',
  'Your storage bucket, database, queue, webhooks or OpenTelemetry collector, if you set one up.',
];

export function Privacy() {
  return (
    <section
      id="private"
      aria-labelledby="private-title"
      className="bg-muted/40 w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="max-w-[760px]">
          <h2 id="private-title" className="rf-headline">
            Your server. Your files. Your keys
          </h2>
          <p className="text-muted-foreground max-w-measure mt-5 text-lg text-pretty">
            Own the renderer instead of renting one: renders run on hardware you
            control, and nothing leaves it unless you set it up.
          </p>
        </div>
        <div className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {[
            { title: 'Stays on your server', items: STAYS, stays: true },
            {
              title: 'Leaves only when you set it up',
              items: LEAVES,
              stays: false,
            },
          ].map((col) => (
            <div key={col.title} className="border-t pt-6">
              <h3 className="text-xl font-medium tracking-tight">
                {col.title}
              </h3>
              <ul className="text-muted-foreground mt-4 space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    {col.stays ? (
                      <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <ArrowRight
                        className="mt-1 h-4 w-4 shrink-0"
                        aria-hidden
                      />
                    )}
                    <span className="max-w-measure text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-10 text-sm">
          Every connection the studio can make is listed in its{' '}
          <a
            href={`${siteConfig.repo.url}/blob/main/docs/PRIVACY.md`}
            className="rf-link underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            privacy and egress document
          </a>{' '}
          and its{' '}
          <a
            href={`${siteConfig.repo.url}/blob/main/docs/ISOLATION.md`}
            className="rf-link underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            isolation guarantees
          </a>
          .
        </p>
      </div>
    </section>
  );
}

/**
 * What the server does for the people who run it, as rows of a list (studio
 * docs/WORKSPACES.md, docs/public/install/dashboard.md, docs/PROVIDERS.md,
 * docs/cloud/overview.md, 2026-11-24). Short on purpose: every word here is
 * sent twice (HTML and RSC payload).
 */
const OPERATIONS: { title: string; detail: string; fn?: number }[] = [
  {
    title: 'Workspaces',
    detail:
      'Several teams or clients on one install. Each key sees only its own workspace, with its own limits.',
  },
  {
    title: 'Dashboard',
    detail:
      'Live job progress, analytics, the library with previews, settings and the audit log, served by the same install.',
  },
  {
    title: 'Storage and database',
    detail:
      'Local disk, S3-compatible, Google Cloud Storage or Azure Blob. SQLite, PostgreSQL, MySQL or MariaDB.',
    fn: 4,
  },
  {
    title: 'Queue and scaling',
    detail:
      'A job queue in your database, or PostgreSQL notify, Redis or SQS. API and worker roles, KEDA autoscaling on queue depth.',
  },
  {
    title: 'Any cloud',
    detail:
      'Guides for AWS, Google Cloud and Azure, and for DigitalOcean, Hetzner, Fly.io, Railway or any Kubernetes. Only the licence limits use.',
  },
  {
    title: 'Keys, audit and webhooks',
    detail:
      'Scopes, expiry, rotation, IP allowlists and quotas. An audit log of every write call; signed webhooks, Slack and email, with replay.',
  },
  {
    title: 'Logs, metrics and the image',
    detail:
      'JSON logs, Prometheus and OpenTelemetry. A non-root image with a read-only root, seccomp and an SBOM, for amd64 and arm64.',
  },
];

export function EnterpriseStrip() {
  return (
    <section
      id="operations"
      aria-labelledby="ops-title"
      className="w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-32">
        <h2 id="ops-title" className="rf-headline max-w-[760px]">
          Ready for the server room
        </h2>
        <dl className="mt-12 border-t">
          {OPERATIONS.map((item) => (
            <div
              key={item.title}
              className="grid gap-2 border-b py-5 md:grid-cols-[260px_minmax(0,1fr)] md:gap-8"
            >
              <dt className="font-medium">
                {item.title}
                {item.fn ? <Fn n={item.fn} /> : null}
              </dt>
              <dd className="text-muted-foreground max-w-measure text-pretty">
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-muted-foreground max-w-measure mt-8 text-sm text-pretty">
          Not shipped yet: rendering on serverless functions (Remotion Lambda),
          and AI image or video providers. They plug into the same provider
          interface as voice; none ships today.
        </p>
      </div>
    </section>
  );
}

export function FinalCta({ ctas }: { ctas: React.ReactNode }) {
  return (
    <section aria-labelledby="final-title" className="dark rf-stage w-full">
      <div className="mx-auto max-w-[980px] px-4 py-28 text-center md:px-6 md:py-40">
        <h2 id="final-title" className="rf-display">
          Give your agent a render server
        </h2>
        <p className="rf-muted max-w-measure mx-auto mt-6 text-lg text-pretty">
          Start with the free Personal licence. Move to Commercial when it
          starts earning.
        </p>
        <div className="mt-10">{ctas}</div>
        <p className="mt-6 text-sm">
          <Link href="/agents" className="rf-link inline-flex items-center">
            Connect your agent
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}

/** A file in the studio repository's docs folder, on `main`. */
function DocLink({ path }: { path: string }) {
  return (
    <a
      href={`${siteConfig.repo.url}/blob/main/docs/${path}`}
      className="underline"
    >
      docs/{path}
    </a>
  );
}

export function Footnotes() {
  const reel = reels[0];
  const notes: React.ReactNode[] = [
    <>
      No per-video fees to RenderWeld. Remotion requires its own licence for
      companies of more than 3 people (
      <a href="https://www.remotion.dev/license" className="underline">
        remotion.dev/license
      </a>
      ), and a voice provider you set up bills you directly. Motion Canvas, HTML
      and HyperFrames scenes carry no Remotion fee.
    </>,
    <>
      Render times are the wall-clock time in each render&apos;s
      render-manifest.json, one run each on {reel.renderedAt.slice(0, 10)}:
      RenderWeld {reel.versions.studio} (pre-release build),{' '}
      {hardwareLabel(reel)}, FFmpeg {reel.versions.ffmpeg},{' '}
      {reel.versions.browser}. They vary: a second run of the same three reels
      on the same machine took 60.2 s, 37.3 s and 29.4 s while other work shared
      it. Not a benchmark.
    </>,
    <>
      Counted from {toolCatalogSource()}. The studio&apos;s parity test fails if
      a REST route has no MCP tool.
    </>,
    <>
      Storage: local disk in CI; S3-compatible storage on MinIO, Azure Blob on
      Azurite and Google Cloud Storage on fake-gcs-server, by hand. AWS S3,
      Google Cloud Storage, Azure Blob and R2 themselves are documented, not
      tested yet. Databases: SQLite, PostgreSQL 17 and MySQL 8.4 in CI; MariaDB
      documented (<DocLink path="cloud/overview.md" />
      ).
    </>,
    <>
      In the studio&apos;s Docker test (2026-11-21), headless Claude Code made
      an 18-second, four-engine reel over MCP only, with no other docs. Codex:
      its config is checked, but no Codex agent run is recorded yet.
    </>,
    <>
      Docker on Linux, tested on x64 and arm64. macOS and Windows are not tested
      yet. The commands follow the studio&apos;s quick start (
      <DocLink path="public/start/quick-start.md" />
      ).
    </>,
    <>
      <DocLink path="public/manifest/formats.md" /> and{' '}
      <DocLink path="public/manifest/v0-2.md" /> (variants). The contact sheets
      in docs/proofs/formats were rendered at 16:9, 1:1, 4:5, 9:16 and 4K and
      checked for overflow on their pixels; every engine renders each frame
      rate, and the finished file&apos;s rate is checked with ffprobe (
      <DocLink path="STATUS.md" />
      ). Captions: <DocLink path="CAPTIONS.md" />.
    </>,
    <>
      <DocLink path="PERFORMANCE.md" /> (2026-11-22) and{' '}
      <DocLink path="SCALE.md" /> (2026-11-23): one 4-vCPU container shared with
      other workloads, so every number is a lower bound and timings are noisy.
      The run on dedicated hardware is defined there and not measured yet.
    </>,
  ];
  return (
    <section aria-labelledby="footnotes-title" className="w-full border-t">
      <div className="mx-auto max-w-[980px] px-4 py-12 md:px-6">
        <h2 id="footnotes-title" className="text-sm font-medium">
          Notes
        </h2>
        <ol className="text-muted-foreground max-w-measure mt-4 list-decimal space-y-2 pl-5 text-xs leading-relaxed">
          {notes.map((note, i) => (
            <li
              key={i}
              id={`fn-${i + 1}`}
              className="scroll-mt-[calc(var(--header-h)+1rem)]"
            >
              {note}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

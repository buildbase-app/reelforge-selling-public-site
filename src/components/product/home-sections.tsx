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
import { CopyButton } from './copy-button';
import { ReelVideo, type ReelSource } from './reel-video';
import './product.css';

/**
 * The homepage's product story (studio issue #44, SITE_PLAN §B.2): one idea
 * per section, real reels, footnotes on every number. Server components; the
 * only client islands are the reel player, the copy buttons, the agent tabs
 * and the store's own price and CTA components. English only for now
 * (src/i18n/config.ts), so the copy lives here, together, for translation.
 *
 * Every claim is true for ReelForge Studio 0.1.0 on 2026-11-21 (studio
 * docs/STATUS.md, docs/PRIVACY.md); every number comes from
 * src/data/*.json or has a footnote saying where it comes from.
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
    label: `Silent ${reel.output.durationSeconds}-second reel rendered by ReelForge. On screen: ${reel.scenes
      .map((s) => s.text)
      .filter(Boolean)
      .join(' / ')}`,
  };
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
  base: '/walkthroughs/agent-session.4cc6d476',
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
  label: `Silent ${DEMO.seconds}-second replay of a recorded session: Claude Code is asked to ${DEMO.prompt}, calls the ReelForge MCP tools to create, check and render the project, and the finished reel plays on the right.`,
};

/** Hero: the promise, the buttons, and a real agent session in a window. */
export function Hero({
  heading,
  ctas,
}: {
  heading: React.ReactNode;
  ctas: React.ReactNode;
}) {
  const duration = `0:${String(DEMO.seconds).padStart(2, '0')}`;
  return (
    <section
      id="overview"
      aria-labelledby="hero-title"
      className="dark rf-stage rf-wash w-full scroll-mt-(--header-h) overflow-hidden"
      data-parallax=""
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-4 pt-16 pb-24 md:px-6 md:pt-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12 lg:pb-32">
        <div className="text-center lg:text-left">
          <p className="rf-eyebrow rf-fade-up">
            Source-available · Self-hosted · Driven over MCP
          </p>
          <h1 id="hero-title" className="rf-display rf-fade-up mt-4">
            {heading}
          </h1>
          <p className="rf-muted rf-fade-up-2 mx-auto mt-6 max-w-[34rem] text-lg leading-relaxed text-pretty md:text-xl lg:mx-0">
            Ask your AI agent for a reel. It plans every scene over MCP or REST;
            ReelForge renders it on your own machine into one vertical MP4.
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
          <div className="rf-fade-up-2 mt-8 lg:[&>div]:justify-start">
            {ctas}
          </div>
          <p className="rf-muted mt-6 text-sm">
            Free for personal use · One-time Commercial licence · No per-video
            fees to ReelForge
            <Fn n={1} />
          </p>
        </div>
        <figure className="rf-par-near min-w-0">
          <div className="rf-window rf-demo">
            <div className="rf-demo-bar border-b border-white/10">
              <span className="rf-receipt truncate">
                claude-code → reelforge · agent-session.mp4
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
                prompt → MCP calls → checked MP4
              </span>
              <span className="rf-receipt shrink-0">silent</span>
            </div>
          </div>
          <figcaption className="rf-receipt mt-4 text-center lg:text-left">
            A replay of a recorded session on 2026-11-21: the real prompt, tool
            calls, results and reel, with the waits shortened.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/**
 * Frames from 16 gallery reels the studio rendered (`public/reels/marquee`,
 * 288×512 WebP, about 4 KB each), in two rows that drift in opposite
 * directions.
 */
const MARQUEE = [
  [
    'city-cycling-growth',
    'colour-palette-tour',
    'air-squat-form-tip',
    'lumen-desk-lamp-launch',
    'election-turnout-explainer',
    'city-weekend-guide',
    'podcast-founder-stories',
    'sheet-pan-tacos',
  ],
  [
    'generative-brand-loop',
    'habitloop-app-promo',
    'charity-run-event',
    'packing-light-checklist',
    'remote-work-data-story',
    'pay-yourself-first',
    'studio-apartment-rent',
    'small-steps-daily',
  ],
];

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

/** The light card: real reel posters drifting past, and what ReelForge is. */
export function ReelMarquee() {
  return (
    <section
      aria-labelledby="made-title"
      className="dark rf-stage rf-wash rf-marquee-band w-full"
    >
      <div className="mx-auto max-w-[1200px] px-4 pb-24 md:px-6 md:pb-32">
        <div className="rf-paper overflow-hidden py-6 md:py-8">
          <div aria-hidden="true">
            <MarqueeRow slugs={MARQUEE[0]} />
          </div>
          <div className="mx-auto max-w-[760px] px-6 py-10 text-center md:py-14">
            <h2 id="made-title" className="rf-headline">
              Every poster here is a real render
            </h2>
            <p className="rf-muted mx-auto mt-4 max-w-[56ch] text-lg text-pretty">
              Frames from reels in the gallery. A script sent each manifest to
              ReelForge Studio over MCP, the way your agent would, and the
              studio rendered it.
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
              <span aria-hidden="true" className="rf-muted px-1">
                →
              </span>
              <p className="rf-is">
                <span className="sr-only">But this: </span>
                <Check className="h-4 w-4" aria-hidden />A studio on your own
                server
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
            <MarqueeRow slugs={MARQUEE[1]} reverse />
          </div>
        </div>
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
      className="dark rf-stage rf-wash w-full scroll-mt-(--header-h) border-t border-white/10"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="rf-reveal mx-auto max-w-[980px] text-center">
          <p className="rf-eyebrow">Your agent is the editor</p>
          <h2 id="agent-title" className="rf-headline mt-3">
            One prompt in. A checked MP4 out
          </h2>
          <p className="rf-muted mx-auto mt-5 max-w-[60ch] text-lg text-pretty">
            The agent reads what the studio can do, writes the scenes, checks
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
                <span>
                  <span className="rf-muted" aria-hidden>
                    →
                  </span>{' '}
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
        <p className="rf-muted mx-auto mt-10 max-w-[70ch] text-center text-xs leading-relaxed">
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
    title: 'Run the studio',
    body: 'One Docker image with FFmpeg and a headless browser inside, on your computer or a server you run. Keep the first admin key it prints.',
    code: `git clone ${siteConfig.repo.url}
cd reelforge-studio
export REELFORGE_BOOTSTRAP_KEY=rf_$(openssl rand -hex 24)
docker compose up -d --build`,
    fn: 6,
  },
  {
    title: 'Add your licence key',
    body: 'Claim the free Personal key, or buy a Commercial key, on this site. The studio checks it once a day and keeps rendering offline for 14 days.',
    code: `docker compose exec reelforge reelforge licence activate YOUR-KEY
docker compose restart reelforge`,
  },
  {
    title: 'Connect your agent',
    body: 'Give your agent the MCP address and a key, then ask for a reel. Or call the REST API from a script.',
    code: `claude mcp add --transport http reelforge http://127.0.0.1:4321/mcp \\
  --header "Authorization: Bearer $REELFORGE_KEY"`,
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
          <p className="rf-eyebrow">How it works</p>
          <h2 id="how-title" className="rf-headline mt-3">
            Three steps to your first reel
          </h2>
          <p className="text-muted-foreground mt-5 max-w-[46ch] text-lg text-pretty">
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
                      <span className="rf-receipt mr-3">0{i + 1}</span>
                      {step.title}
                    </span>
                    <span
                      className="rf-how-on col-start-1 row-start-1"
                      aria-hidden
                    >
                      <span className="rf-receipt mr-3">0{i + 1}</span>
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
              className="rf-reveal scroll-mt-[calc(var(--header-h)+1rem)]"
            >
              <p className="rf-receipt">Step 0{i + 1}</p>
              <h3 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">
                {step.title}
                {'fn' in step ? <Fn n={step.fn} /> : null}
              </h3>
              <p className="text-muted-foreground mt-3 max-w-[52ch] text-pretty">
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
      className="dark rf-stage rf-wash w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[980px] px-4 py-24 md:px-6 md:py-32">
        <div className="rf-reveal text-center">
          <p className="rf-eyebrow">Connect your agent</p>
          <h2 id="connect-title" className="rf-headline mt-3">
            Paste one line. Ask for a reel
          </h2>
          <p className="rf-muted mx-auto mt-5 max-w-[60ch] text-lg text-pretty">
            Your instance, your keys. Keys carry scopes (read, write, render,
            admin) and are stored hashed.
          </p>
        </div>
        <div className="rf-reveal mt-12">{tabs}</div>
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
    body: 'Generator-based scenes, rendered without the editor by ReelForge’s own headless harness.',
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
        <div className="rf-reveal mx-auto max-w-[980px] text-center">
          <p className="rf-eyebrow">Engines</p>
          <h2 id="engines-title" className="rf-headline mt-3">
            Four engines. One MP4
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-[60ch] text-lg text-pretty">
            Each scene names its engine. ReelForge renders the clips and joins
            them with exact frame counts, so the timing your agent wrote is the
            timing you get.
          </p>
        </div>
        <ul className="mx-auto mt-14 max-w-[980px] border-t">
          {ENGINES.map((engine) => (
            <li
              key={engine.name}
              className="rf-reveal grid gap-2 border-b py-6 md:grid-cols-[220px_minmax(0,1fr)_200px] md:gap-8 md:py-8"
            >
              <h3 className="text-xl font-medium tracking-tight">
                {engine.name}
                {'fn' in engine ? <Fn n={engine.fn} /> : null}
              </h3>
              <p className="text-muted-foreground text-pretty">{engine.body}</p>
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

/** Real reels with the prompt that made each one. */
export function ReelGallery() {
  return (
    <section
      id="reels"
      aria-labelledby="reels-title"
      className="bg-muted/40 w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="rf-reveal mx-auto max-w-[980px] text-center">
          <p className="rf-eyebrow">Made with ReelForge</p>
          <h2 id="reels-title" className="rf-headline mt-3">
            Real renders. Nothing mocked up
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-[60ch] text-lg text-pretty">
            Every clip here was rendered by the studio over MCP. The prompt
            under it asks for the same reel: copy one and give it to your agent.
          </p>
          <Link
            href="/gallery"
            className="rf-link mt-5 inline-flex items-center"
          >
            See all reels in the gallery
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="rf-rail mt-14 pb-4">
          {reels.map((reel, i) => (
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
              <blockquote className="text-muted-foreground mt-3 flex-1 border-l-2 pl-3 text-sm text-pretty">
                {reel.prompt}
              </blockquote>
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
 * Proof tiles: four real numbers, each with where it comes from. No
 * count-up animation, no social numbers.
 */
export function NumbersBand() {
  const tips = getReel('hook-tips');
  const commit = toolCatalog.source.commit?.slice(0, 7);
  const facts = [
    {
      value: '4',
      label: 'engines in one reel',
      source: 'the agent-directs reel above, one scene per engine',
      fn: undefined,
    },
    {
      value: String(toolCatalog.count),
      label: 'MCP tools. Every REST route has one.',
      source: `studio ${toolCatalog.source.reference ?? 'tools/list'}${commit ? ` @ ${commit}` : ''}`,
      fn: 3,
    },
    {
      value: `${tips.output.width}×${tips.output.height}`,
      label: `${tips.output.fps} fps, H.264 + AAC, checked with ffprobe and a full decode`,
      source: 'render-manifest.json of the tips reel',
      fn: undefined,
    },
    {
      value: `${tips.renderSeconds} s`,
      label: `to render the ${tips.output.durationSeconds}-second tips reel above`,
      source: 'render-manifest.json, wall clock',
      fn: 2,
    },
  ];
  return (
    <section aria-label="ReelForge in numbers" className="w-full">
      <dl className="mx-auto grid max-w-[1200px] gap-4 px-4 py-20 sm:grid-cols-2 md:px-6 lg:grid-cols-[1fr_1fr_1.4fr_1fr]">
        {facts.map((f) => (
          <div key={f.label} className="rf-reveal rf-card flex flex-col">
            <dt className="order-2 mt-3 text-sm text-pretty">
              {f.label}
              {f.fn ? <Fn n={f.fn} /> : null}
              <span className="rf-receipt mt-3 block">Source: {f.source}</span>
            </dt>
            <dd className="order-1 text-[clamp(2.25rem,3.2vw,3rem)] leading-none font-medium tracking-tight tabular-nums">
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const STAYS = [
  'Projects, manifests, assets, renders and logs, in your data folder or your own bucket.',
  'API keys, stored as salted hashes. Provider keys, encrypted at rest.',
  'No telemetry, no update checks, no error reports from ReelForge.',
];
const LEAVES = [
  'The licence check: your key and a random instance id, at start and once a day.',
  'Your voice provider, when you set its key and your agent asks for a voice.',
  'Web addresses you ask it to fetch: https only, private networks refused.',
  'Your storage bucket or OpenTelemetry collector, if you set one up.',
];

export function Privacy() {
  return (
    <section
      id="private"
      aria-labelledby="private-title"
      className="w-full scroll-mt-(--header-h)"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="rf-reveal mx-auto max-w-[980px] text-center">
          <p className="rf-eyebrow">Self-hosted and private</p>
          <h2 id="private-title" className="rf-headline mt-3">
            Your server. Your files. Your keys
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-[60ch] text-lg text-pretty">
            Own the studio instead of renting one: renders run on hardware you
            control, and nothing leaves it unless you set it up.
          </p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {[
            { title: 'Stays on your machine', items: STAYS, stays: true },
            {
              title: 'Leaves only when you set it up',
              items: LEAVES,
              stays: false,
            },
          ].map((col) => (
            <div
              key={col.title}
              className="rf-reveal bg-card rounded-2xl border p-6 shadow-[var(--shadow-sm)] md:p-8"
            >
              <h3 className="text-xl font-medium tracking-tight">
                {col.title}
              </h3>
              <ul className="text-muted-foreground mt-4 space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    {col.stays ? (
                      <Check
                        className="text-success mt-1 h-4 w-4 shrink-0"
                        aria-hidden
                      />
                    ) : (
                      <span
                        className="bg-muted-foreground mx-1 mt-2 h-2 w-2 shrink-0 rounded-full"
                        aria-hidden
                      />
                    )}
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Every connection the studio can make is listed in its{' '}
          <a
            href={`${siteConfig.repo.url}/blob/main/docs/PRIVACY.md`}
            className="rf-link underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            privacy and egress document
          </a>
          .
        </p>
      </div>
    </section>
  );
}

/**
 * What the studio does for the people who run it, as feature cards with the
 * concrete capabilities (studio README "What works today", 2026-11-23). The
 * green tick means "works today"; planned work is listed apart. Short on
 * purpose: every word here is sent twice (HTML and RSC payload).
 */
const ENTERPRISE: { title: string; tags: string[]; fn?: number }[] = [
  {
    title: 'A job queue in your database',
    tags: [
      'api and worker roles',
      'job priorities',
      'fan-out over workers',
      'KEDA autoscaling',
    ],
  },
  {
    title: 'Your database, your storage',
    tags: ['SQLite', 'PostgreSQL', 'MySQL', 'S3-compatible', 'Azure', 'GCS'],
    fn: 4,
  },
  {
    title: 'Keys you can hand to an agent',
    tags: ['scopes', 'expiry', 'rotation', 'IP allowlists', 'quotas'],
  },
  {
    title: 'An audit log and webhooks',
    tags: ['every write call', 'signed webhooks', 'Slack', 'email', 'replay'],
  },
  {
    title: 'Logs, metrics and traces',
    tags: ['JSON logs', 'Prometheus', 'OpenTelemetry'],
  },
  {
    title: 'A hardened image',
    tags: ['non-root', 'read-only root', 'seccomp', 'SBOM', 'arm64'],
  },
];

export function EnterpriseStrip() {
  return (
    <section aria-labelledby="ops-title" className="w-full border-y">
      <div className="mx-auto max-w-[1200px] px-4 py-20 md:px-6 md:py-28">
        <h2
          id="ops-title"
          className="rf-reveal text-2xl font-medium tracking-tight md:text-3xl"
        >
          Ready for the server room
        </h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ENTERPRISE.map((item) => (
            <li key={item.title} className="rf-reveal rf-card">
              <h3 className="flex items-center gap-2 font-medium">
                <Check className="text-success h-4 w-4" aria-hidden />
                {item.title}
                {item.fn ? <Fn n={item.fn} /> : null}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <li key={tag} className="rf-tag">
                    {tag}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-8 flex items-start gap-2 text-sm">
          <span
            className="bg-warning mt-1.5 h-2 w-2 shrink-0 rounded-full"
            aria-hidden
          />
          <span>
            Planned, not shipped: signed images (the signing step runs once
            release publishing starts) and rendering on your own AWS account
            with Remotion Lambda.
          </span>
        </p>
      </div>
    </section>
  );
}

export function FinalCta({ ctas }: { ctas: React.ReactNode }) {
  return (
    <section
      aria-labelledby="final-title"
      className="dark rf-stage rf-wash w-full"
    >
      <div className="rf-reveal mx-auto max-w-[980px] px-4 py-28 text-center md:px-6 md:py-40">
        <h2 id="final-title" className="rf-display">
          Give your agent a studio
        </h2>
        <p className="rf-muted mx-auto mt-6 max-w-[48ch] text-lg text-pretty">
          Start with the free Personal licence. Upgrade to Commercial when it
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

export function Footnotes() {
  const reel = reels[0];
  const notes: React.ReactNode[] = [
    <>
      No per-video fees to ReelForge. Remotion requires its own licence for
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
      ReelForge Studio {reel.versions.studio} (development build, licence check
      off), {hardwareLabel(reel)}, FFmpeg {reel.versions.ffmpeg},{' '}
      {reel.versions.browser}. They vary: a second run of the same three reels
      on the same machine took 60.2 s, 37.3 s and 29.4 s while other work shared
      it. Not a benchmark.
    </>,
    <>
      Counted from {toolCatalogSource()}. The studio&apos;s parity test fails if
      a REST route has no MCP tool.
    </>,
    <>
      S3-compatible storage is tested with MinIO; Azure Blob and Google Cloud
      Storage on their emulators. AWS S3, Cloudflare R2 and other providers are
      not tested yet.
    </>,
    <>
      In the studio&apos;s Docker test (2026-11-21), headless Claude Code made
      an 18-second, four-engine reel over MCP only, with no other docs. Codex:
      its config is checked, but no Codex agent run is recorded yet.
    </>,
    <>
      Docker on Linux, tested on x64 and arm64. macOS and Windows are not tested
      yet.
    </>,
  ];
  return (
    <section aria-labelledby="footnotes-title" className="w-full border-t">
      <div className="mx-auto max-w-[980px] px-4 py-12 md:px-6">
        <h2 id="footnotes-title" className="text-sm font-medium">
          Notes
        </h2>
        <ol className="text-muted-foreground mt-4 list-decimal space-y-2 pl-5 text-xs leading-relaxed">
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

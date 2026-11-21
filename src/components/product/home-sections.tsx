import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { siteConfig } from '@/config/site';
import {
  enginesOf,
  getReel,
  hardwareLabel,
  reels,
  toolCatalog,
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
    label: `Silent ${reel.output.durationSeconds}-second reel rendered by ReelForge. On screen: ${reel.scenes
      .map((s) => s.text)
      .filter(Boolean)
      .join(' / ')}`,
  };
}

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
      <ReelVideo sources={sources} priority={priority} className="rf-screen" />
    </div>
  );
}

const SECTIONS = [
  { id: 'agent', label: 'The agent' },
  { id: 'how', label: 'How it works' },
  { id: 'engines', label: 'Engines' },
  { id: 'reels', label: 'Reels' },
  { id: 'private', label: 'Self-hosted' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
] as const;

/** Where the page's main button goes, from the server's read of the store. */
function primaryCta(onSale: boolean | undefined) {
  if (onSale === true) return { href: '/pricing', label: 'Get ReelForge' };
  if (onSale === false)
    return { href: '/waitlist', label: 'Join the waitlist' };
  return { href: '/pricing', label: 'See pricing' };
}

/** Sticky product sub-nav under the site header. */
export function LocalNav({ onSale }: { onSale?: boolean }) {
  const cta = primaryCta(onSale);
  return (
    <nav
      aria-label="ReelForge product"
      className="rf-local-nav sticky top-[69px] z-40 w-full border-b"
    >
      <div className="mx-auto flex h-12 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
        <a href="#overview" className="text-sm font-semibold">
          ReelForge Studio
        </a>
        <ul className="hidden items-center gap-5 text-xs lg:flex">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-muted-foreground hover:text-foreground"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Link
            href="/agents"
            className="rf-link hidden text-xs sm:inline-flex sm:items-center"
          >
            Connect your agent
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            href={cta.href}
            className="rf-pill rf-pill-sm"
            data-bb-goal="primary_cta"
            data-bb-goal-section="local-nav"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </nav>
  );
}

/** Hero: the promise, the buttons, and the three real reels in a phone. */
export function Hero({
  heading,
  ctas,
}: {
  heading: React.ReactNode;
  ctas: React.ReactNode;
}) {
  return (
    <section
      id="overview"
      aria-labelledby="hero-title"
      className="dark rf-stage w-full scroll-mt-28 overflow-hidden"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-4 pt-16 pb-20 md:px-6 md:pt-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:pb-28">
        <div className="text-center lg:text-left">
          <p className="rf-eyebrow rf-fade-up">
            Source-available · Self-hosted · Driven over MCP
          </p>
          <h1 id="hero-title" className="rf-display rf-fade-up mt-4">
            {heading}
          </h1>
          <p className="rf-muted rf-fade-up-2 mx-auto mt-6 max-w-[34rem] text-lg leading-relaxed text-pretty md:text-xl lg:mx-0">
            Ask your AI agent for a reel. It plans every scene and its timing
            over MCP or REST; ReelForge renders it on your own machine into one
            vertical MP4.
          </p>
          <div className="rf-fade-up-2 mt-8 lg:[&>div]:justify-start">
            {ctas}
          </div>
          <p className="rf-muted mt-5 text-sm">
            Free for personal use · One-time Commercial licence · No per-video
            fees to ReelForge
            <Fn n={1} />
          </p>
        </div>
        <figure className="flex flex-col items-center">
          <Phone
            sources={reels.map(reelSource)}
            priority
            className="rf-phone-in"
          />
          <figcaption className="rf-muted mt-5 max-w-[300px] text-center text-xs leading-relaxed">
            Three reels made with ReelForge Studio {reels[0].versions.studio}{' '}
            from the prompts further down
            <Fn n={2} />.
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
      className="dark rf-stage w-full scroll-mt-28 border-t border-white/10"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="rf-reveal mx-auto max-w-[980px] text-center">
          <p className="rf-eyebrow">Your agent is the editor</p>
          <h2 id="agent-title" className="rf-headline mt-3">
            One prompt in. A checked MP4 out.
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
              <span className="rf-eyebrow block text-xs">Prompt</span>
              {reel.prompt}
            </li>
            {reel.toolCalls.map((call, i) => (
              <li
                key={`${call.tool}-${i}`}
                className="rf-step flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/5 py-2 last:border-0"
                style={{ '--i': i + 1 } as React.CSSProperties}
              >
                <span>
                  <span className="text-[#00d1b2]">→</span> {call.tool}
                </span>
                <span className="text-xs text-[#c9c9d6]">
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
            <figcaption className="rf-muted mt-4 max-w-[300px] text-center text-xs leading-relaxed">
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
      className="w-full scroll-mt-28"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-4 py-24 md:px-6 md:py-36 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <p className="rf-eyebrow">How it works</p>
          <h2 id="how-title" className="rf-headline mt-3">
            Three steps to your first reel.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-[46ch] text-lg text-pretty">
            Everything after the first key happens from your agent: projects,
            renders, more keys, settings.
          </p>
        </div>
        <ol className="space-y-16 lg:space-y-28">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rf-reveal">
              <p className="text-muted-foreground font-mono text-sm">
                Step {i + 1}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
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
                <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
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
      className="dark rf-stage w-full scroll-mt-28"
    >
      <div className="mx-auto max-w-[980px] px-4 py-24 md:px-6 md:py-32">
        <div className="rf-reveal text-center">
          <p className="rf-eyebrow">Connect your agent</p>
          <h2 id="connect-title" className="rf-headline mt-3">
            Paste one line. Ask for a reel.
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
      className="w-full scroll-mt-28"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="rf-reveal mx-auto max-w-[980px] text-center">
          <p className="rf-eyebrow">Engines</p>
          <h2 id="engines-title" className="rf-headline mt-3">
            Four engines. One MP4.
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-[60ch] text-lg text-pretty">
            Each scene names its engine. ReelForge renders the clips and joins
            them with exact frame counts, so the timing your agent wrote is the
            timing you get.
          </p>
        </div>
        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {ENGINES.map((engine) => (
            <li
              key={engine.name}
              className="rf-reveal bg-card rounded-2xl border p-6 md:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">
                  {engine.name}
                  {'fn' in engine ? <Fn n={engine.fn} /> : null}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#00d1b2]/40 px-2.5 py-0.5 text-xs font-medium text-[#00796b] dark:text-[#00d1b2]">
                  <Check className="h-3 w-3" aria-hidden />
                  Included
                </span>
              </div>
              <p className="text-muted-foreground mt-3 text-pretty">
                {engine.body}
              </p>
              <p className="text-muted-foreground mt-4 font-mono text-xs">
                template {engine.template}
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
      className="bg-muted/40 w-full scroll-mt-28"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="rf-reveal mx-auto max-w-[980px] text-center">
          <p className="rf-eyebrow">Made with ReelForge</p>
          <h2 id="reels-title" className="rf-headline mt-3">
            Real renders. Nothing mocked up.
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-[60ch] text-lg text-pretty">
            Every clip here came out of the studio from the prompt under it.
            Copy one and give it to your agent.
          </p>
        </div>
        <ul className="rf-rail mt-14 pb-4">
          {reels.map((reel) => (
            <li key={reel.slug} className="flex min-w-0 flex-col">
              <div className="dark rf-stage relative aspect-[9/16] overflow-hidden rounded-2xl">
                <ReelVideo
                  sources={[reelSource(reel)]}
                  className="rf-screen absolute inset-0"
                />
              </div>
              <h3 className="mt-4 font-semibold">{reel.title}</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                {enginesOf(reel).join(' · ')} · {reel.output.durationSeconds} s
                · rendered in {reel.renderSeconds} s<Fn n={2} />
              </p>
              <blockquote className="text-muted-foreground mt-3 flex-1 border-l-2 pl-3 text-sm text-pretty">
                {reel.prompt}
              </blockquote>
              <CopyButton
                text={reel.prompt}
                label="Copy prompt"
                ariaLabel={`Copy the prompt for the ${reel.title} reel`}
                goal="copy_reel_prompt"
                goalProps={{ reel: reel.slug }}
                className="text-foreground mt-4 self-start border-current/20 hover:bg-current/5"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Four facts, each with its footnote. No count-up animation. */
export function NumbersBand() {
  const tips = getReel('hook-tips');
  const facts = [
    { value: '4', label: 'engines in one reel', fn: undefined },
    {
      value: String(toolCatalog.count),
      label: 'MCP tools. Every REST route has one.',
      fn: 3,
    },
    {
      value: `${tips.output.width}×${tips.output.height}`,
      label: `${tips.output.fps} fps, H.264 + AAC, checked with ffprobe and a full decode`,
      fn: undefined,
    },
    {
      value: `${tips.renderSeconds} s`,
      label: `to render the ${tips.output.durationSeconds}-second tips reel above`,
      fn: 2,
    },
  ];
  return (
    <section aria-label="ReelForge in numbers" className="w-full">
      <dl className="mx-auto grid max-w-[1200px] gap-10 px-4 py-20 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="rf-reveal flex flex-col">
            <dt className="text-muted-foreground order-2 mt-2 text-sm text-pretty">
              {f.label}
              {f.fn ? <Fn n={f.fn} /> : null}
            </dt>
            <dd className="order-1 text-[clamp(2.5rem,4.2vw,3.5rem)] font-semibold tracking-tight tabular-nums">
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
      className="w-full scroll-mt-28"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-24 md:px-6 md:py-36">
        <div className="rf-reveal mx-auto max-w-[980px] text-center">
          <p className="rf-eyebrow">Self-hosted and private</p>
          <h2 id="private-title" className="rf-headline mt-3">
            Your server. Your files. Your keys.
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-[60ch] text-lg text-pretty">
            Own the studio instead of renting one: renders run on hardware you
            control, and nothing leaves it unless you set it up.
          </p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {[
            { title: 'Stays on your machine', items: STAYS },
            { title: 'Leaves only when you set it up', items: LEAVES },
          ].map((col) => (
            <div
              key={col.title}
              className="rf-reveal bg-card rounded-2xl border p-6 md:p-8"
            >
              <h3 className="text-xl font-semibold">{col.title}</h3>
              <ul className="text-muted-foreground mt-4 space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-[#00796b] dark:text-[#00d1b2]"
                      aria-hidden
                    />
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

const ENTERPRISE = [
  {
    title: 'Databases',
    body: 'SQLite by default. PostgreSQL or MySQL/MariaDB with one URL.',
  },
  {
    title: 'Storage',
    body: 'Local disk, S3-compatible, Azure Blob or Google Cloud Storage, with retention.',
    fn: 4,
  },
  {
    title: 'Observability',
    body: 'JSON logs, Prometheus /metrics, OpenTelemetry traces, logs and metrics.',
  },
  {
    title: 'Audit log',
    body: 'Every write and admin call over REST, MCP and the CLI. Export as JSONL or CSV.',
  },
  {
    title: 'API keys',
    body: 'Scopes, expiry, rotation with a grace window, IP allowlists, rate limits and render quotas.',
  },
  {
    title: 'Hardened image',
    body: 'Non-root, read-only root filesystem, no Linux capabilities, a seccomp profile and an SBOM.',
  },
];

export function EnterpriseStrip() {
  return (
    <section aria-labelledby="ops-title" className="w-full border-y">
      <div className="mx-auto max-w-[1200px] px-4 py-20 md:px-6">
        <h2
          id="ops-title"
          className="rf-reveal text-2xl font-semibold tracking-tight md:text-3xl"
        >
          Ready for the server room.
        </h2>
        <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {ENTERPRISE.map((item) => (
            <li key={item.title} className="rf-reveal">
              <h3 className="font-semibold">
                {item.title}
                {item.fn ? <Fn n={item.fn} /> : null}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm text-pretty">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-10 text-xs">
          Planned, not shipped: signed images (the signing step runs once
          release publishing starts) and rendering on your own AWS account with
          Remotion Lambda.
        </p>
      </div>
    </section>
  );
}

export function FinalCta({ ctas }: { ctas: React.ReactNode }) {
  return (
    <section
      aria-labelledby="final-title"
      className="dark rf-stage relative w-full overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_100%,rgb(255_61_113/0.22),transparent)]"
      />
      <div className="relative mx-auto max-w-[980px] px-4 py-28 text-center md:px-6 md:py-40">
        <h2 id="final-title" className="rf-display">
          Give your agent a studio.
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
      Counted from the studio&apos;s own MCP <code>tools/list</code> (ReelForge
      Studio {toolCatalog.source.version}, {toolCatalog.source.fetchedOn}). The
      studio&apos;s parity test fails if a REST route has no MCP tool.
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
        <h2 id="footnotes-title" className="text-sm font-semibold">
          Notes
        </h2>
        <ol className="text-muted-foreground mt-4 list-decimal space-y-2 pl-5 text-xs leading-relaxed">
          {notes.map((note, i) => (
            <li key={i} id={`fn-${i + 1}`} className="scroll-mt-32">
              {note}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

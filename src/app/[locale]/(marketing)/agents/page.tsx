import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ChevronRight } from 'lucide-react';
import { FaqSection } from '@/components/help/faq-section';
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/json-ld';
import { AgentTabs } from '@/components/product/agent-tabs';
import { CopyButton } from '@/components/product/copy-button';
import { ReelVideo } from '@/components/product/reel-video';
import { Fn, reelSource } from '@/components/product/home-sections';
import { absoluteUrl } from '@/config/seo';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/config';
import {
  collapsedCalls,
  enginesOf,
  hardwareLabel,
  reels,
  toolCatalog,
  toolCatalogSource,
} from '@/lib/agents/catalog';
import { AGENT_CLIENTS, KEY_SCOPES } from '@/lib/agents/snippets';
import { FontPreload, GEIST_MONO_CORE_URL } from '@/lib/fonts';
import { getFaqSection } from '@/lib/platform/faqs';
import { buildMarketingMetadata } from '@/lib/seo/marketing-metadata';
import '@/components/product/product.css';

interface AgentsPageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

const TITLE = 'Connect your agent to ReelForge: Claude Code, Codex, MCP, REST';
const DESCRIPTION = `Connect Claude Code, Codex or any MCP client to your self-hosted ReelForge Studio. Copyable configs, a prompt cookbook and all ${toolCatalog.count} MCP tools, grouped by job.`;

export async function generateMetadata({
  params,
}: AgentsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMarketingMetadata({
    path: '/agents',
    locale: locale as Locale,
    title: TITLE,
    description: DESCRIPTION,
    titleAbsolute: true,
    alternatesTypes: { 'text/markdown': absoluteUrl('/agents.md') },
  });
}

const KEY_COMMAND =
  'docker compose exec reelforge reelforge keys create --name agent --scopes read,write,render';

/**
 * "Connect your agent" (studio issue #49, /agents only): client tabs with
 * checked configs, the keys an agent needs, a prompt cookbook built from the
 * real demo renders, and every MCP tool grouped by job (generated from the
 * studio's live tools/list). The same content is served as Markdown at
 * /agents.md for agents. FAQ: the BuildBase `agents-faq` collection.
 */
export default async function AgentsPage({ params }: AgentsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const faq = await getFaqSection('agents');
  const ref = reels[0];

  return (
    <div className="rf-product flex flex-1 flex-col items-center">
      {/* The largest element is the terminal snippet, in Geist Mono. */}
      <FontPreload href={GEIST_MONO_CORE_URL} />
      <FAQJsonLd
        items={faq.items.map((item) => ({
          question: item.question,
          answer: item.text,
        }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Connect your agent', url: absoluteUrl('/agents') },
        ]}
      />

      <section aria-labelledby="agents-title" className="dark rf-stage w-full">
        <div className="mx-auto max-w-[980px] px-4 pt-16 pb-20 text-center md:px-6 md:pt-24">
          <p className="rf-eyebrow rf-fade-up">Connect your agent</p>
          <h1 id="agents-title" className="rf-display rf-fade-up mt-4">
            Your agent drives. Over MCP or REST
          </h1>
          <p className="rf-muted rf-fade-up-2 mx-auto mt-6 max-w-[56ch] text-lg text-pretty md:text-xl">
            ReelForge Studio serves an MCP server at <code>/mcp</code> and a
            REST API at <code>/v1</code> on your own machine. Add it to your
            agent with a key, then ask for a reel.
          </p>
          <div className="mt-12">
            <AgentTabs clients={AGENT_CLIENTS} showChecked />
          </div>
          <p className="rf-muted mt-6 text-sm">
            Cursor and other clients are not listed until we have tested them.
            Not running the studio yet?{' '}
            <Link href="/#how" className="rf-link underline">
              Three steps to set it up
            </Link>
            .
          </p>
        </div>
      </section>

      <section
        aria-labelledby="keys-title"
        className="mx-auto w-full max-w-[980px] px-4 py-20 md:px-6 md:py-28"
      >
        <p className="rf-eyebrow">Keys</p>
        <h2 id="keys-title" className="rf-headline mt-3">
          One key per agent, with only the scopes it needs
        </h2>
        <p className="text-muted-foreground mt-5 max-w-[60ch] text-lg text-pretty">
          Keys are created on your studio, shown once and stored hashed. Give
          day-to-day agents a key without <code>admin</code>.
        </p>
        <div className="dark rf-window mt-8 min-w-0">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
            <span className="text-stage-muted font-mono text-xs">Terminal</span>
            <CopyButton
              text={KEY_COMMAND}
              ariaLabel="Copy the command that creates an agent key"
              goal="copy_agent_snippet"
              goalProps={{ client: 'key' }}
            />
          </div>
          <pre
            tabIndex={0}
            className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed"
          >
            <code>{KEY_COMMAND}</code>
          </pre>
        </div>
        <table className="mt-8 w-full text-left text-sm">
          <caption className="sr-only">API key scopes</caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 pr-4 font-medium">
                Scope
              </th>
              <th scope="col" className="py-2 font-medium">
                Lets the agent
              </th>
            </tr>
          </thead>
          <tbody>
            {KEY_SCOPES.map((s) => (
              <tr key={s.scope} className="border-b last:border-0">
                <td className="py-2 pr-4 font-mono">{s.scope}</td>
                <td className="text-muted-foreground py-2">{s.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <details className="mt-8 rounded-xl border p-4">
          <summary className="cursor-pointer font-medium">
            Agent on another machine? Remote access
          </summary>
          <div className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed">
            <p>
              The studio listens on 127.0.0.1 by default. To reach it from
              elsewhere, put it behind TLS: the studio&apos;s compose file has a{' '}
              <code>tls</code> profile with Caddy that gets a certificate for
              your domain (
              <code>docker compose --profile tls up -d --build</code> with{' '}
              <code>REELFORGE_DOMAIN</code> and{' '}
              <code>REELFORGE_PUBLIC_URL</code> set). Then use{' '}
              <code>https://YOUR-HOST/mcp</code> in the snippets above.
            </p>
            <p>
              <code>/mcp</code> checks the Host and Origin headers against the
              public URL and <code>REELFORGE_ALLOWED_HOSTS</code>, so a web page
              cannot reach your studio through the visitor&apos;s browser. Keys
              can also carry an IP allowlist, an expiry and render quotas.
            </p>
          </div>
        </details>
      </section>

      <section aria-labelledby="cookbook-title" className="bg-muted/40 w-full">
        <div className="mx-auto max-w-[1200px] px-4 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-[980px]">
            <p className="rf-eyebrow">Prompt cookbook</p>
            <h2 id="cookbook-title" className="rf-headline mt-3">
              A prompt, the tools it calls, the reel it makes
            </h2>
            <p className="text-muted-foreground mt-5 max-w-[62ch] text-lg text-pretty">
              Each recipe is a real render. No other docs needed: the server
              explains its own workflow to agents (the{' '}
              <code>reelforge://guide/workflow</code> resource and the{' '}
              <code>make_reel</code> prompt).
            </p>
          </div>
          <ol className="mt-12 space-y-6">
            {reels.map((reel) => (
              <li
                key={reel.slug}
                className="rf-reveal bg-card grid gap-6 rounded-2xl border p-5 shadow-[var(--shadow-sm)] md:grid-cols-[160px_1fr] md:p-8"
              >
                <div className="dark rf-stage relative mx-auto aspect-[9/16] w-40 overflow-hidden rounded-xl md:mx-0">
                  <ReelVideo
                    sources={[reelSource(reel)]}
                    sizes="160px"
                    className="rf-screen absolute inset-0"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-medium tracking-tight">
                    {reel.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs">Prompt</p>
                  <blockquote className="mt-1 border-l-2 pl-3 text-pretty">
                    {reel.prompt}
                  </blockquote>
                  <p className="text-muted-foreground mt-4 text-xs">
                    Tools called, in order
                  </p>
                  <p className="mt-1 font-mono text-[13px] leading-relaxed break-words">
                    {collapsedCalls(reel)
                      .map((c) =>
                        c.times > 1 ? `${c.tool} ×${c.times}` : c.tool
                      )
                      .join(' → ')}
                  </p>
                  <p className="text-muted-foreground mt-4 text-xs">Result</p>
                  <p className="mt-1 text-sm">
                    {reel.output.width}×{reel.output.height},{' '}
                    {reel.output.durationSeconds} s, {reel.output.frames}{' '}
                    frames, {enginesOf(reel).join(' + ')}; rendered in{' '}
                    {reel.renderSeconds} s<Fn n={1} />; checks:{' '}
                    {Object.entries(reel.checks)
                      .map(([k, v]) => `${k} ${v}`)
                      .join(', ')}
                    .
                  </p>
                  <CopyButton
                    text={reel.prompt}
                    label="Copy prompt"
                    ariaLabel={`Copy prompt for the ${reel.title} reel`}
                    goal="copy_reel_prompt"
                    goalProps={{ reel: reel.slug }}
                    className="mt-4"
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="tools"
        aria-labelledby="tools-title"
        className="mx-auto w-full max-w-[1200px] scroll-mt-28 px-4 py-20 md:px-6 md:py-28"
      >
        <div className="mx-auto max-w-[980px]">
          <p className="rf-eyebrow">Tools</p>
          <h2 id="tools-title" className="rf-headline mt-3">
            {toolCatalog.count} MCP tools, grouped by job
          </h2>
          <p className="text-muted-foreground mt-5 max-w-[62ch] text-lg text-pretty">
            Every REST route has a tool with the same scope, so an agent can do
            everything the API can
            <Fn n={2} />. Tool names are experimental until v1.0.
          </p>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {toolCatalog.groups.map((group) => (
            <section
              key={group.id}
              aria-labelledby={`tools-${group.id}`}
              className="rf-reveal"
            >
              <h3
                id={`tools-${group.id}`}
                className="flex items-baseline justify-between gap-3 border-b pb-2 text-lg font-medium"
              >
                {group.title}
                <span className="rf-receipt font-normal">
                  {group.tools.length}
                </span>
              </h3>
              <ul className="divide-y">
                {group.tools.map((tool) => (
                  <li key={tool.name} className="py-3">
                    <p className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-sm font-medium">
                        {tool.name}
                      </code>
                      {tool.readOnly ? (
                        <span className="rf-receipt">read-only</span>
                      ) : null}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm text-pretty">
                      {tool.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="agents-faq-title"
        className="w-full max-w-3xl px-4 pb-20 md:px-6"
      >
        <h2 id="agents-faq-title" className="rf-headline text-center">
          Questions
        </h2>
        <FaqSection items={faq.items} />
        <p className="mt-10 text-center text-sm">
          <Link href="/pricing" className="rf-link inline-flex items-center">
            Get the free Personal licence
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </section>

      <section aria-labelledby="agents-notes" className="w-full border-t">
        <div className="mx-auto max-w-[980px] px-4 py-12 md:px-6">
          <h2 id="agents-notes" className="text-sm font-medium">
            Notes
          </h2>
          <ol className="text-muted-foreground mt-4 list-decimal space-y-2 pl-5 text-xs leading-relaxed">
            <li id="fn-1" className="scroll-mt-32">
              Wall-clock time from each render&apos;s render-manifest.json, one
              run each on {ref.renderedAt.slice(0, 10)}: ReelForge Studio{' '}
              {ref.versions.studio} (development build, licence check off),{' '}
              {hardwareLabel(ref)}. Times vary from run to run; not a benchmark.
              The calls were sent by a script that follows the studio&apos;s
              workflow guide (<code>scripts/reels/render-demo-reels.mjs</code>{' '}
              in this site&apos;s repository).
            </li>
            <li id="fn-2" className="scroll-mt-32">
              Counted from {toolCatalogSource()}. The studio&apos;s parity test
              fails if a REST route has no tool. This list is regenerated with{' '}
              <code>scripts/agents/refresh-mcp-tools.mjs</code>.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

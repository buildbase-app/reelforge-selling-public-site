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
  reels,
  toolCatalog,
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

const TITLE = 'Connect Claude Code or any MCP client to RenderWeld';
const DESCRIPTION = `Connect Claude Code or any MCP client to your own RenderWeld server. Copy-paste setup, a prompt cookbook and all ${toolCatalog.count} tools.`;

/** A render date as the notes print it, e.g. "21 November 2026". */
function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

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
  'docker compose exec renderweld renderweld keys create --name agent --scopes read,write,render';

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
          <h1 id="agents-title" className="rf-display rf-fade-up">
            Connect your AI agent in one step
          </h1>
          <p className="rf-muted rf-fade-up-2 max-w-measure mx-auto mt-6 text-lg text-pretty md:text-xl">
            RenderWeld serves an MCP server at <code>/mcp</code> and a REST API
            at <code>/v1</code> on your own machine. Add it to your agent with a
            key, then ask for a reel.
          </p>
          <div className="mt-12">
            <AgentTabs clients={AGENT_CLIENTS} showChecked />
          </div>
          <p className="rf-muted mt-6 text-sm">
            Cursor and other clients are not listed until we have tested them.
            Haven&apos;t installed RenderWeld yet?{' '}
            <Link href="/#how" className="rf-link underline">
              Set it up in three steps
            </Link>
            .
          </p>
        </div>
      </section>

      <section
        aria-labelledby="keys-title"
        className="mx-auto w-full max-w-[980px] px-4 py-20 md:px-6 md:py-28"
      >
        <h2 id="keys-title" className="rf-headline">
          One key per agent, with only the scopes it needs
        </h2>
        <p className="text-muted-foreground max-w-measure mt-5 text-lg text-pretty">
          Keys are created on your server, shown once and stored hashed. Give
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
              RenderWeld only listens on this computer by default. To reach it
              from elsewhere, put it behind HTTPS and set its public address;
              see Remote access in the{' '}
              <Link href="/docs" className="underline">
                docs
              </Link>
              . A web page can&apos;t reach your RenderWeld server through a
              visitor&apos;s browser.
            </p>
            <p>
              Keys can also carry an IP allowlist, an expiry and render quotas.
            </p>
          </div>
        </details>
      </section>

      <section aria-labelledby="cookbook-title" className="bg-muted/40 w-full">
        <div className="mx-auto max-w-[1200px] px-4 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-[980px]">
            <h2 id="cookbook-title" className="rf-headline">
              A prompt, the tools it calls, the reel it makes
            </h2>
            <p className="text-muted-foreground max-w-measure mt-5 text-lg text-pretty">
              Each recipe is a real render. No other docs needed: the server
              explains its own workflow to agents (the{' '}
              <code>renderweld://guide/workflow</code> resource and the{' '}
              <code>make_reel</code> prompt).
            </p>
          </div>
          <ol className="mt-12 space-y-6">
            {reels.map((reel) => (
              <li
                key={reel.slug}
                className="rf-reveal bg-card grid gap-6 rounded-2xl border p-5 md:grid-cols-[160px_1fr] md:p-8"
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
          <h2 id="tools-title" className="rf-headline">
            {toolCatalog.count} MCP tools, grouped by job
          </h2>
          <p className="text-muted-foreground max-w-measure mt-5 text-lg text-pretty">
            Every REST route has a tool with the same scope, so an agent can do
            everything the API can
            <Fn n={2} />. Tool names may change before version 1.0; we list
            every change in the changelog.
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
          <ol className="text-muted-foreground max-w-measure mt-4 list-decimal space-y-2 pl-5 text-xs leading-relaxed">
            <li id="fn-1" className="scroll-mt-32">
              Times are from one run each on {longDate(ref.renderedAt)} on a
              shared 4-vCPU Linux server; they vary from run to run.{' '}
              <Link href="/methods" className="underline underline-offset-2">
                How we measured
              </Link>
              .
            </li>
            <li id="fn-2" className="scroll-mt-32">
              Every REST endpoint has a matching MCP tool; our tests check this
              on every release.{' '}
              <Link href="/methods" className="underline underline-offset-2">
                How we counted
              </Link>
              .
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

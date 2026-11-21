import { agent } from '@/lib/agent';
import { siteUrl } from '@/env';
import { getDocsSite } from '@/lib/docs/source';
import { llmsDocsSection } from '@/lib/docs/twin';

/**
 * Discovery document served by the SDK (see src/lib/agent), with the docs
 * from BuildBase Docs appended at request time (one line per page), so a
 * page published in the console is listed without a deploy. The reads are
 * cached and revalidated by the `doc.*` webhook (src/lib/docs/source.ts).
 */
export async function GET(request: Request): Promise<Response> {
  const base = await agent.serveAgentPath(request);
  if (!base.ok) return base;
  const site = await getDocsSite();
  const docs = llmsDocsSection(site.nav, siteUrl.replace(/\/$/, ''));
  if (!docs) return base;
  const text = `${(await base.text()).replace(/\s+$/, '')}\n\n${docs}`;
  const headers = new Headers(base.headers);
  headers.delete('content-length');
  headers.delete('etag');
  return new Response(text, { status: base.status, headers });
}

export const OPTIONS = agent.serveAgentPath;

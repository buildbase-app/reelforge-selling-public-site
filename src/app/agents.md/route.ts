import { buildAgentsMarkdown } from '@/lib/agents/markdown';

/** /agents as Markdown for agents; the HTML page links it as an alternate. */
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(buildAgentsMarkdown(), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}

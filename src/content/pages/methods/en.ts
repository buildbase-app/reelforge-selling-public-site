import type { LegalPageContent } from '../page-loader';

/**
 * How the figures on the product pages were measured and counted, in
 * public terms: no internal script paths or commit ids (studio issue #537).
 * The footnotes on /agents link here.
 */
const page: LegalPageContent = {
  locale: 'en',
  heroEyebrow: 'Notes',
  heroTitle: 'How we measured',
  heroDescription:
    'Where the render times, the demo reels and the tool count on these pages come from, and what they do and do not show.',
  seoTitle: 'How we measured',
  seoDescription:
    'How RenderWeld measured the render times of its demo reels and counted its MCP tools: one run each, real hardware, not a benchmark.',
  lastUpdated: '2026-11-28',
  body: `## Render times

Each demo reel was rendered once by RenderWeld on the machine named in the footnote. RenderWeld writes a \`render-manifest.json\` next to every render, and the time we quote is the wall-clock time recorded there.

These are single runs, not a benchmark. The same reel on the same machine takes longer when other work shares it, and shorter on faster hardware. The footnotes name the RenderWeld version and the hardware, so you can compare like with like.

## The demo reels

The requests that made the reels were sent by a script that follows RenderWeld's own workflow guide, the same guide the server offers any MCP client as a resource and a prompt. So the reels show what an agent following that guide gets.

## The tool count

The number of tools is read from RenderWeld's MCP tool list, which the server builds from its tool registry. RenderWeld's own tests fail if a REST route has no matching tool, so the count covers everything the REST API can do. The footnote names the version and the date the list was read.
`,
};

export default page;

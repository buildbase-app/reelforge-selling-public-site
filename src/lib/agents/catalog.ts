import mcpTools from '@/data/mcp-tools.json';
import reelsData from '@/data/reels.json';

/**
 * Typed access to the two generated data files behind / and /agents:
 * - `src/data/mcp-tools.json`: the studio's MCP tools, grouped by job
 *   (`scripts/agents/refresh-mcp-tools.mjs`, from a live `tools/list`);
 * - `src/data/reels.json`: the demo reels, with the numbers copied from the
 *   studio's own render manifests (`scripts/reels/build-index.mjs`).
 * Pages read numbers from here, never from copy.
 */

export interface McpTool {
  name: string;
  title: string;
  summary: string;
  readOnly: boolean;
}

export interface McpToolGroup {
  id: string;
  title: string;
  tools: McpTool[];
}

export interface McpToolCatalog {
  source: {
    server: string;
    version: string;
    method: string;
    fetchedOn: string;
  };
  count: number;
  groups: McpToolGroup[];
}

export interface Reel {
  slug: string;
  title: string;
  prompt: string;
  theme: string;
  scenes: {
    id: string;
    engine: string;
    template: string | null;
    frames: number;
    /** On-screen words, for the text alternative. */
    text: string;
  }[];
  output: {
    width: number;
    height: number;
    fps: number;
    frames: number;
    durationSeconds: number;
    videoCodec: string;
    audioCodec: string;
  };
  checks: Record<string, string>;
  renderSeconds: number;
  renderedAt: string;
  versions: {
    studio: string;
    engines: Record<string, string>;
    ffmpeg: string;
    browser: string;
  };
  hardware: { cpu: string; cores: number; ramGB: number };
  toolCalls: { tool: string; ms: number; note?: string }[];
  files: {
    mp4: string;
    webm: string;
    avif: string;
    jpg: string;
    webp: string;
    /** Posters at 360, 540 and 720 px wide, as `srcset` values. */
    avifSrcSet: string;
    webpSrcSet: string;
    width: number;
    height: number;
  };
}

export const toolCatalog = mcpTools as McpToolCatalog;
export const reels = (reelsData as { reels: Reel[] }).reels;

export function getReel(slug: string): Reel {
  const reel = reels.find((r) => r.slug === slug);
  if (!reel) throw new Error(`Unknown reel: ${slug}`);
  return reel;
}

/** Engine ids as people read them. */
export const ENGINE_NAMES: Record<string, string> = {
  remotion: 'Remotion',
  'motion-canvas': 'Motion Canvas',
  html: 'HTML',
  hyperframes: 'HyperFrames',
};

/** The distinct engines a reel used, in scene order. */
export function enginesOf(reel: Reel): string[] {
  return [
    ...new Set(reel.scenes.map((s) => ENGINE_NAMES[s.engine] ?? s.engine)),
  ];
}

/**
 * Consecutive calls to the same tool collapsed ("add_scene ×3"), for the
 * cookbook and the transcript.
 */
export function collapsedCalls(reel: Reel): { tool: string; times: number }[] {
  const out: { tool: string; times: number }[] = [];
  for (const call of reel.toolCalls) {
    const last = out.at(-1);
    if (last && last.tool === call.tool) last.times += 1;
    else out.push({ tool: call.tool, times: 1 });
  }
  return out;
}

/** "Intel(R) Xeon(R) Processor @ 2.10GHz" -> "Intel Xeon @ 2.10 GHz". */
export function hardwareLabel(reel: Reel): string {
  const cpu = reel.hardware.cpu
    .replace(/\((R|TM)\)/g, '')
    .replace(/\s+Processor/, '')
    .replace(/(\d)GHz/, '$1 GHz')
    .replace(/\s+/g, ' ')
    .trim();
  return `${cpu}, ${reel.hardware.cores} vCPU, ${reel.hardware.ramGB} GB RAM, Linux x64`;
}

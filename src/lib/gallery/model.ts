/**
 * The showcase gallery's data model: records of the BuildBase Collection
 * `gallery` (written by the studio's `pnpm gallery publish`, see the studio's
 * docs/GALLERY.md) turned into reels the pages render. Pure functions only,
 * so they are unit-tested without a server.
 *
 * Records hold media *paths* (`gallery/<slug>/<name>.<hash>.mp4`); the media
 * origin comes from configuration (`GALLERY_MEDIA_URL`: the R2 custom domain
 * today, a Worker route or a local static server for a preview), so moving
 * the media never means editing records.
 */

import { countOf, meetsGalleryBar, musicOf, type ReelCounts } from './bar';

export const DEFAULT_MEDIA_URL = 'https://media.reelforge.buildbase.app';

export const ENGINE_LABELS: Record<string, string> = {
  remotion: 'Remotion',
  'motion-canvas': 'Motion Canvas',
  html: 'HTML',
  hyperframes: 'HyperFrames',
};

/** What a `gallery` record stores under `data` (field slugs). */
export interface GalleryRecordData extends Record<string, unknown> {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  tags?: string;
  engines?: string[];
  theme?: string;
  durationSeconds?: number;
  frames?: number;
  fps?: number;
  renderSeconds?: number;
  hardware?: string;
  studioVersion?: string;
  engineVersions?: string;
  renderedAt?: string;
  prompt?: string;
  tools?: string;
  mcpCalls?: number;
  manifestHash?: string;
  manifestPath?: string;
  posterPath?: string;
  posterAvifPath?: string;
  posterSmallPath?: string;
  posterSmallAvifPath?: string;
  mp4Path?: string;
  webmPath?: string;
  mp4Bytes?: number;
  status?: string;
  featured?: boolean;
  order?: number;
  /** The gallery bar's counts (studio issue #807), written with the record. */
  htmlComponents?: number;
  animations?: number;
  soundEffects?: number;
  music?: boolean;
}

export interface GalleryReel {
  slug: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  tags: string[];
  engines: string[];
  theme: string;
  durationSeconds: number;
  frames: number;
  fps: number;
  renderSeconds: number;
  hardware: string;
  studioVersion: string;
  engineVersions: string;
  renderedAt: string;
  prompt: string;
  tools: string[];
  mcpCalls: number;
  manifestUrl: string | null;
  poster: { jpg: string; avif: string; jpgSmall: string; avifSmall: string };
  mp4: string;
  webm: string;
  mp4Bytes: number;
  published: boolean;
  featured: boolean;
  order: number;
  counts: ReelCounts;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** `base` + `path`, with exactly one slash between them. */
export function mediaUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/** The media origin for the CSP (`media-src`, `img-src`), or null. */
export function mediaOrigin(base: string | undefined): string | null {
  try {
    return new URL(base || DEFAULT_MEDIA_URL).origin;
  } catch {
    return null;
  }
}

const SAFE_PATH = /^gallery\/[a-z0-9][a-z0-9-]*\/[A-Za-z0-9._-]+$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;

/** True for a string that could be a reel slug (what `toReel` accepts). */
export function isReelSlug(slug: string): boolean {
  return SLUG.test(slug);
}

function list(s: unknown): string[] {
  return typeof s === 'string'
    ? s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * One record as a reel, or null when it lacks what a card needs (a slug, a
 * title, the MP4 and a poster) or a media path is not a gallery path.
 */
export function toReel(
  data: GalleryRecordData,
  base: string = DEFAULT_MEDIA_URL
): GalleryReel | null {
  const slug = String(data.slug ?? '');
  const title = String(data.title ?? '').trim();
  const paths = [
    data.mp4Path,
    data.posterPath,
    data.webmPath,
    data.posterAvifPath,
    data.posterSmallPath,
    data.posterSmallAvifPath,
  ].filter((p): p is string => typeof p === 'string' && p !== '');
  if (!SLUG.test(slug) || !title || !data.mp4Path || !data.posterPath)
    return null;
  if (paths.some((p) => !SAFE_PATH.test(p))) return null;
  const url = (p: string | undefined, fallback: string) =>
    mediaUrl(base, p && SAFE_PATH.test(p) ? p : fallback);
  const category = String(data.category ?? 'Reel').trim() || 'Reel';
  return {
    slug,
    title,
    description: String(data.description ?? ''),
    category,
    categorySlug: slugify(category),
    tags: list(data.tags),
    engines: Array.isArray(data.engines)
      ? data.engines.filter((e) => typeof e === 'string')
      : [],
    theme: String(data.theme ?? ''),
    durationSeconds: num(data.durationSeconds),
    frames: num(data.frames),
    fps: num(data.fps) || 30,
    renderSeconds: num(data.renderSeconds),
    hardware: String(data.hardware ?? ''),
    studioVersion: String(data.studioVersion ?? ''),
    engineVersions: String(data.engineVersions ?? ''),
    renderedAt: String(data.renderedAt ?? ''),
    prompt: String(data.prompt ?? ''),
    tools: list(data.tools),
    mcpCalls: num(data.mcpCalls),
    manifestUrl:
      data.manifestPath && SAFE_PATH.test(data.manifestPath)
        ? mediaUrl(base, data.manifestPath)
        : null,
    poster: {
      jpg: url(data.posterPath, data.posterPath),
      avif: url(data.posterAvifPath, data.posterPath),
      jpgSmall: url(data.posterSmallPath, data.posterPath),
      avifSmall: url(
        data.posterSmallAvifPath,
        data.posterAvifPath ?? data.posterPath
      ),
    },
    mp4: url(data.mp4Path, data.mp4Path),
    webm: url(data.webmPath, data.mp4Path),
    mp4Bytes: num(data.mp4Bytes),
    published: data.status === 'published',
    featured: data.featured === true,
    order: num(data.order),
    counts: {
      htmlComponents: countOf(data.htmlComponents),
      animations: countOf(data.animations),
      soundEffects: countOf(data.soundEffects),
      music: musicOf(data.music),
    },
  };
}

/**
 * Records -> reels: valid ones that meet the gallery bar (studio issue #807;
 * a record without counts does not), published only unless
 * `includeHidden`, in gallery order. `includeHidden` never lets a reel below
 * the bar through.
 */
export function toReels(
  records: { data: GalleryRecordData }[],
  opts: { base?: string; includeHidden?: boolean } = {}
): GalleryReel[] {
  const seen = new Set<string>();
  const out: GalleryReel[] = [];
  for (const r of records) {
    const reel = toReel(r.data ?? {}, opts.base);
    if (!reel || seen.has(reel.slug)) continue;
    if (!reel.published && !opts.includeHidden) continue;
    if (!meetsGalleryBar(reel.counts)) continue;
    seen.add(reel.slug);
    out.push(reel);
  }
  return out.sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      a.order - b.order ||
      a.title.localeCompare(b.title)
  );
}

export interface GalleryFilter {
  category: string | null;
  engine: string | null;
}

/** URL params -> a filter. Unknown values are ignored, not errors. */
export function parseFilter(
  params: Record<string, string | string[] | undefined>,
  reels: GalleryReel[]
): GalleryFilter {
  const one = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v)?.toLowerCase() ?? null;
  const category = one(params.category);
  const engine = one(params.engine);
  return {
    category:
      category && reels.some((r) => r.categorySlug === category)
        ? category
        : null,
    engine: engine && engine in ENGINE_LABELS ? engine : null,
  };
}

export function applyFilter(
  reels: GalleryReel[],
  f: GalleryFilter
): GalleryReel[] {
  return reels.filter(
    (r) =>
      (!f.category || r.categorySlug === f.category) &&
      (!f.engine || r.engines.includes(f.engine))
  );
}

/** Categories with their counts, biggest first. */
export function categories(
  reels: GalleryReel[]
): { slug: string; label: string; count: number }[] {
  const m = new Map<string, { slug: string; label: string; count: number }>();
  for (const r of reels) {
    const c = m.get(r.categorySlug) ?? {
      slug: r.categorySlug,
      label: r.category,
      count: 0,
    };
    c.count++;
    m.set(r.categorySlug, c);
  }
  return [...m.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label)
  );
}

/** The query string for a filter (empty values dropped). */
export function filterHref(f: Partial<GalleryFilter>): string {
  const q = new URLSearchParams();
  if (f.category) q.set('category', f.category);
  if (f.engine) q.set('engine', f.engine);
  const s = q.toString();
  return s ? `/gallery?${s}` : '/gallery';
}

/** ISO 8601 duration for schema.org, e.g. 16 -> PT16S, 75.5 -> PT1M15.5S. */
export function isoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round((seconds - m * 60) * 10) / 10;
  return `PT${m ? `${m}M` : ''}${s || !m ? `${s}S` : ''}`;
}

/** schema.org VideoObject for a reel's watch page. */
export function videoObject(reel: GalleryReel, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: reel.title,
    description: reel.description || reel.prompt,
    thumbnailUrl: [reel.poster.jpg],
    contentUrl: reel.mp4,
    uploadDate: reel.renderedAt || undefined,
    duration: isoDuration(reel.durationSeconds),
    width: 720,
    height: 1280,
    url: pageUrl,
    isFamilyFriendly: true,
    keywords: [reel.category, ...reel.tags].join(', '),
  };
}

/** The text an agent gets for "make this with your agent". */
export function agentSnippet(reel: GalleryReel): string {
  const lines = [reel.prompt.trim()];
  if (reel.manifestUrl) {
    lines.push(
      '',
      `Reference manifest (RenderWeld manifest v0.2, rendered as "${reel.title}"): ${reel.manifestUrl}`,
      'Create the project with create_project, check it with validate_project, render it with render_project and wait with get_job, then give me the download link from get_render_output.'
    );
  }
  return lines.join('\n');
}

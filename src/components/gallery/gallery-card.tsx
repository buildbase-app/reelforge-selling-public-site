import { Link } from '@/i18n/link';
import { ENGINE_LABELS, type GalleryReel } from '@/lib/gallery/model';
import { GalleryCardVideo } from './gallery-card-video';

/** "Remotion · HTML · 16 s · rendered in 142 s": the reel's render receipt. */
export function receipt(reel: GalleryReel): string {
  const engines = reel.engines.map((e) => ENGINE_LABELS[e] ?? e).join(' · ');
  // A no-break space keeps each number with its unit when the line wraps.
  const parts = [engines, `${formatSeconds(reel.durationSeconds)}\u00a0s`];
  if (reel.renderSeconds > 0)
    parts.push(`rendered in ${formatSeconds(reel.renderSeconds)}\u00a0s`);
  return parts.filter(Boolean).join(' · ');
}

export function formatSeconds(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** One reel in the grid: poster, clip on hover or in view, title, receipt. */
export function GalleryCard({
  reel,
  priority = false,
  large = false,
}: {
  reel: GalleryReel;
  priority?: boolean;
  large?: boolean;
}) {
  return (
    <li className="gl-card" data-gallery-card="">
      <Link href={`/gallery/${reel.slug}`} className="block outline-none">
        <div className="gl-frame">
          <div className={large ? 'gl-parallax absolute inset-0' : undefined}>
            <GalleryCardVideo
              priority={priority}
              media={{
                avif: large ? reel.poster.avif : reel.poster.avifSmall,
                jpg: large ? reel.poster.jpg : reel.poster.jpgSmall,
                mp4: reel.mp4,
                webm: reel.webm,
                label: `Silent ${formatSeconds(reel.durationSeconds)}-second reel: ${reel.title}`,
              }}
            />
          </div>
        </div>
        <h3
          className={`gl-title mt-3 font-medium text-pretty transition-colors ${large ? 'text-lg' : 'text-[15px] leading-snug'}`}
        >
          {reel.title}
        </h3>
        <p className="gl-receipt text-muted-foreground mt-1 text-xs leading-relaxed">
          {receipt(reel)}
        </p>
      </Link>
    </li>
  );
}

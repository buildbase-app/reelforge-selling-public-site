'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { Pause, Play } from '@/components/icons/lite';

/**
 * A silent, looping product reel. One IntersectionObserver (shared by every
 * reel on the page) plays a reel while at least 60% of it is visible and
 * pauses it otherwise; all reels pause while the tab is hidden. With
 * `prefers-reduced-motion: reduce` nothing plays on its own: the poster
 * shows with a play button. Every reel has a visible pause/play button
 * (WCAG 2.2.2).
 *
 * The poster is a real <img> under the video (AVIF, then WebP, then JPEG;
 * right-sized through `srcset`/`sizes` when the source has them), so it can
 * be the LCP element and the box never shifts (fixed 9:16). With `priority`
 * the first poster is also preloaded from <head> at high priority.
 * `sources` with more than one entry play one after another.
 */

export interface ReelSource {
  webm: string;
  mp4: string;
  avif: string;
  jpg: string;
  /** Posters by width (`srcset` values, `w` descriptors), used with `sizes`. */
  avifSrcSet?: string;
  webpSrcSet?: string;
  /** What the reel shows, read by screen readers. */
  label: string;
  /** The WebM's `type` (default: AV1). Gallery reels are VP9. */
  webmType?: string;
}

/**
 * The scroll-motion fallback (`@/lib/motion-fallback`), asked for from the
 * reel players because pages with reels are the pages that move, so no page
 * pays first-load JavaScript for it. It loads only where CSS scroll-driven
 * animations are missing (the module then checks reduced motion and
 * IntersectionObserver) and restarts on the current DOM on each call.
 */
let stopMotion: (() => void) | undefined;
function requestMotionFallback() {
  if (!window.CSS?.supports?.('animation-timeline: view()'))
    import('@/lib/motion-fallback').then((m) => {
      stopMotion?.();
      stopMotion = m.startMotionFallback();
    });
}

type Listener = (visible: boolean) => void;
const listeners = new Map<Element, Listener>();
let observer: IntersectionObserver | null = null;

function observe(el: Element, fn: Listener): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        listeners.get(e.target)?.(e.intersectionRatio >= 0.6);
    },
    { threshold: [0, 0.6] }
  );
  listeners.set(el, fn);
  observer.observe(el);
  return () => {
    listeners.delete(el);
    observer?.unobserve(el);
  };
}

export function ReelVideo({
  sources,
  priority = false,
  sizes,
  className,
}: {
  sources: ReelSource[];
  /** The hero reel: poster preloaded and fetched first, video metadata preloaded. */
  priority?: boolean;
  /** The poster's displayed width, for the sources' `srcset`. */
  sizes?: string;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(false);
  // null: follow visibility; true/false: the visitor chose.
  const [choice, setChoice] = useState<boolean | null>(null);
  const visible = useRef(false);
  const current = sources[index % sources.length];

  // React puts a high-priority image preload at the top of <head> when this
  // runs during the server render, before the stylesheets and scripts, so
  // the LCP poster starts loading with the document. (A preload called from
  // a server component travels as an RSC hint, which the Workers render
  // drops.)
  if (priority) {
    const first = sources[0];
    preload(first.avif, {
      as: 'image',
      type: 'image/avif',
      fetchPriority: 'high',
      ...(first.avifSrcSet && sizes
        ? { imageSrcSet: first.avifSrcSet, imageSizes: sizes }
        : {}),
    });
  }

  const sync = useCallback(() => {
    const v = video.current;
    if (!v) return;
    // Without a choice, play unless the visitor prefers reduced motion.
    const want =
      choice ??
      !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (want && visible.current && !document.hidden) {
      v.play().catch(() => setPlaying(false));
    } else {
      v.pause();
    }
  }, [choice]);

  // Pages with reels are the pages that move: start the scroll-motion
  // fallback where CSS scroll-driven animations are missing.
  useEffect(requestMotionFallback, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const stop = observe(v, (isVisible) => {
      visible.current = isVisible;
      sync();
    });
    const onVisibility = () => sync();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // Re-attach when a playlist swaps the <video> element.
  }, [sync, current.mp4]);

  // A new source in a playlist: keep playing if we were.
  useEffect(() => {
    sync();
  }, [index, sync]);

  return (
    <div className={className}>
      <picture>
        {current.avifSrcSet && sizes ? (
          <source srcSet={current.avifSrcSet} sizes={sizes} type="image/avif" />
        ) : (
          <source srcSet={current.avif} type="image/avif" />
        )}
        {current.webpSrcSet && sizes && (
          <source srcSet={current.webpSrcSet} sizes={sizes} type="image/webp" />
        )}
        <img
          src={current.jpg}
          alt=""
          width={720}
          height={1280}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
        />
      </picture>
      <video
        key={current.mp4}
        ref={video}
        muted
        playsInline
        loop={sources.length === 1}
        preload={priority ? 'metadata' : 'none'}
        aria-label={current.label}
        width={720}
        height={1280}
        className="rf-reel-video"
        data-shown={shown ? '' : undefined}
        onPlaying={() => {
          setPlaying(true);
          setShown(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setIndex((i) => (i + 1) % sources.length)}
      >
        <source
          src={current.webm}
          type={current.webmType ?? 'video/webm; codecs="av01.0.05M.08"'}
        />
        <source src={current.mp4} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={() => setChoice(!playing)}
        aria-label={playing ? 'Pause reel' : 'Play reel'}
        className="rf-reel-toggle"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </div>
  );
}

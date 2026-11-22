'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

/**
 * A silent, looping product reel. One IntersectionObserver (shared by every
 * reel on the page) plays a reel while at least 60% of it is visible and
 * pauses it otherwise; all reels pause while the tab is hidden. With
 * `prefers-reduced-motion: reduce` nothing plays on its own: the poster
 * shows with a play button. Every reel has a visible pause/play button
 * (WCAG 2.2.2).
 *
 * The poster is a real <img> under the video (AVIF with a JPEG fallback),
 * so it can be the LCP element and the box never shifts (fixed 9:16).
 * `sources` with more than one entry play one after another.
 */

export interface ReelSource {
  webm: string;
  mp4: string;
  avif: string;
  jpg: string;
  /** What the reel shows, read by screen readers. */
  label: string;
  /** The WebM's `type` (default: AV1). Gallery reels are VP9. */
  webmType?: string;
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

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

export function ReelVideo({
  sources,
  priority = false,
  className,
}: {
  sources: ReelSource[];
  /** The hero reel: poster fetched first, video metadata preloaded. */
  priority?: boolean;
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

  const sync = useCallback(() => {
    const v = video.current;
    if (!v) return;
    const want =
      choice ??
      (visible.current && !document.hidden && !prefersReducedMotion());
    if (want && visible.current && !document.hidden) {
      v.play().catch(() => setPlaying(false));
    } else {
      v.pause();
    }
  }, [choice]);

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
        <source srcSet={current.avif} type="image/avif" />
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
        style={{ opacity: shown ? 1 : 0, transition: 'opacity 400ms' }}
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
        className="absolute right-3 bottom-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur"
      >
        {playing ? (
          <Pause className="h-4 w-4" aria-hidden />
        ) : (
          <Play className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

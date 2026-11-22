'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A gallery card's media: the poster (AVIF with a JPEG fallback) and a muted
 * clip that loads nothing until it should play (`preload="none"`).
 *
 * - With a mouse, the clip plays while the card is hovered or focused.
 * - On touch screens, the card closest to the middle of the screen plays
 *   while at least 80% of it is visible; one clip plays at a time.
 * - With `prefers-reduced-motion: reduce` nothing plays on its own; the
 *   detail page has the player with its own controls.
 * - Every clip pauses while the tab is hidden.
 */

let current: HTMLVideoElement | null = null;

function claim(v: HTMLVideoElement) {
  if (current && current !== v) current.pause();
  current = v;
}

function canAutoplay(): boolean {
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export interface GalleryCardMedia {
  avif: string;
  jpg: string;
  mp4: string;
  webm: string;
  /** Read by screen readers. */
  label: string;
}

export function GalleryCardVideo({
  media,
  priority = false,
}: {
  media: GalleryCardMedia;
  priority?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const v = ref.current;
    const card = v?.closest('[data-gallery-card]');
    if (!v || !card) return;
    const play = () => {
      if (!canAutoplay() || document.hidden) return;
      claim(v);
      v.play().catch(() => undefined);
    };
    const stop = () => v.pause();
    const hover = window.matchMedia?.('(hover: hover)').matches ?? false;
    const cleanups: (() => void)[] = [];
    if (hover) {
      card.addEventListener('pointerenter', play);
      card.addEventListener('pointerleave', stop);
      card.addEventListener('focusin', play);
      card.addEventListener('focusout', stop);
      cleanups.push(() => {
        card.removeEventListener('pointerenter', play);
        card.removeEventListener('pointerleave', stop);
        card.removeEventListener('focusin', play);
        card.removeEventListener('focusout', stop);
      });
    } else if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        ([e]) => (e && e.intersectionRatio >= 0.8 ? play() : stop()),
        { threshold: [0, 0.8], rootMargin: '-20% 0px -20% 0px' }
      );
      io.observe(card);
      cleanups.push(() => io.disconnect());
    }
    const onVisibility = () => document.hidden && stop();
    document.addEventListener('visibilitychange', onVisibility);
    cleanups.push(() =>
      document.removeEventListener('visibilitychange', onVisibility)
    );
    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <>
      <picture>
        <source srcSet={media.avif} type="image/avif" />
        <img
          src={media.jpg}
          alt=""
          width={360}
          height={640}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className="gl-media"
        />
      </picture>
      <video
        ref={ref}
        muted
        playsInline
        loop
        preload="none"
        aria-label={media.label}
        width={720}
        height={1280}
        className="gl-media gl-video"
        data-shown={shown ? '' : undefined}
        onPlaying={() => setShown(true)}
      >
        <source src={media.webm} type='video/webm; codecs="vp9"' />
        <source src={media.mp4} type="video/mp4" />
      </video>
    </>
  );
}

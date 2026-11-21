'use client';

import { useEffect } from 'react';

/**
 * The IntersectionObserver fallback for the gallery's scroll reveal, only in
 * browsers without CSS scroll-driven animations and only when motion is
 * welcome: marks the grid (`gl-io`) and sets `data-in` on each card as it
 * enters. Everywhere else it does nothing and the CSS handles it.
 */
export function GalleryReveal({ targetId }: { targetId: string }) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (
      !root ||
      CSS.supports?.('animation-timeline: view()') ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    )
      return;
    root.classList.add('gl-io');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', '');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    root.querySelectorAll('.gl-card').forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [targetId]);
  return null;
}

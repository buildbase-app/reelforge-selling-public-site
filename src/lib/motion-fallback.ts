/**
 * The scroll-motion fallback for browsers without CSS scroll-driven
 * animations (studio issue #81). Loaded on demand by `requestMotionFallback`
 * in the reel players (ReelVideo, GalleryCardVideo), only where it is needed,
 * so it is never first-load code.
 *
 * - Reveals: `.rf-reveal`, `.rf-step` and `.gl-card` get `data-in` as they
 *   enter; the CSS under `.rf-io` plays the same rise once.
 * - Parallax: while a `[data-parallax]` section is on screen, one passive
 *   scroll listener writes its progress (0 to 1 over the first screen) to
 *   `--rf-p`, which the CSS turns into a transform.
 * - "How it works": the step at the middle of the screen sets `data-on` on
 *   its label and `--rf-how-p` on the section.
 *
 * Only transform and opacity change. Returns a cleanup.
 */
export function startMotionFallback(): () => void {
  if (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
    typeof IntersectionObserver === 'undefined'
  )
    return () => {};
  const root = document.documentElement;
  const cleanups: (() => void)[] = [];

  const items = Array.from(
    document.querySelectorAll<HTMLElement>('.rf-reveal, .rf-step, .gl-card')
  );
  // What is already on screen shows at once: no flash before the observer.
  for (const el of items) {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0)
      el.setAttribute('data-in', '');
  }
  root.classList.add('rf-io');
  const reveal = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.setAttribute('data-in', '');
        reveal.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  );
  for (const el of items) if (!el.hasAttribute('data-in')) reveal.observe(el);
  cleanups.push(() => reveal.disconnect());

  for (const section of document.querySelectorAll<HTMLElement>(
    '[data-parallax]'
  )) {
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      section.style.setProperty('--rf-p', p.toFixed(3));
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    const gate = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    });
    gate.observe(section);
    cleanups.push(() => {
      gate.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    });
  }

  for (const how of document.querySelectorAll<HTMLElement>('.rf-how')) {
    const steps = Array.from(how.querySelectorAll('.rf-how-steps > li'));
    const labels = Array.from(how.querySelectorAll('.rf-how-label'));
    const current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = steps.indexOf(e.target);
          labels.forEach((l, j) => l.toggleAttribute('data-on', j === i));
          how.style.setProperty('--rf-how-p', String((i + 1) / steps.length));
        }
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    for (const step of steps) current.observe(step);
    cleanups.push(() => current.disconnect());
  }

  return () => {
    for (const c of cleanups) c();
    root.classList.remove('rf-io');
  };
}

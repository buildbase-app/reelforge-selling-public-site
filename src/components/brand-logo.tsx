/**
 * The RenderWeld logo: the mark (two rounded frames, portrait and landscape,
 * sharing a wall, welded at a signal-orange dot) and the wordmark, from the
 * brand kit (studio docs/brand/BRAND.md §2 and §3). This is the 24 to 40 px
 * variant (`mark-32.svg`, 2 px strokes on a 32 px grid); the frames take the
 * text colour, so the mark follows the theme, and the dot is never
 * recoloured. The wordmark is live text in Geist Semibold, -0.02em, with the
 * kit's extra -0.03em on the r-W pair so the name reads as one word.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="10" height="20" rx="3" />
        <rect x="12" y="16" width="18" height="10" rx="3" />
      </g>
      <circle cx="12" cy="16" r="3.5" fill="#ff4f00" />
    </svg>
  );
}

export function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark className="shrink-0" />
      <span className="font-semibold tracking-[-0.02em]">
        Render<span className="ml-[-0.03em]">Weld</span>
      </span>
    </span>
  );
}

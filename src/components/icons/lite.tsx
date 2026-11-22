/**
 * The few lucide icons that client code on the public pages draws (theme
 * button, sign-in spinner, error page, copy and play buttons), written out so the first load does
 * not carry lucide-react's runtime with each small client chunk (studio
 * issue #79). The markup is lucide-react's own, byte for byte; a test
 * compares each with lucide's render. Server components keep using
 * lucide-react: it costs the browser nothing there.
 */
type Node =
  | ['path', { d: string }]
  | ['circle' | 'line' | 'rect', Record<string, string>];

function lucide(name: string, nodes: Node[]) {
  function Icon({ className }: { className?: string }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={
          className
            ? `lucide lucide-${name} ${className}`
            : `lucide lucide-${name}`
        }
        aria-hidden="true"
      >
        {nodes.map(([Tag, attrs], i) => (
          <Tag key={i} {...attrs} />
        ))}
      </svg>
    );
  }
  return Icon;
}

export const Sun = lucide('sun', [
  ['circle', { cx: '12', cy: '12', r: '4' }],
  ['path', { d: 'M12 2v2' }],
  ['path', { d: 'M12 20v2' }],
  ['path', { d: 'm4.93 4.93 1.41 1.41' }],
  ['path', { d: 'm17.66 17.66 1.41 1.41' }],
  ['path', { d: 'M2 12h2' }],
  ['path', { d: 'M20 12h2' }],
  ['path', { d: 'm6.34 17.66-1.41 1.41' }],
  ['path', { d: 'm19.07 4.93-1.41 1.41' }],
]);

export const Moon = lucide('moon', [
  [
    'path',
    {
      d: 'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401',
    },
  ],
]);

export const Loader2 = lucide('loader-circle', [
  ['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }],
]);

export const AlertCircle = lucide('circle-alert', [
  ['circle', { cx: '12', cy: '12', r: '10' }],
  ['line', { x1: '12', x2: '12', y1: '8', y2: '12' }],
  ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }],
]);

export const RefreshCw = lucide('refresh-cw', [
  ['path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }],
  ['path', { d: 'M21 3v5h-5' }],
  ['path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }],
  ['path', { d: 'M8 16H3v5' }],
]);

export const Home = lucide('house', [
  ['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }],
  [
    'path',
    {
      d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    },
  ],
]);

export const Check = lucide('check', [['path', { d: 'M20 6 9 17l-5-5' }]]);

export const Copy = lucide('copy', [
  ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }],
  ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }],
]);

export const Play = lucide('play', [
  [
    'path',
    {
      d: 'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z',
    },
  ],
]);

export const Pause = lucide('pause', [
  ['rect', { x: '14', y: '3', width: '5', height: '18', rx: '1' }],
  ['rect', { x: '5', y: '3', width: '5', height: '18', rx: '1' }],
]);

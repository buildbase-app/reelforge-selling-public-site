'use client';

import { useEffect } from 'react';
import { captureErrorSync } from '@/lib/sentry';

// `cn(buttonVariants())` and lucide's AlertCircle and RefreshCw, written
// out: this boundary sits outside the locale layout, so it shares no chunk
// with the pages and should pull in nothing (studio issue #79). A test
// keeps them equal to the originals.
const GLOBAL_ERROR_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-brand text-brand-foreground hover:bg-brand/90 h-9 px-4 py-2 has-[>svg]:px-3";

const SVG = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/**
 * Global Error Boundary
 *
 * Catches errors in the root layout and reports them to Sentry (if configured).
 * This is the last line of defense for unhandled errors.
 *
 * It loads with every page, so it uses no UI library: the button is
 * `Button`'s markup and the icons are lucide's (studio issue #79).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry (safe to call even if Sentry not configured)
    captureErrorSync(error, {
      tags: { errorBoundary: 'global' },
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                <svg
                  {...SVG}
                  className="lucide lucide-circle-alert h-12 w-12 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>
            </div>

            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Something went wrong
            </h1>

            <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
              An unexpected error occurred. Our team has been notified and is
              working to fix this issue.
            </p>

            {process.env.NODE_ENV === 'development' ? (
              <div className="mb-6 max-w-lg rounded-lg bg-gray-100 p-4 text-left dark:bg-gray-800">
                <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Error Details:
                </p>
                <code className="text-xs break-all text-gray-700 dark:text-gray-300">
                  {error.message}
                </code>
                {error.digest ? (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Digest: {error.digest}
                  </p>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={reset}
              data-slot="button"
              data-variant="default"
              data-size="default"
              className={GLOBAL_ERROR_BUTTON_CLASS}
            >
              <svg
                {...SVG}
                className="lucide lucide-refresh-cw mr-2 h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

'use client';

import { createContext, useContext, useEffect } from 'react';
import { AlertCircle, Home, RefreshCw } from '@/components/icons/lite';
import { buttonClass } from '@/components/ui/button-classes';
import { Link } from '@/i18n/link';
import { captureErrorSync } from '@/lib/sentry';

export interface ErrorCopy {
  title: string;
  description: string;
  tryAgain: string;
  goHome: string;
}

// English (`errors.generic` in src/i18n/messages/en.ts), for a boundary
// rendered outside the locale layout.
const ErrorCopyContext = createContext<ErrorCopy>({
  title: 'Something went wrong',
  description:
    'An unexpected error occurred. Please try again or contact support if the problem persists.',
  tryAgain: 'Try again',
  goHome: 'Go to homepage',
});

/**
 * The error page's words, translated on the server by the locale layout.
 * The error boundary (`[locale]/error.tsx`) is client code that loads with
 * every page, and the public pages have no intl provider to translate in
 * the browser (studio issue #79).
 *
 * The view itself lives here too, in the module the locale layout loads,
 * not in `error.tsx`. Turbopack gives the layout and each boundary under it
 * their own chunk and copies a module the layout does not load into every
 * boundary that uses it: kept here, `Link`, the button classes and the
 * icons load once, in the layout's chunk, and the public pages' header
 * reuses them.
 */
export function ErrorCopyProvider({
  copy,
  children,
}: {
  copy: ErrorCopy;
  children: React.ReactNode;
}) {
  return (
    <ErrorCopyContext.Provider value={copy}>
      {children}
    </ErrorCopyContext.Provider>
  );
}

/**
 * Catches runtime errors in the page and displays a user-friendly error
 * page. Logs the error and reports it to Sentry (if configured). The buttons
 * are `Button`'s markup with its classes from `buttonClass`.
 */
export function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useContext(ErrorCopyContext);

  useEffect(() => {
    // Log locally. console, not '@/lib/logger': this boundary loads with
    // every page, and the logger is server code (studio issue #79).
    console.error('Page error caught by error boundary', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });

    // Report to Sentry (safe to call even if Sentry not configured)
    captureErrorSync(error, {
      tags: { errorBoundary: 'locale' },
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
      <main
        id="main-content"
        tabIndex={-1}
        className="text-center outline-none"
      >
        <div className="mb-6 flex justify-center">
          <div className="bg-destructive/10 rounded-full p-4">
            <AlertCircle className="text-destructive h-12 w-12" />
          </div>
        </div>

        <h1 className="text-foreground mb-2 text-3xl font-medium tracking-tight">
          {t.title}
        </h1>

        <p className="text-muted-foreground mb-6 max-w-md">{t.description}</p>

        {process.env.NODE_ENV === 'development' ? (
          <div className="bg-muted mb-6 max-w-lg rounded-lg p-4 text-left">
            <p className="text-foreground mb-2 text-sm font-medium">
              Error Details:
            </p>
            <code className="text-muted-foreground text-xs break-all">
              {error.message}
            </code>
            {error.digest ? (
              <p className="text-muted-foreground mt-2 text-xs">
                Digest: {error.digest}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            data-slot="button"
            data-variant="default"
            data-size="default"
            className={buttonClass()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t.tryAgain}
          </button>

          <Link
            href="/"
            data-slot="button"
            data-variant="outline"
            data-size="default"
            className={buttonClass('outline')}
          >
            <Home className="mr-2 h-4 w-4" />
            {t.goHome}
          </Link>
        </div>
      </main>
    </div>
  );
}

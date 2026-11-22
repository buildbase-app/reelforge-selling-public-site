'use client';

import { ErrorView } from '@/components/error-view';

/**
 * Error Boundary Component
 *
 * Catches runtime errors in the page and displays a user-friendly error page.
 * Automatically logs errors and reports to Sentry (if configured). The view
 * and its translated words come from `@/components/error-view`, which the
 * locale layout loads; see there for why (studio issue #79).
 */
export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView {...props} />;
}

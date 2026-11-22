import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing-config';

export { routing };

// Export navigation helpers for use in components. They need the intl
// provider in client code; the public pages link with `@/i18n/link`.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

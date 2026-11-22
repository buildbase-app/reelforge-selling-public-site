'use client';

import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import { localizePath } from './paths';

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  href: string;
};

/**
 * `next/link` with the current locale's prefix, for the public pages
 * (studio issue #79). next-intl's `Link` (`@/i18n/routing`) reads the
 * locale from the intl provider, whose message formatter is about 12 KB of
 * first-load JavaScript; this reads it from the `[locale]` segment instead,
 * so it works in server and client components with no provider on the
 * page. Pages with the provider (dashboard, `(store)`) can use either.
 */
export function Link({ href, ...props }: LinkProps) {
  const params = useParams<{ locale?: string }>();
  return <NextLink href={localizePath(href, params?.locale)} {...props} />;
}

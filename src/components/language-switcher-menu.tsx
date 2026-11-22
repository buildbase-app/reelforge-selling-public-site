'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  defaultLocale,
  locales,
  localeNames,
  type Locale,
} from '@/i18n/config';
import { setLocaleCookie } from '@/i18n/locale-cookie';
import { localizePath, stripLocale } from '@/i18n/paths';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * The language menu (Radix), loaded by `LanguageSwitcher` only when more
 * than one language is served. It reads the locale from the `[locale]`
 * segment and builds paths with `@/i18n/paths`, so it works on the public
 * pages, which have no intl provider (studio issue #79).
 */
export default function LanguageSwitcherMenu({ label }: { label: string }) {
  const params = useParams<{ locale?: string }>();
  const locale = (params?.locale ?? defaultLocale) as Locale;
  const pathname = stripLocale(usePathname() ?? '/', locale);
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    // Persist preference in cookie (1 year expiry)
    setLocaleCookie(newLocale);
    // Navigate to same page in new locale
    router.replace(localizePath(pathname, newLocale));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={label}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

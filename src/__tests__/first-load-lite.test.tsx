import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import * as lucide from 'lucide-react';
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { buttonVariants } from '@/components/ui/button';
import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  buttonClass,
  type ButtonClassSize,
  type ButtonClassVariant,
} from '@/components/ui/button-classes';
import * as lite from '@/components/icons/lite';
import { clientOnly } from '@/components/client-only';
import { localizePath, stripLocale } from '@/i18n/paths';
import { cn } from '@/lib/utils';

/**
 * The small stand-ins that keep the public pages' first-load JavaScript
 * within budget (studio issue #79) must render exactly what they replace.
 */

describe('buttonClass', () => {
  const variants = Object.keys(BUTTON_VARIANTS).filter(
    (v) => v !== 'destructive'
  ) as ButtonClassVariant[];
  const sizes = Object.keys(BUTTON_SIZES).filter(
    (s) => s !== 'sm' && s !== 'lg'
  ) as ButtonClassSize[];

  it.each(variants.flatMap((v) => sizes.map((s) => [v, s] as const)))(
    'equals cn(buttonVariants()) for %s / %s',
    (variant, size) => {
      expect(buttonClass(variant, size)).toBe(
        cn(buttonVariants({ variant, size }))
      );
    }
  );

  it('defaults to the default variant and size', () => {
    expect(buttonClass()).toBe(cn(buttonVariants()));
  });
});

describe('lite icons', () => {
  const pairs = [
    ['Sun', lite.Sun, lucide.Sun],
    ['Moon', lite.Moon, lucide.Moon],
    ['Loader2', lite.Loader2, lucide.Loader2],
    ['AlertCircle', lite.AlertCircle, lucide.AlertCircle],
    ['RefreshCw', lite.RefreshCw, lucide.RefreshCw],
    ['Home', lite.Home, lucide.Home],
    ['Check', lite.Check, lucide.Check],
    ['Copy', lite.Copy, lucide.Copy],
    ['Play', lite.Play, lucide.Play],
    ['Pause', lite.Pause, lucide.Pause],
  ] as const;

  it.each(pairs)('%s renders lucide-react’s markup', (_, Lite, Lucide) => {
    expect(renderToStaticMarkup(<Lite className="h-4 w-4" />)).toBe(
      renderToStaticMarkup(<Lucide className="h-4 w-4" />)
    );
    expect(renderToStaticMarkup(<Lite />)).toBe(
      renderToStaticMarkup(<Lucide />)
    );
  });
});

describe('localizePath', () => {
  // The site's routing with a second language, as it would be once one is
  // served: localizePath must build what next-intl builds.
  const { getPathname } = createNavigation(
    defineRouting({
      locales: ['en', 'de'],
      defaultLocale: 'en',
      localePrefix: 'as-needed',
    })
  );
  const hrefs = [
    '/',
    '/pricing',
    '/docs/getting-started',
    '/blog?tag=release',
    '/help#faq',
    '/?ref=x',
  ];

  it.each(hrefs.flatMap((h) => [[h, 'en'] as const, [h, 'de'] as const]))(
    '%s in %s matches next-intl',
    (href, locale) => {
      expect(localizePath(href, locale)).toBe(getPathname({ href, locale }));
    }
  );

  it('leaves external links, hashes and a missing locale alone', () => {
    expect(localizePath('https://github.com/x', 'de')).toBe(
      'https://github.com/x'
    );
    expect(localizePath('//cdn.example.com/a', 'de')).toBe(
      '//cdn.example.com/a'
    );
    expect(localizePath('#main', 'de')).toBe('#main');
    expect(localizePath('/pricing')).toBe('/pricing');
  });

  it('stripLocale undoes it', () => {
    for (const href of ['/', '/pricing', '/docs/a/b']) {
      expect(stripLocale(localizePath(href, 'de'), 'de')).toBe(href);
      expect(stripLocale(localizePath(href, 'en'), 'en')).toBe(href);
    }
  });
});

describe('clientOnly', () => {
  function Loaded({ word }: { word: string }) {
    return <p>{word}</p>;
  }
  const Lazy = clientOnly(
    () => Promise.resolve({ default: Loaded }),
    <span>waiting</span>
  );

  it('renders only the fallback on the server', () => {
    expect(renderToString(<Lazy word="loaded" />)).toBe('<span>waiting</span>');
  });

  it('loads the component in the browser', async () => {
    render(<Lazy word="loaded" />);
    expect(await screen.findByText('loaded')).toBeInTheDocument();
  });
});

describe('global error page', () => {
  it('draws Button’s classes and lucide’s icons without importing them', async () => {
    const { default: GlobalError } = await import('@/app/global-error');
    const html = renderToStaticMarkup(
      <GlobalError error={new Error('boom')} reset={() => {}} />
    );
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.querySelector('button')?.getAttribute('class')).toBe(
      cn(buttonVariants())
    );
    expect(html).toContain(
      renderToStaticMarkup(
        <lucide.AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
      )
    );
    expect(html).toContain(
      renderToStaticMarkup(<lucide.RefreshCw className="mr-2 h-4 w-4" />)
    );
  });
});

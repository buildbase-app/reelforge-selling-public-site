import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorCopyProvider } from '@/components/error-view';
import { SkipLink } from '@/components/skip-link';
import {
  locales,
  defaultLocale,
  isRtlLocale,
  getOgLocale,
  getAlternateOgLocales,
  type Locale,
} from '@/i18n/config';
import { isNoindexSite, siteUrl } from '@/env';
import { siteConfig } from '@/config/site';
import '@buildbase/sdk/css';

const baseUrl = siteUrl;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  const currentPath = locale === defaultLocale ? '' : `/${locale}`;
  const canonicalUrl = `${baseUrl}${currentPath}`;

  // Get localized content for social sharing
  const title = t('meta.title');
  const description = t('meta.description');

  // The share images from the RenderWeld brand kit (studio docs/brand):
  // Open Graph 1200x630 and the X card 1200x675.
  const ogImageUrl = `${baseUrl}/og.png`;
  const twitterImageUrl = `${baseUrl}/twitter-card.png`;
  const imageAlt =
    'RenderWeld: Agents write the manifest. RenderWeld renders the video.';

  // hreflang alternates only for the languages the site serves, and only
  // when there is more than one (English only today: none).
  const languages: Record<string, string> = {};
  if (locales.length > 1) {
    languages['x-default'] = baseUrl;
    for (const loc of locales) {
      const locPath = loc === defaultLocale ? '' : `/${loc}`;
      languages[loc] = `${baseUrl}${locPath}`;
    }
  }

  return {
    alternates: {
      canonical: canonicalUrl,
      ...(Object.keys(languages).length > 0 ? { languages } : {}),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: getOgLocale(locale as Locale),
      alternateLocale: getAlternateOgLocales(locale as Locale),
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: twitterImageUrl, alt: imageAlt }],
    },
    robots: {
      index: !isNoindexSite,
      follow: !isNoindexSite,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Lets next-intl read the locale from params instead of request headers,
  // so pages that also call it can be prerendered (and served statically on
  // Cloudflare, where MDX cannot be evaluated at request time).
  setRequestLocale(locale);

  const t = await getTranslations('errors.generic');
  // The CSP nonce for next-themes' inline script (src/proxy.ts).
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const isRtl = isRtlLocale(locale as Locale);

  return (
    <div lang={locale} dir={isRtl ? 'rtl' : 'ltr'} className="contents">
      {/* No BuildBase provider and no intl provider here (studio issue
          #79): the dashboard and the (store) pages get both from the (app)
          group layout; the (marketing) pages translate on the server and load
          tracking and sign-in on demand (MarketingShell). */}
      <ThemeProvider
        nonce={nonce}
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ErrorCopyProvider
          copy={{
            title: t('title'),
            description: t('description'),
            tryAgain: t('tryAgain'),
            goHome: t('goHome'),
          }}
        >
          <SkipLink />
          {children}
        </ErrorCopyProvider>
      </ThemeProvider>
    </div>
  );
}

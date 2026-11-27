import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/json-ld';
import { seoConfig } from '@/config/seo';
import { FontPreload, GEIST_CORE_URL } from '@/lib/fonts';
import { htmlLangAttributes } from '@/i18n/config';
import './globals.css';
// Geist and Geist Mono are self-hosted, so pages can preload them, and their
// variables are set on :root, where Tailwind resolves them (see the files).
import './geist.css';
import './geist-mono.css';

export const metadata: Metadata = {
  title: {
    default: seoConfig.brand.name,
    template: `%s | ${seoConfig.brand.name}`,
  },
  description: seoConfig.brand.description,
  ...(Object.values(seoConfig.verification).some(Boolean) && {
    verification: {
      ...(seoConfig.verification.google && {
        google: seoConfig.verification.google,
      }),
      ...(seoConfig.verification.bing && {
        other: { 'msvalidate.01': seoConfig.verification.bing },
      }),
      ...(seoConfig.verification.yandex && {
        yandex: seoConfig.verification.yandex,
      }),
    },
  }),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set by src/proxy.ts on every page request (see src/lib/security/csp.ts).
  const requestHeaders = await headers();
  const nonce = requestHeaders.get('x-nonce') ?? undefined;
  const isPrivatePage = requestHeaders.get('x-page-scope') === 'private';
  // The locale the proxy resolved for this request (default when none).
  const { lang, dir } = htmlLangAttributes(
    await getLocale().catch(() => undefined)
  );
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        {/* Geist sets every page's text (see src/lib/fonts.tsx). */}
        <FontPreload href={GEIST_CORE_URL} />
        {/* Ship or Die hackathon traffic verification, on public pages,
            before any cookie choice; disclosed under "Analytics and
            verification scripts" in src/content/pages/privacy/en.ts. Never
            on order or account pages, which show licence keys. The URL is
            not versioned, so it cannot carry an integrity hash. */}
        {!isPrivatePage && (
          <script
            defer
            nonce={nonce}
            src="https://www.ship-or-die.com/hackathon/verify.js"
            data-site="acd9464b4008fa9c064ce0868a60633db7128deb"
          />
        )}
        <meta
          name="theme-color"
          content="#f4f3ef"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#191b1f"
          media="(prefers-color-scheme: dark)"
        />
        {/* JSON-LD Structured Data */}
        <OrganizationJsonLd
          name={seoConfig.brand.name}
          description={seoConfig.brand.description}
          logo={seoConfig.brand.logo}
          sameAs={[...seoConfig.social.sameAs]}
          contactPoint={seoConfig.contactPoint}
        />
        <WebSiteJsonLd
          name={seoConfig.brand.name}
          description={seoConfig.brand.description}
        />
      </head>
      <body className="h-screen w-screen antialiased">{children}</body>
    </html>
  );
}

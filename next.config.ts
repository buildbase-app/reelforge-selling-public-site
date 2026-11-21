import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig, type SentryBuildOptions } from '@sentry/nextjs';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * The test copy (https://reelforge-dev.buildbase.app) must not be indexed.
 * NEXT_PUBLIC_SITE_URL is the dev URL in that build (`npm run deploy:dev`)
 * and the production URL otherwise (.env.production).
 */
const isNoindexSite = (process.env.NEXT_PUBLIC_SITE_URL ?? '').includes(
  'reelforge-dev'
);

const nextConfig: NextConfig = {
  // No `x-powered-by: Next.js` header.
  poweredByHeader: false,
  async headers() {
    return isNoindexSite
      ? [
          {
            source: '/:path*',
            headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
          },
        ]
      : [];
  },
  // Next.js externalises @prisma/client and traces the whole package, which
  // drags in the Prisma CLI, its dev server (PGlite) and query compilers for
  // every database. OpenNext bundles every traced .wasm into the Worker, which
  // pushed it past Cloudflare's 64 MiB limit. The app only needs the SQLite
  // compiler that the generated client (src/generated/prisma) ships itself.
  outputFileTracingExcludes: {
    '*': [
      'node_modules/prisma/**',
      'node_modules/@prisma/dev/**',
      'node_modules/@prisma/engines/**',
      'node_modules/@prisma/fetch-engine/**',
      'node_modules/@prisma/studio-core/**',
      'node_modules/@prisma/streams-local/**',
      'node_modules/@prisma/query-plan-executor/**',
      'node_modules/@electric-sql/**',
      'node_modules/@prisma/client/runtime/*.{cockroachdb,mysql,postgresql,sqlserver}.*',
      'node_modules/@prisma/client/runtime/*.{cockroachdb,mysql,postgresql,sqlserver}.wasm*',
    ],
  },
};

// Compose plugins: first intl, then bundle analyzer
const composedConfig = withBundleAnalyzer(withNextIntl(nextConfig));

// Only wrap with Sentry if DSN is configured. Leave NEXT_PUBLIC_SENTRY_DSN
// unset for Cloudflare Workers builds: @sentry/nextjs's server SDK targets
// Node.js and Vercel's edge runtime, not workerd (see DEPLOY_CLOUDFLARE.md).
const isSentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

// Sentry configuration options
const sentryConfig: SentryBuildOptions = {
  // Suppress source map upload logs
  silent: !process.env.CI,

  // Upload source maps for better stack traces
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Route browser requests to Sentry through a Next.js rewrite
  // to circumvent ad-blockers (optional)
  tunnelRoute: '/monitoring',

  // Source map options
  sourcemaps: {
    // Delete source maps after upload to hide them from clients
    deleteSourcemapsAfterUpload: true,
  },

  // Bundle size optimizations
  bundleSizeOptimizations: {
    // Tree-shake Sentry debug statements
    excludeDebugStatements: true,
  },

  // Webpack-specific options
  webpack: {
    // Enable component annotations for better error context
    reactComponentAnnotation: {
      enabled: true,
    },
    // Automatically instrument API routes
    autoInstrumentServerFunctions: true,
    autoInstrumentMiddleware: true,
    autoInstrumentAppDirectory: true,
  },
};

// Export with or without Sentry wrapper based on configuration
export default isSentryEnabled
  ? withSentryConfig(composedConfig, sentryConfig)
  : composedConfig;

// Gives `next dev` the Cloudflare bindings from wrangler.jsonc (a local D1
// for `DB`), so getCloudflareContext() works outside the Workers runtime.
initOpenNextCloudflareForDev();

import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * The web app manifest (served at /manifest.webmanifest), from the RenderWeld
 * brand kit's `web/site.webmanifest` (studio docs/brand): the app tile on
 * #191b1f, and a maskable icon whose mark sits inside the safe zone.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: 'Agents write the manifest. RenderWeld renders the video.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#191b1f',
    background_color: '#191b1f',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}

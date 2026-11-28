import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * /gallery/<slug> (studio issue #186): an unknown slug is a 404, also while
 * the gallery is not set up (no API token, no collection, an unreadable
 * read), and a missing setup is a warning, not a server error. The route has
 * no `generateStaticParams`: with none found at build time Next marked it
 * static, and the 404 then failed in a static render with a 500.
 */

const content = vi.hoisted(() => ({
  hasContentApi: vi.fn(() => false),
  getCollectionRecords: vi.fn(async (): Promise<unknown[]> => []),
}));
const log = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));
vi.mock('@/i18n/link', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('next-intl/server', () => ({ setRequestLocale: vi.fn() }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
  },
}));
vi.mock('@/lib/logger', () => ({ logger: log }));
vi.mock('@/lib/platform/content', () => content);

const record = {
  data: {
    slug: 'city-data',
    title: 'City data',
    category: 'Data story',
    engines: ['remotion'],
    durationSeconds: 16,
    frames: 480,
    fps: 30,
    prompt: 'Make a reel about the city.',
    posterPath: 'gallery/city-data/poster.0123456789ab.jpg',
    posterAvifPath: 'gallery/city-data/poster.0123456789ab.avif',
    mp4Path: 'gallery/city-data/city-data.0123456789ab.mp4',
    webmPath: 'gallery/city-data/city-data.0123456789ab.webm',
    status: 'published',
  },
};

async function loadPage() {
  vi.resetModules();
  return import('@/app/[locale]/(marketing)/gallery/[slug]/page');
}

function params(slug: string) {
  return { params: Promise.resolve({ locale: 'en', slug }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  content.hasContentApi.mockReturnValue(false);
  content.getCollectionRecords.mockResolvedValue([]);
});

describe('/gallery/<slug>', () => {
  it('is rendered on request, not prerendered from an empty build-time list', async () => {
    const mod = await loadPage();
    expect('generateStaticParams' in mod).toBe(false);
  });

  it('is a 404 while the gallery is not configured, with one warning and no error', async () => {
    const { default: ReelPage, generateMetadata } = await loadPage();
    await expect(ReelPage(params('does-not-exist'))).rejects.toThrow(
      'NEXT_HTTP_ERROR_FALLBACK;404'
    );
    await expect(ReelPage(params('city-data'))).rejects.toThrow(/404/);
    await expect(generateMetadata(params('does-not-exist'))).resolves.toEqual({
      title: 'Reel not found',
    });
    expect(content.getCollectionRecords).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(log.warn.mock.calls[0]![0]).toMatch(/BUILDBASE_API_TOKEN/);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('is a 404 when the collection read fails, with a warning', async () => {
    content.hasContentApi.mockReturnValue(true);
    content.getCollectionRecords.mockRejectedValue(new Error('R2 not set up'));
    const { default: ReelPage } = await loadPage();
    await expect(ReelPage(params('city-data'))).rejects.toThrow(/404/);
    expect(log.warn).toHaveBeenCalledWith(
      'Gallery: the collection could not be read',
      { error: 'R2 not set up' }
    );
    expect(log.error).not.toHaveBeenCalled();
  });

  it('is a 404 for a slug that is not in the collection or is not a slug', async () => {
    content.hasContentApi.mockReturnValue(true);
    content.getCollectionRecords.mockResolvedValue([record]);
    const { default: ReelPage } = await loadPage();
    await expect(ReelPage(params('does-not-exist'))).rejects.toThrow(/404/);
    await expect(ReelPage(params('../etc/passwd'))).rejects.toThrow(/404/);
    expect(content.getCollectionRecords).toHaveBeenCalledTimes(1);
  });

  it('renders a reel that exists', async () => {
    content.hasContentApi.mockReturnValue(true);
    content.getCollectionRecords.mockResolvedValue([record]);
    const { default: ReelPage } = await loadPage();
    render(await ReelPage(params('city-data')));
    expect(
      screen.getByRole('heading', { level: 1, name: 'City data' })
    ).toBeInTheDocument();
    expect(screen.getByRole('blockquote')).toHaveTextContent(
      'Make a reel about the city.'
    );
  });

  it('names RenderWeld and says plainly what the facts and the preview are', async () => {
    content.hasContentApi.mockReturnValue(true);
    content.getCollectionRecords.mockResolvedValue([record]);
    const { default: ReelPage } = await loadPage();
    const { container } = render(await ReelPage(params('city-data')));
    const text = container.textContent ?? '';
    expect(text).toContain('and RenderWeld rendered it');
    expect(text).toContain(
      "These facts come from RenderWeld's own render report"
    );
    expect(text).toContain(
      'Preview: 720×1280 without sound. The full render is 1080×1920 with music.'
    );
    expect(text).toContain('Connect your agent to your RenderWeld server');
    expect(text).not.toMatch(/\bstudio\b|No AI agent planned|Web copy/i);
    expect(
      screen.getByRole('button', { name: 'Copy the prompt for: City data' })
    ).toBeInTheDocument();
  });
});

describe('/gallery', () => {
  it('opens with the plain intro that names RenderWeld', async () => {
    vi.resetModules();
    const { default: GalleryPage } =
      await import('@/app/[locale]/(marketing)/gallery/page');
    const { container } = render(
      await GalleryPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({}),
      })
    );
    expect(container.textContent).toContain(
      'We wrote the plan for each reel and sent it to RenderWeld the same way your agent would. Open one to see how it was made, copy its plan, or give the matching prompt to your own agent.'
    );
  });
});

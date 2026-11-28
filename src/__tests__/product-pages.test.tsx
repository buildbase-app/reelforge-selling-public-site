import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * The homepage story sections and the /agents page render their key
 * content, every footnote marker has its note, and none of it says
 * "open source".
 */

vi.mock('server-only', () => ({}));
vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));
vi.mock('@/i18n/link', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('next-intl/server', () => ({ setRequestLocale: vi.fn() }));
vi.mock('@/lib/platform/faqs', () => ({
  getFaqSection: vi.fn().mockResolvedValue({
    collection: 'agents-faq',
    source: 'default',
    items: [
      {
        id: 'which-agents',
        question: 'Which AI agents can drive ReelForge?',
        html: '<p>Any MCP client.</p>',
        text: 'Any MCP client.',
      },
    ],
  }),
}));

import {
  AgentTranscript,
  ConnectAgent,
  Engines,
  EnterpriseStrip,
  FinalCta,
  Footnotes,
  Formats,
  Hero,
  HowItWorks,
  NumbersBand,
  Privacy,
  ReelGallery,
  ReelMarquee,
} from '@/components/product/home-sections';
import AgentsPage from '@/app/[locale]/(marketing)/agents/page';

// jsdom has no media playback.
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
});
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});
import { reels, toolCatalog } from '@/lib/agents/catalog';
import {
  agentsVideoSlugs,
  heroDemoShown,
  showcaseReels,
} from '@/lib/gallery/showcase';

function Home() {
  return (
    <div>
      <Hero heading="Your agent directs." ctas={<button>Join</button>} />
      <ReelMarquee />
      <Formats />
      <AgentTranscript />
      <HowItWorks />
      <ConnectAgent tabs={<div />} />
      <Engines />
      <ReelGallery />
      <NumbersBand />
      <Privacy />
      <EnterpriseStrip />
      <FinalCta ctas={<button>Join</button>} />
      <Footnotes />
    </div>
  );
}

function footnotesResolve(container: HTMLElement) {
  const refs = [...container.querySelectorAll('a[href^="#fn-"]')].map((a) =>
    a.getAttribute('href')
  );
  expect(refs.length).toBeGreaterThan(0);
  for (const ref of new Set(refs))
    expect(container.querySelector(ref!), ref!).not.toBeNull();
}

describe('homepage sections', () => {
  it('shows the promise, the real reels and the tool count', () => {
    const { container } = render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Your agent directs.'
    );
    // The hero demo and the showcase rail follow the gallery bar (studio
    // issue #807); the agent transcript's reel is always there.
    const showcased = showcaseReels();
    expect(container.querySelectorAll('video').length).toBe(
      (heroDemoShown() ? 1 : 0) + 1 + showcased.length
    );
    for (const reel of showcased)
      expect(container.textContent).toContain(reel.prompt);
    expect(container.textContent).toContain(String(toolCatalog.count));
    for (const engine of [
      'Remotion',
      'Motion Canvas',
      'HTML and CSS',
      'HyperFrames',
    ])
      expect(
        screen.getByRole('heading', { level: 3, name: new RegExp(engine) })
      ).toBeInTheDocument();
  });

  it('plays reels muted, inline, with a pause control and a text alternative', () => {
    const { container } = render(<Home />);
    const players = container.querySelectorAll('video');
    for (const video of players) {
      expect(video.muted).toBe(true);
      expect(video).toHaveAttribute('playsinline');
      expect(video.getAttribute('aria-label')).toMatch(
        /On screen: |recorded session/
      );
    }
    expect(
      screen.getAllByRole('button', { name: /Play reel|Pause reel/ })
    ).toHaveLength(players.length);
  });

  it('hides the hero session while it is below the gallery bar', () => {
    expect(heroDemoShown()).toBe(false);
    const { container } = render(
      <Hero heading="Your agent directs." ctas={<button>Join</button>} />
    );
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('figure')).toBeNull();
    expect(container.querySelector('code')).toHaveTextContent(
      'make a 9-second reel that mixes all four engines'
    );
  });

  it('shows a real agent session in the hero, with the prompt as a chip', () => {
    const { container } = render(
      <Hero
        heading="Your agent directs."
        ctas={<button>Join</button>}
        showDemo
      />
    );
    const video = container.querySelector('video')!;
    expect(video).not.toHaveAttribute('autoplay');
    expect(video.getAttribute('aria-label')).toMatch(/recorded session/);
    for (const source of video.querySelectorAll('source'))
      expect(source.getAttribute('src')).toMatch(/^\/walkthroughs\//);
    const poster = container.querySelector('picture img')!;
    expect(poster).toHaveAttribute('fetchpriority', 'high');
    expect(poster).toHaveAttribute('loading', 'eager');
    expect(container.querySelector('code')).toHaveTextContent(
      'make a 9-second reel that mixes all four engines'
    );
  });

  it('draws the formats guide sizes to scale, welded at every joint', () => {
    const { container } = render(<Formats />);
    for (const size of [
      '1080×1920',
      '1080×1350',
      '1080×1080',
      '1920×1080',
      '2560×1080',
    ])
      expect(container.textContent).toContain(size);
    // One row of five on wide screens, rows of three and two on phones:
    // a weld at each of the 4 + 2 + 1 joints.
    expect(container.querySelectorAll('.rf-frame-weld')).toHaveLength(7);
    for (const format of ['ProRes', 'WebM', 'GIF', 'PNG sequence', 'WAV'])
      expect(container.textContent).toContain(format);
  });

  it('never shows the old product name', () => {
    const { container } = render(<Home />);
    expect(container.textContent).not.toMatch(/Formerly ReelForge/i);
    expect(
      container.querySelector('a[href$="renamed-from-reelforge.md"]')
    ).toBeNull();
  });

  it('gives every measured number its conditions', () => {
    const { container } = render(<NumbersBand />);
    expect(container.textContent).toMatch(/Lower bounds from a shared/);
    expect(container.textContent).toMatch(/Not measured yet/);
  });

  it('lists the MCP calls that made the hero reel, in order', () => {
    render(<AgentTranscript />);
    const list = screen.getByRole('list', { name: 'MCP calls, in order' });
    const text = within(list)
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(text.some((t) => t?.includes('render_project'))).toBe(true);
    expect(text.at(-1)).toContain('get_render_output');
  });

  it('resolves every footnote marker', () => {
    const { container } = render(<Home />);
    footnotesResolve(container);
  });

  it('never says "open source" and keeps Personal-first copy', () => {
    const { container } = render(<Home />);
    expect(container.textContent).not.toMatch(/open[\s_-]*source/i);
    expect(container.textContent).toMatch(/Free for personal use/);
  });
});

describe('/agents', () => {
  it('renders the tabs, the cookbook, every tool and the FAQ', async () => {
    const page = await AgentsPage({
      params: Promise.resolve({ locale: 'en' }),
    });
    const { container } = render(page);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Your agent drives.'
    );
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    for (const reel of reels)
      expect(container.textContent).toContain(reel.prompt);
    for (const group of toolCatalog.groups)
      for (const tool of group.tools)
        expect(
          screen.getByText(tool.name, { selector: 'code' })
        ).toBeInTheDocument();
    expect(container.textContent).toContain(
      'Which AI agents can drive ReelForge?'
    );
    expect(container.textContent).not.toMatch(/open[\s_-]*source/i);
    footnotesResolve(container);
  });

  it('shows a cookbook video only for a reel that meets the gallery bar', async () => {
    const page = await AgentsPage({
      params: Promise.resolve({ locale: 'en' }),
    });
    const { container } = render(page);
    const shown = agentsVideoSlugs();
    expect(container.querySelectorAll('video').length).toBe(shown.size);
    if (shown.size === 0) {
      expect(container.querySelector('#fn-1')).toBeNull();
      expect(container.querySelector('a[href="#fn-1"]')).toBeNull();
    }
  });
});

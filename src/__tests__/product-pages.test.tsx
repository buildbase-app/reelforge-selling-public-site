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
  siteUrl: 'https://reelforge.buildbase.app',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));
vi.mock('@/i18n/routing', () => ({
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
  Hero,
  HowItWorks,
  LocalNav,
  NumbersBand,
  Privacy,
  ReelGallery,
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

function Home() {
  return (
    <div>
      <LocalNav onSale={false} />
      <Hero heading="Your agent directs." ctas={<button>Join</button>} />
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
    expect(container.querySelectorAll('video').length).toBe(
      1 + 1 + reels.length
    );
    for (const reel of reels)
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
    for (const video of container.querySelectorAll('video')) {
      expect(video.muted).toBe(true);
      expect(video).toHaveAttribute('playsinline');
      expect(video.getAttribute('aria-label')).toMatch(/On screen: /);
    }
    expect(
      screen.getAllByRole('button', { name: /Play reel|Pause reel/ })
    ).toHaveLength(container.querySelectorAll('video').length);
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
});

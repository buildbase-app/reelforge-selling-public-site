// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/env', () => ({
  env: {},
  siteUrl: 'https://renderweld.com',
  isNoindexSite: false,
  buildbaseEnvironment: undefined,
}));

import { reels, toolCatalog, toolCatalogSource } from '@/lib/agents/catalog';
import { AGENT_CLIENTS } from '@/lib/agents/snippets';
import { buildAgentsMarkdown } from '@/lib/agents/markdown';
import { agentsVideoSlugs } from '@/lib/gallery/showcase';

/**
 * The generated data behind / and /agents stays honest: the tool list is the
 * studio's own (grouped, nothing dropped), the reels are real files of a
 * size the homepage budget allows, and the agent snippets carry only
 * placeholders and say what was checked.
 */

const PUBLIC = join(__dirname, '..', '..', 'public');

describe('MCP tool catalog', () => {
  const names = toolCatalog.groups.flatMap((g) => g.tools.map((t) => t.name));

  it('lists every tool the studio served, once, in a named group', () => {
    expect(toolCatalog.count).toBe(names.length);
    expect(new Set(names).size).toBe(names.length);
    expect(toolCatalog.groups.map((g) => g.id)).not.toContain('other');
    expect(['reference', 'tools/list']).toContain(toolCatalog.source.method);
  });

  it('says where the count comes from', () => {
    const { source } = toolCatalog;
    if (source.method === 'reference') {
      expect(source.reference).toBe('docs/public/mcp/tools.md');
      expect(source.commit).toMatch(/^[0-9a-f]{40}$/);
    }
    expect(source.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(source.fetchedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(toolCatalogSource()).toContain(source.fetchedOn);
    // No file paths or commit ids in sales copy (studio issue #537).
    expect(toolCatalogSource()).not.toMatch(/\.md\b|commit|[0-9a-f]{7,}/);
  });

  // The count drifts when copy states it (studio issue #251: the site kept an
  // old count after the studio added the webhook tools). Pages read
  // toolCatalog.count; `npm run check:mcp-tools` compares the catalog with
  // the studio's generated reference.
  it('is the only place a tool count is written down', () => {
    const SRC = join(__dirname, '..');
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, name.name);
        if (name.isDirectory()) {
          if (name.name !== '__tests__' && name.name !== 'data') walk(path);
        } else if (/\.(tsx?|mdx?)$/.test(name.name)) {
          const text = readFileSync(path, 'utf8');
          for (const m of text.matchAll(/\b\d{2,3}\+? (?:MCP )?tools\b/g))
            hits.push(`${path}: ${m[0]}`);
        }
      }
    };
    walk(SRC);
    expect(hits).toEqual([]);
  });

  it('gives every tool a summary', () => {
    for (const group of toolCatalog.groups)
      for (const tool of group.tools)
        expect(tool.summary.length).toBeGreaterThan(10);
  });

  it('includes the core workflow tools', () => {
    for (const name of [
      'get_capabilities',
      'create_project',
      'add_scene',
      'validate_project',
      'render_project',
      'get_job',
      'get_render_output',
    ])
      expect(names).toContain(name);
  });
});

describe('demo reels', () => {
  it('has real, small web files for every reel', () => {
    expect(reels.length).toBeGreaterThanOrEqual(1);
    for (const reel of reels) {
      for (const [kind, value] of Object.entries(reel.files)) {
        if (typeof value !== 'string') continue;
        // A `srcset` value lists several posters: check each one.
        const paths = kind.endsWith('SrcSet')
          ? value.split(',').map((s) => s.trim().split(' ')[0]!)
          : [value];
        for (const path of paths) {
          const file = join(PUBLIC, path);
          expect(existsSync(file), path).toBe(true);
          const max = kind === 'mp4' || kind === 'webm' ? 1.5e6 : 60e3;
          expect(statSync(file).size, path).toBeLessThan(max);
        }
      }
    }
  });

  it('carries the render facts from the studio', () => {
    for (const reel of reels) {
      expect(reel.output).toMatchObject({ width: 1080, height: 1920, fps: 30 });
      expect(reel.renderSeconds).toBeGreaterThan(0);
      expect(reel.versions.studio).toMatch(/^\d+\.\d+\.\d+$/);
      expect(Object.values(reel.checks).every((v) => v === 'pass')).toBe(true);
      expect(reel.toolCalls.map((c) => c.tool)).toContain('render_project');
    }
  });
});

describe('agent snippets', () => {
  it('covers Claude Code, Codex, generic MCP and REST, and no untested client', () => {
    expect(AGENT_CLIENTS.map((c) => c.id)).toEqual([
      'claude-code',
      'codex',
      'mcp-json',
      'rest',
    ]);
    expect(JSON.stringify(AGENT_CLIENTS)).not.toMatch(/cursor/i);
  });

  it('uses placeholders, never a real key', () => {
    for (const client of AGENT_CLIENTS) {
      expect(client.checked.length).toBeGreaterThan(20);
      for (const snippet of client.snippets) {
        const keys = snippet.code.match(/rf_[A-Za-z0-9_-]*/g) ?? [];
        for (const key of keys) expect(key).toBe('rf_');
      }
    }
  });
});

describe('/agents.md', () => {
  const md = buildAgentsMarkdown();

  it('has every client, recipe and tool', () => {
    for (const client of AGENT_CLIENTS)
      expect(md).toContain(`### ${client.name}`);
    for (const reel of reels) expect(md).toContain(reel.prompt);
    for (const group of toolCatalog.groups)
      for (const tool of group.tools) expect(md).toContain(`\`${tool.name}\``);
  });

  it('never says "open source"', () => {
    expect(md).not.toMatch(/open[\s_-]*source/i);
  });

  it('lists a video only for a recipe whose reel meets the gallery bar', () => {
    const shown = agentsVideoSlugs();
    for (const reel of reels)
      expect(md.includes(reel.files.mp4)).toBe(shown.has(reel.slug));
  });
});

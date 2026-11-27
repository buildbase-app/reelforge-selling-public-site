import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentTabs } from '@/components/product/agent-tabs';
import { AGENT_CLIENTS } from '@/lib/agents/snippets';

/**
 * The connect-your-agent tabs: keyboard tabs (WAI-ARIA), every snippet in
 * the HTML, and copy buttons that copy and count the goal.
 */

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
});

describe('AgentTabs', () => {
  it('renders one tab and one panel per client, first selected', () => {
    render(<AgentTabs clients={AGENT_CLIENTS} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual([
      'Claude Code',
      'Codex',
      'Any MCP client',
      'REST',
    ]);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    // Inactive panels are hidden but still in the document (crawlable).
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(4);
    expect(document.body.textContent).toContain('codex mcp add renderweld');
  });

  it('moves between tabs with the arrow keys, Home and End', () => {
    render(<AgentTabs clients={AGENT_CLIENTS} />);
    const list = screen.getByRole('tablist');
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Codex' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'Codex' })).toHaveFocus();
    fireEvent.keyDown(list, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'REST' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Claude Code' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'REST' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('copies the snippet and tracks copy_agent_snippet', async () => {
    render(<AgentTabs clients={AGENT_CLIENTS} />);
    const button = screen.getByRole('button', {
      name: /Copy the Claude Code snippet/,
    });
    expect(button).toHaveAttribute('data-bb-goal', 'copy_agent_snippet');
    expect(button).toHaveAttribute('data-bb-goal-client', 'claude-code');
    await act(async () => {
      fireEvent.click(button);
    });
    expect(writeText).toHaveBeenCalledWith(AGENT_CLIENTS[0].snippets[0].code);
    expect(button).toHaveTextContent('Copied');
  });

  it('shows what was checked on /agents', () => {
    render(<AgentTabs clients={AGENT_CLIENTS} showChecked />);
    expect(screen.getAllByText(/What we checked/)).toHaveLength(4);
  });
});

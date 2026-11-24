'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { AgentClient } from '@/lib/agents/snippets';
import { CopyButton } from './copy-button';

/**
 * "Connect your agent": one tab per client (WAI-ARIA tabs: arrow keys,
 * Home and End move between tabs). Every panel is in the server HTML; the
 * inactive ones are `hidden`, so crawlers and no-JS visitors still get every
 * snippet. Copy buttons count the `copy_agent_snippet` goal per client.
 */
export function AgentTabs({
  clients,
  showChecked = false,
}: {
  clients: AgentClient[];
  /** Show what was checked for each client (on /agents). */
  showChecked?: boolean;
}) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const n = clients.length;
    const next =
      e.key === 'ArrowRight'
        ? (active + 1) % n
        : e.key === 'ArrowLeft'
          ? (active + n - 1) % n
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? n - 1
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="rf-window overflow-hidden text-left">
      <div
        role="tablist"
        aria-label="Agent clients"
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-white/10 p-2"
      >
        {clients.map((client, i) => (
          <button
            key={client.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${client.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${client.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={
              i === active
                ? 'bg-stage-text text-stage shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium'
                : 'text-stage-muted hover:text-stage-text shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium'
            }
          >
            {client.name}
          </button>
        ))}
      </div>
      {clients.map((client, i) => (
        <div
          key={client.id}
          role="tabpanel"
          id={`${base}-panel-${client.id}`}
          aria-labelledby={`${base}-tab-${client.id}`}
          hidden={i !== active}
          tabIndex={0}
          className="space-y-4 p-4 md:p-6"
        >
          <p className="text-stage-muted text-sm">{client.summary}</p>
          {client.snippets.map((snippet) => (
            <figure key={snippet.label} className="min-w-0">
              <figcaption className="mb-2 flex items-center justify-between gap-3">
                <span className="text-stage-muted font-mono text-xs">
                  {snippet.label}
                </span>
                <CopyButton
                  text={snippet.code}
                  goal="copy_agent_snippet"
                  goalProps={{ client: client.id }}
                  ariaLabel={`Copy the ${client.name} snippet: ${snippet.label}`}
                />
              </figcaption>
              <pre
                tabIndex={0}
                className="text-stage-text bg-stage overflow-x-auto rounded-lg p-4 font-mono text-[13px] leading-relaxed"
              >
                <code>{snippet.code}</code>
              </pre>
            </figure>
          ))}
          {showChecked ? (
            <p className="text-stage-muted text-xs">
              <span className="text-stage-text font-medium">
                What we checked:{' '}
              </span>
              {client.checked}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

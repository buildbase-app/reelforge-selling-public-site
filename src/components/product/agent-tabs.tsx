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
    const last = clients.length - 1;
    const next =
      e.key === 'ArrowRight'
        ? active === last
          ? 0
          : active + 1
        : e.key === 'ArrowLeft'
          ? active === 0
            ? last
            : active - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
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
                ? 'shrink-0 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#0b0b14]'
                : 'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium text-white/75 hover:text-white'
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
          <p className="text-sm text-[#c9c9d6]">{client.summary}</p>
          {client.snippets.map((snippet) => (
            <figure key={snippet.label} className="min-w-0">
              <figcaption className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-[#c9c9d6]">
                  {snippet.label}
                </span>
                <CopyButton
                  text={snippet.code}
                  goal="copy_agent_snippet"
                  goalProps={{ client: client.id }}
                  ariaLabel={`Copy the ${client.name} snippet: ${snippet.label}`}
                />
              </figcaption>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-[13px] leading-relaxed text-[#f5f5f7]">
                <code>{snippet.code}</code>
              </pre>
            </figure>
          ))}
          {showChecked ? (
            <p className="text-xs text-[#c9c9d6]">
              <span className="font-semibold text-[#00d1b2]">
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

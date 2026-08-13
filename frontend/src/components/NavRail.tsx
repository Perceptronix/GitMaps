'use client';

/**
 * NavRail — collapsible left navigation (AlphaXiv-style icon rail).
 * Collapsed by default (48px), expands to 220px on hover / toggle.
 */
import { useState } from 'react';
import { MapIcon, Search, TrendingUp, Github, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export type View = 'map' | 'search' | 'trending';

interface NavRailProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NAV_ITEMS: { id: View; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'map',      label: 'Explore',  Icon: (p) => <MapIcon {...p} /> },
  { id: 'search',   label: 'Search',   Icon: (p) => <Search {...p} /> },
  { id: 'trending', label: 'Trending', Icon: (p) => <TrendingUp {...p} /> },
];

export function NavRail({ currentView, onViewChange }: NavRailProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{
        width: expanded ? 'var(--nav-expanded-w)' : 'var(--nav-rail-w)',
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo / toggle row */}
      <div
        className="flex items-center gap-3 overflow-hidden px-3 py-4"
        style={{ minHeight: 56 }}
      >
        {/* Icon — always visible */}
        <button
          onClick={() => setExpanded(e => !e)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="flex size-[30px] shrink-0 items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--custom-accent)' }}
        >
          {expanded
            ? <PanelLeftClose className="size-5" />
            : <PanelLeftOpen className="size-5" />
          }
        </button>

        {/* Brand name — fades in when expanded */}
        <span
          className="whitespace-nowrap text-base font-bold transition-opacity duration-200"
          style={{
            color: 'var(--custom-accent)',
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? 'auto' : 'none',
          }}
        >
          GitMaps
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-2 py-2" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              aria-current={active ? 'page' : undefined}
              className="flex items-center gap-3 overflow-hidden rounded-full px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: active ? 'var(--custom-accent-dim)' : 'transparent',
                color: active ? 'var(--custom-accent)' : 'var(--subtext)',
                minHeight: 40,
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)';
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Icon className="size-5 shrink-0" />
              <span
                className="whitespace-nowrap transition-opacity duration-200"
                style={{ opacity: expanded ? 1 : 0 }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom — GitHub link */}
      <div className="mt-auto px-2 py-4">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="flex items-center gap-3 overflow-hidden rounded-full px-3 py-2.5 transition-colors"
          style={{ color: 'var(--subtext)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Github className="size-5 shrink-0" />
          <span
            className="whitespace-nowrap text-xs transition-opacity duration-200"
            style={{ opacity: expanded ? 1 : 0 }}
          >
            AI-powered GitHub intel
          </span>
        </a>
      </div>
    </aside>
  );
}

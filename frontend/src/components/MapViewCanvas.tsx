/**
 * MapViewCanvas — AlphaXiv-style canvas map for GitMaps.
 *
 * Overlays (all absolutely positioned over the canvas):
 *  - top-center:  "GitMaps · Semantic Map" title pill
 *  - top-right:   Live indicator — repo/cluster count, refresh status, countdown
 *  - bottom-left: Collapsible domains panel
 *  - bottom-center: Search bar (rounded-full)
 *  - cursor:      Hover card
 *  - bottom-right: "N new repos" toast when data refreshes
 */
'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { Search, X, ChevronUp, RefreshCw, GitBranch, Layers } from 'lucide-react';
import type { ClusterPosition, DomainCentroid, RepoMapPosition } from '@/lib/types';
import { useMapEngine } from '@/hooks/useMapEngine';
import type { HoveredPointState } from '@/hooks/useMapEngine';
import { hueToOklch, getDomainHue } from '@/utils/mapColors';

interface MapViewCanvasProps {
  clusters: ClusterPosition[];
  repos: RepoMapPosition[];
  domainCentroids: DomainCentroid[];
  onRepoClick: (repoId: number) => void;
  onRepoHover: (repo: { id: number; x: number; y: number } | null) => void;
  hoveredRepo: { id: number; x: number; y: number } | null;
  filterDomains: string[];
  filterClusters: number[];
  onFlyToDomainRegister?: (fn: (domain: string) => void) => void;
  // Live data props
  repoCount: number;
  clusterCount: number;
  isRefreshing: boolean;
  lastUpdatedAt: Date | null;
  newReposDelta: number;
  onDeltaDismiss: () => void;
  refreshIntervalMs: number;
}

export function MapViewCanvas({
  clusters,
  repos,
  domainCentroids,
  onRepoClick,
  onRepoHover,
  filterDomains,
  filterClusters,
  onFlyToDomainRegister,
  repoCount,
  clusterCount,
  isRefreshing,
  lastUpdatedAt,
  newReposDelta,
  onDeltaDismiss,
  refreshIntervalMs,
}: MapViewCanvasProps) {
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const flyRef = useRef<((domain: string) => void) | null>(null);

  const { canvasRef, searchQuery, setSearchQuery, matchCount, flyToDomain, hoveredPoint } =
    useMapEngine({
      repos,
      domainCentroids,
      clusters,
      filterDomains,
      filterClusters,
      onRepoClick,
      onRepoHover,
    });

  flyRef.current = flyToDomain;
  if (onFlyToDomainRegister) onFlyToDomainRegister(flyToDomain);

  const handleFlyToDomain = useCallback((domain: string) => {
    flyRef.current?.(domain);
    setFieldsOpen(false);
  }, []);

  const hasSearch = searchQuery.length > 0;
  const sortedDomains = [...domainCentroids].sort((a, b) => b.cluster_count - a.cluster_count);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Canvas ── */}
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        className="absolute inset-0 w-full h-full"
        aria-label="GitMaps semantic repository map — drag to pan, scroll to zoom"
        role="img"
      />

      {/* ── Title pill (top-center) ── */}
      <div
        className="map-panel absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full px-5 py-2 text-sm font-semibold select-none pointer-events-none"
        style={{ color: 'var(--text)' }}
      >
        <span style={{ color: 'var(--custom-accent)' }}>GitMaps</span>
        {'\u00a0\u00b7 Semantic Map'}
      </div>

      {/* ── Live indicator (top-right) ── */}
      <LiveIndicator
        repoCount={repoCount}
        clusterCount={clusterCount}
        isRefreshing={isRefreshing}
        lastUpdatedAt={lastUpdatedAt}
        refreshIntervalMs={refreshIntervalMs}
      />

      {/* ── Hover card ── */}
      {hoveredPoint && <HoverCard point={hoveredPoint} />}

      {/* ── Domains panel (bottom-left) ── */}
      {sortedDomains.length > 0 && (
        <FieldsPanel
          domains={sortedDomains}
          filterDomains={filterDomains}
          open={fieldsOpen}
          onToggle={() => setFieldsOpen(o => !o)}
          onFlyTo={handleFlyToDomain}
        />
      )}

      {/* ── Search bar (bottom-center) ── */}
      <div
        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
        style={{ width: 'min(90vw, 460px)' }}
        role="search"
      >
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none"
            style={{ color: 'var(--subtext)' }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search repos, domains, topics\u2026"
            autoComplete="off"
            aria-label="Search repositories on map"
            className="map-panel w-full rounded-full py-3 pl-10 pr-10 text-sm outline-none transition-[border-color]"
            style={{ color: 'var(--text)', caretColor: 'var(--custom-accent)' }}
            onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--custom-accent)'; }}
            onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = ''; }}
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-opacity hover:opacity-100 opacity-60"
              style={{ color: 'var(--subtext)' }}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        {hasSearch && (
          <p
            className="mt-1.5 text-center text-xs animate-fade-in"
            style={{ color: 'var(--subtext)' }}
          >
            {matchCount.toLocaleString()} of {repos.length.toLocaleString()} repos
          </p>
        )}
      </div>

      {/* ── New-repos toast (bottom-right) ── */}
      {newReposDelta !== 0 && (
        <RefreshToast delta={newReposDelta} onDismiss={onDeltaDismiss} />
      )}
    </div>
  );
}

/* ── Live Indicator ────────────────────────────────────────────────────────── */

interface LiveIndicatorProps {
  repoCount: number;
  clusterCount: number;
  isRefreshing: boolean;
  lastUpdatedAt: Date | null;
  refreshIntervalMs: number;
}

function LiveIndicator({
  repoCount,
  clusterCount,
  isRefreshing,
  lastUpdatedAt,
  refreshIntervalMs,
}: LiveIndicatorProps) {
  // Countdown progress: 0→1 over refreshIntervalMs since last update
  const [progress, setProgress] = useState(0);
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    if (!lastUpdatedAt) return;

    const tick = () => {
      const elapsed = Date.now() - lastUpdatedAt.getTime();
      setProgress(Math.min(elapsed / refreshIntervalMs, 1));

      // Human-readable relative time
      const secs = Math.floor(elapsed / 1000);
      if (secs < 10) setRelativeTime('just now');
      else if (secs < 60) setRelativeTime(`${secs}s ago`);
      else setRelativeTime(`${Math.floor(secs / 60)}m ago`);
    };

    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [lastUpdatedAt, refreshIntervalMs]);

  const fmt = (n: number) =>
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : String(n);

  // SVG countdown ring (32px, circumference ≈ 100 for easy maths)
  const CIRC = 100;
  const offset = isRefreshing ? 0 : progress * CIRC;

  return (
    <div
      className="map-panel absolute top-4 right-4 z-10 flex items-center gap-3 rounded-2xl px-3.5 py-2.5"
      aria-live="polite"
      aria-label="Live map status"
    >
      {/* Countdown ring + spinner */}
      <div className="relative flex items-center justify-center" style={{ width: 32, height: 32 }}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 36 36"
          className={isRefreshing ? 'animate-spin-slow' : ''}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            strokeWidth="2.5"
            stroke="rgba(255,255,255,0.08)"
          />
          {/* Progress arc */}
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            strokeWidth="2.5"
            stroke={isRefreshing ? 'var(--custom-accent)' : 'rgba(255,255,255,0.28)'}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform="rotate(-90 18 18)"
            style={{ transition: isRefreshing ? 'none' : 'stroke-dashoffset 5s linear' }}
          />
        </svg>
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isRefreshing
            ? <RefreshCw className="size-3" style={{ color: 'var(--custom-accent)' }} />
            : (
              <span
                className="animate-live-pulse size-2 rounded-full"
                style={{ background: 'var(--custom-accent)' }}
              />
            )
          }
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text)' }}>
            <GitBranch className="size-3" aria-hidden="true" />
            <span className="font-semibold tabular-nums">{fmt(repoCount)}</span>
            <span style={{ color: 'var(--subtext)' }}>repos</span>
          </span>
          <span
            className="h-3 w-px"
            style={{ background: 'var(--border)' }}
            aria-hidden="true"
          />
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text)' }}>
            <Layers className="size-3" aria-hidden="true" />
            <span className="font-semibold tabular-nums">{clusterCount}</span>
            <span style={{ color: 'var(--subtext)' }}>clusters</span>
          </span>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--subtext)' }}>
          {isRefreshing ? 'Refreshing…' : relativeTime ? `Updated ${relativeTime}` : 'Live'}
        </p>
      </div>
    </div>
  );
}

/* ── Refresh Toast ─────────────────────────────────────────────────────────── */

interface RefreshToastProps {
  delta: number;
  onDismiss: () => void;
}

function RefreshToast({ delta, onDismiss }: RefreshToastProps) {
  const [leaving, setLeaving] = useState(false);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDismiss, 200);
    }, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(onDismiss, 200);
  };

  const label = delta > 0
    ? `+${delta.toLocaleString()} new repo${delta === 1 ? '' : 's'} on the map`
    : `${Math.abs(delta).toLocaleString()} repo${Math.abs(delta) === 1 ? '' : 's'} removed`;

  return (
    <div
      className={`map-panel absolute bottom-20 right-4 z-20 flex items-center gap-3 rounded-2xl px-4 py-3 ${
        leaving ? 'animate-toast-out' : 'animate-toast-in'
      }`}
      role="status"
      aria-live="polite"
      style={{ maxWidth: 280 }}
    >
      {/* Accent dot */}
      <span
        className="size-2 flex-none rounded-full"
        style={{ background: delta > 0 ? 'var(--custom-accent)' : '#ef4444' }}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          Map updated
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--subtext)' }}>
          {label}
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex-none rounded-full p-1 transition-opacity opacity-50 hover:opacity-100"
        style={{ color: 'var(--subtext)' }}
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

/* ── Fields Panel ──────────────────────────────────────────────────────────── */

interface FieldsPanelProps {
  domains: DomainCentroid[];
  filterDomains: string[];
  open: boolean;
  onToggle: () => void;
  onFlyTo: (domain: string) => void;
}

function FieldsPanel({ domains, filterDomains, open, onToggle, onFlyTo }: FieldsPanelProps) {
  return (
    <div
      className="map-panel absolute bottom-4 left-4 z-10 overflow-hidden rounded-2xl transition-[width] duration-300 ease-in-out"
      style={{ width: open ? 260 : 40 }}
    >
      {/* Toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? 'Collapse domains' : 'Expand domains'}
        className="flex items-center gap-2 w-full transition-colors"
        style={{
          padding: open ? '10px 14px' : '0',
          height: open ? 'auto' : 40,
          justifyContent: open ? 'space-between' : 'center',
          color: 'var(--subtext)',
          background: 'transparent',
          minWidth: open ? '100%' : 40,
        }}
      >
        {open && (
          <span
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: 'var(--subtext)' }}
          >
            Domains
          </span>
        )}
        <ChevronUp
          className="size-4 flex-none transition-transform duration-300"
          style={{
            color: 'var(--subtext)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* List */}
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: open ? 380 : 0 }}
      >
        <div
          className="flex flex-col gap-px px-2 pb-2 overflow-y-auto scrollbar-hide"
          style={{ maxHeight: 360 }}
        >
          {domains.map((dc) => {
            const dotColor = hueToOklch(getDomainHue(dc.domain), true);
            const isActive = filterDomains.includes(dc.domain);
            return (
              <button
                key={dc.domain}
                type="button"
                onClick={() => onFlyTo(dc.domain)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 w-full text-left transition-colors"
                style={{ background: isActive ? 'var(--custom-accent-dim)' : 'transparent' }}
                onMouseEnter={e => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-overlay)';
                }}
                onMouseLeave={e => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <span
                  className="size-2.5 flex-none rounded-full"
                  style={{ background: dotColor }}
                  aria-hidden="true"
                />
                <span
                  className="flex-1 truncate text-[13px]"
                  style={{ color: 'var(--text)' }}
                >
                  {dc.domain}
                </span>
                <span
                  className="text-xs tabular-nums"
                  style={{ color: 'var(--subtext)' }}
                >
                  {dc.cluster_count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Hover Card ────────────────────────────────────────────────────────────── */

function HoverCard({ point }: { point: HoveredPointState }) {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `${(n / 1_000).toFixed(1)}k`
    : String(n);

  return (
    <div
      className="map-panel animate-fade-in rounded-2xl p-4 pointer-events-none"
      style={{
        position: 'absolute',
        left: point.screenX + 18,
        top: Math.max(10, point.screenY - 16),
        zIndex: 20,
        width: 264,
      }}
    >
      {/* Color stripe */}
      <div
        className="mb-3 h-0.5 w-12 rounded-full"
        style={{ background: point.color }}
        aria-hidden="true"
      />

      {/* Owner */}
      <p className="text-[11px] font-medium tracking-wide uppercase" style={{ color: 'var(--subtext)' }}>
        {point.owner}
      </p>

      {/* Name */}
      <p className="mt-0.5 text-sm font-semibold leading-snug" style={{ color: 'var(--text)' }}>
        {point.name}
      </p>

      {/* Domain tags */}
      {point.domains.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {point.domains.slice(0, 3).map(d => (
            <span
              key={d}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                background: 'var(--custom-accent-dim)',
                color: 'var(--custom-accent)',
              }}
            >
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Stars */}
      <div
        className="mt-2.5 flex items-center gap-1.5 text-xs"
        style={{ color: 'var(--subtext)' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span className="font-semibold tabular-nums" style={{ color: 'var(--text)' }}>
          {fmt(point.stars)}
        </span>
        <span>stars</span>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { ZoomTransform } from 'd3';
import type { ClusterPosition, RepoMapPosition } from '@/lib/types';

interface MapViewProps {
  clusters: ClusterPosition[];
  repos: RepoMapPosition[];
  onRepoClick: (repoId: number) => void;
  onRepoHover: (repo: { id: number; x: number; y: number } | null) => void;
  hoveredRepo: { id: number; x: number; y: number } | null;
  filterDomains: string[];
  filterClusters: number[];
}

// ── Domain color palette ──────────────────────────────────────────────────
const DOMAIN_COLORS: Record<string, string> = {
  'AI':       '#f59e0b',
  'Web':      '#10b981',
  'Mobile':   '#3b82f6',
  'DevOps':   '#8b5cf6',
  'Data':     '#ec4899',
  'Security': '#ef4444',
  'CLI':      '#06b6d4',
  'Library':  '#84cc16',
  'Systems':  '#f97316',
  'Science':  '#a78bfa',
};

const FALLBACK_COLORS = d3.schemeTableau10;
const DEFAULT_DOMAIN = 'Uncategorized';

/** Build a deterministic domain→color map from a sorted domain list. */
function buildColorMap(domains: string[]): Map<string, string> {
  const map = new Map<string, string>();
  let fallbackIdx = 0;
  for (const d of domains) {
    if (DOMAIN_COLORS[d]) {
      map.set(d, DOMAIN_COLORS[d]);
    } else {
      map.set(d, FALLBACK_COLORS[fallbackIdx % FALLBACK_COLORS.length]);
      fallbackIdx++;
    }
  }
  return map;
}

// ── Repo sizing ───────────────────────────────────────────────────────────
const MIN_REPO_R = 3;
const MAX_REPO_R = 12;
const HOVERED_REPO_R = 16;

function repoRadius(stars: number): number {
  if (stars <= 0) return MIN_REPO_R;
  const t = Math.min(Math.log10(stars + 1) / Math.log10(10000), 1);
  return MIN_REPO_R + t * (MAX_REPO_R - MIN_REPO_R);
}

// ── Component ─────────────────────────────────────────────────────────────

export function MapView({
  clusters,
  repos,
  onRepoClick,
  onRepoHover,
  filterDomains,
  filterClusters,
}: MapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  // ── Filtering ─────────────────────────────────────────────────────────
  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => {
      if (filterDomains.length > 0 && !filterDomains.includes(c.domain)) return false;
      if (filterClusters.length > 0 && !filterClusters.includes(c.cluster_id)) return false;
      return true;
    });
  }, [clusters, filterDomains, filterClusters]);

  const visibleClusterIds = useMemo(
    () => new Set(filteredClusters.map((c) => c.cluster_id)),
    [filteredClusters],
  );

  const filteredRepos = useMemo(() => {
    return repos.filter((r) => {
      if (r.cluster_id === null) return true;
      if (!visibleClusterIds.has(r.cluster_id)) return false;
      return true;
    });
  }, [repos, visibleClusterIds]);

  // ── Shared color map (sorted domains → deterministic colors) ──────────
  const visibleDomains = useMemo(() => {
    const set = new Set<string>();
    filteredRepos.forEach((r) => set.add(r.domain || DEFAULT_DOMAIN));
    filteredClusters.forEach((c) => set.add(c.domain));
    return Array.from(set).sort();
  }, [filteredRepos, filteredClusters]);

  const colorMap = useMemo(() => buildColorMap(visibleDomains), [visibleDomains]);

  function getColor(domain: string | null): string {
    return colorMap.get(domain || DEFAULT_DOMAIN) ?? FALLBACK_COLORS[0];
  }

  // ── D3 render — ONLY re-runs when filtered data changes ───────────────
  // hoveredRepo is intentionally excluded: hover highlights are handled
  // entirely within D3 event handlers to avoid resetting zoom/pan.
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    svg.selectAll('*').remove();

    const width  = svgRef.current?.clientWidth  || 800;
    const height = svgRef.current?.clientHeight || 600;

    // ── Zoom ──────────────────────────────────────────────────────────
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 20])
      .on('zoom', (event: { transform: ZoomTransform }) => {
        main.attr('transform', event.transform.toString());
      });
    zoomRef.current = zoom;
    // @ts-expect-error – d3 type mismatch between Selection types
    svg.call(zoom);

    // ── Background ────────────────────────────────────────────────────
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0a0a0a');

    const main = svg.append('g');

    // ── Draw repos (dots) ─────────────────────────────────────────────
    const repoG = main.append('g').attr('class', 'repos');

    filteredRepos.forEach((repo) => {
      const fill = getColor(repo.domain);
      const r    = repoRadius(repo.stars);

      repoG.append('circle')
        .attr('cx', repo.x)
        .attr('cy', repo.y)
        .attr('r', r)
        .attr('fill', fill)
        .attr('fill-opacity', 0.85)
        .attr('stroke', fill)
        .attr('stroke-width', 0.5)
        .attr('stroke-opacity', 0.3)
        .style('cursor', 'pointer')
        .style('transition', 'r 0.15s ease, fill-opacity 0.15s ease')
        .on('mouseover', function (event: MouseEvent) {
          d3.select(this)
            .attr('r', HOVERED_REPO_R)
            .attr('fill-opacity', 1)
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 1);
          onRepoHover({ id: repo.repo_id, x: repo.x, y: repo.y });

          const tip = tooltipRef.current;
          if (tip) {
            tip.style.opacity = '1';
            tip.style.left = `${event.clientX + 12}px`;
            tip.style.top  = `${event.clientY - 10}px`;
            tip.innerHTML = repo.owner && repo.name
              ? `<strong>${repo.owner}/${repo.name}</strong><br/>★ ${repo.stars.toLocaleString()}`
              : `Repo #${repo.repo_id}`;
          }
        })
        .on('mousemove', function (event: MouseEvent) {
          const tip = tooltipRef.current;
          if (tip) {
            tip.style.left = `${event.clientX + 12}px`;
            tip.style.top  = `${event.clientY - 10}px`;
          }
        })
        .on('mouseout', function () {
          d3.select(this)
            .attr('r', r)
            .attr('fill-opacity', 0.85)
            .attr('stroke-width', 0.5)
            .attr('stroke-opacity', 0.3);
          onRepoHover(null);
          const tip = tooltipRef.current;
          if (tip) tip.style.opacity = '0';
        })
        .on('click', () => onRepoClick(repo.repo_id));
    });

    // ── Cluster labels (on top) ───────────────────────────────────────
    const labelG = main.append('g').attr('class', 'cluster-labels');

    filteredClusters.forEach((cluster) => {
      const color = getColor(cluster.domain);

      // Halo for readability
      labelG.append('text')
        .attr('x', cluster.x)
        .attr('y', cluster.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 700)
        .attr('fill', 'none')
        .attr('stroke', '#0a0a0a')
        .attr('stroke-width', 4)
        .attr('stroke-linejoin', 'round')
        .attr('pointer-events', 'none')
        .text(cluster.label);

      // Colored text
      labelG.append('text')
        .attr('x', cluster.x)
        .attr('y', cluster.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 700)
        .attr('fill', color)
        .attr('pointer-events', 'none')
        .text(cluster.label);

      // Member count
      labelG.append('text')
        .attr('x', cluster.x)
        .attr('y', cluster.y + 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .attr('pointer-events', 'none')
        .text(`${cluster.member_count} repos`);
    });

    // ── Fit-to-content on first render ────────────────────────────────
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    filteredRepos.forEach((r) => {
      minX = Math.min(minX, r.x - MAX_REPO_R);
      maxX = Math.max(maxX, r.x + MAX_REPO_R);
      minY = Math.min(minY, r.y - MAX_REPO_R);
      maxY = Math.max(maxY, r.y + MAX_REPO_R);
    });
    filteredClusters.forEach((c) => {
      minX = Math.min(minX, c.x - 60);
      maxX = Math.max(maxX, c.x + 60);
      minY = Math.min(minY, c.y - 30);
      maxY = Math.max(maxY, c.y + 30);
    });

    if (minX !== Infinity) {
      const dx = maxX - minX;
      const dy = maxY - minY;
      const scale = Math.min(width / dx, height / dy) * 0.85;
      const tx = width  / 2 - (minX + maxX) / 2 * scale;
      const ty = height / 2 - (minY + maxY) / 2 * scale;
      svg.call(
        zoom.transform as any,
        d3.zoomIdentity.translate(tx, ty).scale(scale),
      );
    }

    return () => { svg.on('.zoom', null); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredClusters, filteredRepos]);

  return (
    <div className="relative flex-1 h-full overflow-hidden bg-[#0a0a0a]">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
        role="img"
        aria-label="Semantic map of GitHub repositories"
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-50 rounded-md border border-border bg-background/95 px-3 py-2 text-xs text-foreground shadow-lg backdrop-blur-sm"
        style={{ opacity: 0, transition: 'opacity 0.12s ease' }}
      />

      {/* Legend (bottom-right) */}
      {visibleDomains.length > 0 && (
        <div className="absolute bottom-4 right-4 z-30 rounded-lg border border-border/50 bg-background/80 px-3 py-2 backdrop-blur-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {visibleDomains.map((domain) => (
              <div key={domain} className="flex items-center gap-1.5 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getColor(domain) }}
                />
                <span className="text-muted-foreground">{domain}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Title badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <span className="rounded-full border border-border/50 bg-background/80 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur-sm">
          Semantic Map
        </span>
      </div>
    </div>
  );
}

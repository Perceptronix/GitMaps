'use client';

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { ZoomTransform } from 'd3';
import { Search } from 'lucide-react';
import type { ClusterPosition, RepoMapPosition } from '@/lib/types';

interface MapViewProps {
  clusters: ClusterPosition[];
  repos: RepoMapPosition[];
  onRepoClick: (repoId: number) => void;
  onRepoHover: (repo: { id: number; x: number; y: number } | null) => void;
  hoveredRepo: { id: number; x: number; y: number } | null;
  filterDomains: string[];
  filterClusters: number[];
  onSearch?: (query: string) => void;
}

// ── World scale ─────────────────────────────────────────────────────────────
// The backend anchors live in [-1, 1]; we render in larger "world units" so the
// force-packed blobs have room to breathe. Only the scale changes — the anchors
// themselves are exactly what layout.py computed.
const WORLD = 520;

// ── Domain palette — muted, distinct, one hue per domain ────────────────────
// Desaturated mid-tones so no single continent shouts; the hue still separates
// domains at a glance and stays consistent across clusters in the same domain.
const DOMAIN_COLORS: Record<string, string> = {
  AI:       '#C9A86C',
  Web:      '#6FA8C4',
  Mobile:   '#7E8FD0',
  DevOps:   '#8F7FC0',
  Data:     '#C98FB0',
  Security: '#C47F68',
  CLI:      '#6FBFA9',
  Library:  '#A9BF7A',
  Systems:  '#BF9A6E',
  Science:  '#88A2CE',
};

const FALLBACK_COLORS = [
  '#6FA8C4', '#C9A86C', '#8F7FC0', '#6FBFA9',
  '#C98FB0', '#A9BF7A', '#7E8FD0', '#C47F68',
];
const DEFAULT_DOMAIN = 'Uncategorized';

function buildColorMap(domains: string[]): Map<string, string> {
  const map = new Map<string, string>();
  let idx = 0;
  for (const d of domains) {
    map.set(d, DOMAIN_COLORS[d] ?? FALLBACK_COLORS[idx++ % FALLBACK_COLORS.length]);
  }
  return map;
}

// ── Repo sizing — log scale, small variance (organic, not uniform) ──────────
// Base radius is deliberately generous (6-10px) so even a 3-repo cluster reads
// as a substantial dot cloud, not a speck. Star count nudges size within that
// band; the clickable surface is fixed by HIT_R, never this visual radius.
const MIN_R = 6;
const MAX_R = 12;
const HOVER_R = 18;
// Invisible hit target — a fixed, generous hover/click surface per repo so
// small repos are as easy to grab as big ones.
const HIT_R = 18;

function repoRadius(stars: number): number {
  if (stars <= 0) return MIN_R;
  const t = Math.min(Math.log10(stars + 1) / Math.log10(10_000), 1);
  return MIN_R + t * (MAX_R - MIN_R);
}

// ── Deterministic PRNG — repo-id seeded, stable across reloads ──────────────
// Mirrors layout.py's jitter_offset idea: the same repo always settles in the
// same spot, so the map's shape is reproducible without any backend changes.
function hashInt(n: number): number {
  let h = n >>> 0;
  h = Math.imul(h ^ 0x9e3779b1, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Simulated layout types ──────────────────────────────────────────────────
interface SimNode {
  repo_id: number;
  stars: number;
  x: number;
  y: number;
}
interface WorldCentroid {
  x: number;
  y: number;
  r: number;
}
interface WorldLayout {
  dots: Map<number, { x: number; y: number }>;
  centroids: Map<number, WorldCentroid>;
}

// ── Component ───────────────────────────────────────────────────────────────
export function MapView({
  clusters,
  repos,
  onRepoClick,
  onRepoHover,
  hoveredRepo: _hoveredRepo,
  filterDomains,
  filterClusters,
  onSearch,
}: MapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();
  const [searchQuery, setSearchQuery] = useState('');

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredClusters = useMemo(
    () =>
      clusters.filter((c) => {
        if (filterDomains.length > 0 && !filterDomains.includes(c.domain)) return false;
        if (filterClusters.length > 0 && !filterClusters.includes(c.cluster_id)) return false;
        return true;
      }),
    [clusters, filterDomains, filterClusters],
  );

  const visibleClusterIds = useMemo(
    () => new Set(filteredClusters.map((c) => c.cluster_id)),
    [filteredClusters],
  );

  const filteredRepos = useMemo(
    () =>
      repos.filter((r) => {
        if (r.cluster_id === null) return true;
        return visibleClusterIds.has(r.cluster_id);
      }),
    [repos, visibleClusterIds],
  );

  // ── Color system ──────────────────────────────────────────────────────────
  const visibleDomains = useMemo(() => {
    const s = new Set<string>();
    filteredRepos.forEach((r) => s.add(r.domain || DEFAULT_DOMAIN));
    filteredClusters.forEach((c) => s.add(c.domain));
    return Array.from(s).sort();
  }, [filteredRepos, filteredClusters]);

  const colorMap = useMemo(() => buildColorMap(visibleDomains), [visibleDomains]);

  const getColor = useCallback(
    (domain: string | null) => colorMap.get(domain || DEFAULT_DOMAIN) ?? FALLBACK_COLORS[0],
    [colorMap],
  );

  // ── World-space cluster anchors (the backend's centroid positions) ────────
  const clusterAnchor = useMemo(() => {
    const m = new Map<number, { x: number; y: number }>();
    filteredClusters.forEach((c) => m.set(c.cluster_id, { x: c.x * WORLD, y: c.y * WORLD }));
    return m;
  }, [filteredClusters]);

  // ── Force simulation — pack each cluster's members into a dense landmass ──
  // Seeded deterministically per repo id (mirroring layout.py's jitter_offset),
  // so the shape is stable across reloads. forceX/forceY pull members to the
  // cluster anchor; forceCollide packs them into an irregular, organic blob.
  const layout = useMemo<WorldLayout>(() => {
    const dots = new Map<number, { x: number; y: number }>();
    const centroids = new Map<number, WorldCentroid>();

    // Unclustered repos keep their backend position — sparse "dust" between continents.
    const byCluster = new Map<number, RepoMapPosition[]>();
    filteredRepos.forEach((r) => {
      if (r.cluster_id == null) {
        dots.set(r.repo_id, { x: r.x * WORLD, y: r.y * WORLD });
        return;
      }
      const arr = byCluster.get(r.cluster_id) ?? [];
      arr.push(r);
      byCluster.set(r.cluster_id, arr);
    });

    filteredClusters.forEach((cluster) => {
      const cx = cluster.x * WORLD;
      const cy = cluster.y * WORLD;
      const members = byCluster.get(cluster.cluster_id);
      if (!members || members.length === 0) return;

      const n = members.length;
      // Target blob radius scales with membership, so big clusters read as big
      // continents — but the floor is high enough that a 3-repo cluster still
      // occupies a real patch of the map, not a pinprick.
      const targetR = Math.min(Math.max(5.2 * Math.sqrt(n), 26), 130);

      // Deterministic seed: a dense core (pow bias) with a few ragged outliers so
      // the settled coastline is irregular rather than a hard circle.
      const nodes: SimNode[] = [...members]
        .sort((a, b) => a.repo_id - b.repo_id)
        .map((m) => {
          const rand = mulberry32(hashInt(m.repo_id));
          const angle = rand() * Math.PI * 2;
          const core = Math.pow(rand(), 1.6);
          const ragged = rand() > 0.82 ? rand() * 1.5 : 1;
          const radius = targetR * core * ragged;
          return {
            repo_id: m.repo_id,
            stars: m.stars,
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
          };
        });

      const sim = d3
        .forceSimulation<SimNode>(nodes)
        .force('x', d3.forceX(cx).strength(0.55))
        .force('y', d3.forceY(cy).strength(0.55))
        .force('collide', d3.forceCollide<SimNode>((d) => repoRadius(d.stars) + 0.8).strength(1).iterations(3))
        .stop();

      for (let i = 0; i < 240 && sim.alpha() > 0.02; i++) sim.tick();

      let sx = 0;
      let sy = 0;
      for (const node of nodes) {
        dots.set(node.repo_id, { x: node.x, y: node.y });
        sx += node.x;
        sy += node.y;
      }
      // Label anchor = mean of the settled landmass, i.e. its densest region.
      centroids.set(cluster.cluster_id, { x: sx / n, y: sy / n, r: targetR });
    });

    return { dots, centroids };
  }, [filteredClusters, filteredRepos]);

  // ── Fit-to-content ────────────────────────────────────────────────────────
  // Frame the clustered content — each continent's extent plus the widest dot —
  // so it fills ~78% of the viewport on load. Unclustered "dust" sitting far
  // outside the continents is allowed to fall off-frame: the continents are
  // the content. With no clusters at all, fall back to fitting every dot.
  const computeFit = useCallback(() => {
    const el = svgRef.current;
    if (!el) return null;
    const W = el.clientWidth || 900;
    const H = el.clientHeight || 600;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layout.centroids.forEach((c) => {
      const m = c.r + MAX_R;
      if (c.x - m < minX) minX = c.x - m;
      if (c.x + m > maxX) maxX = c.x + m;
      if (c.y - m < minY) minY = c.y - m;
      if (c.y + m > maxY) maxY = c.y + m;
    });

    if (minX === Infinity) {
      layout.dots.forEach((p) => {
        if (p.x - MAX_R < minX) minX = p.x - MAX_R;
        if (p.x + MAX_R > maxX) maxX = p.x + MAX_R;
        if (p.y - MAX_R < minY) minY = p.y - MAX_R;
        if (p.y + MAX_R > maxY) maxY = p.y + MAX_R;
      });
      if (minX === Infinity) return null;
    }

    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    const scale = Math.min(W / dx, H / dy) * 0.78;
    return {
      k: scale,
      x: W / 2 - ((minX + maxX) / 2) * scale,
      y: H / 2 - ((minY + maxY) / 2) * scale,
    };
  }, [layout]);

  // ── D3 render ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const svg = d3.select(el);
    svg.selectAll('*').remove();

    const W = el.clientWidth || 900;
    const H = el.clientHeight || 600;
    const reducedMotion =
      typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const defs = svg.append('defs');
    const main = svg.append('g');

    // ── Continent glow (radial gradients) ──────────────────────────────────
    // A faint halo tucked right behind each landmass — tight and low-opacity so
    // the idle state shows crisp, individually visible dots (the alphaXiv read)
    // rather than a soft blur dome with no visible boundaries.
    const glowG = main.append('g').attr('class', 'glow').style('transition', 'opacity 0.2s ease');
    filteredClusters.forEach((cluster) => {
      const c = layout.centroids.get(cluster.cluster_id);
      if (!c) return;
      const gid = `glow-${cluster.cluster_id}`;
      const grad = defs.append('radialGradient').attr('id', gid);
      grad.append('stop').attr('offset', '0%').attr('stop-color', getColor(cluster.domain)).attr('stop-opacity', 0.15);
      grad.append('stop').attr('offset', '55%').attr('stop-color', getColor(cluster.domain)).attr('stop-opacity', 0.05);
      grad.append('stop').attr('offset', '100%').attr('stop-color', getColor(cluster.domain)).attr('stop-opacity', 0);
      glowG
        .append('circle')
        .attr('cx', c.x)
        .attr('cy', c.y)
        .attr('r', c.r * 1.15)
        .attr('fill', `url(#${gid})`)
        .attr('opacity', 0)
        .transition()
        .delay(reducedMotion ? 0 : 180)
        .duration(reducedMotion ? 0 : 600)
        .attr('opacity', 1);
    });

    // ── Repo dots ───────────────────────────────────────────────────────────
    const dotG = main.append('g').attr('class', 'repos').style('transition', 'opacity 0.2s ease');
    const anchorFor = (d: RepoMapPosition) => {
      if (d.cluster_id == null) return layout.dots.get(d.repo_id) ?? { x: d.x * WORLD, y: d.y * WORLD };
      return clusterAnchor.get(d.cluster_id) ?? { x: d.x * WORLD, y: d.y * WORLD };
    };
    const settledFor = (d: RepoMapPosition) => layout.dots.get(d.repo_id) ?? anchorFor(d);

    // Each repo is a group: a large invisible hit target (fixed, independent of
    // the star-scaled visual radius) plus the visible dot. Hover/click surface
    // is therefore always ≥ HIT_R px, even for the smallest repos.
    const repoG = dotG
      .selectAll<SVGGElement, RepoMapPosition>('g.repo')
      .data(filteredRepos, (d) => String(d.repo_id))
      .join('g')
      .attr('class', 'repo')
      .attr('transform', (d) => `translate(${anchorFor(d).x},${anchorFor(d).y})`)
      .style('cursor', 'pointer');

    repoG
      .append('circle')
      .attr('class', 'hit-area')
      .attr('r', HIT_R)
      .attr('fill', 'transparent')
      .attr('stroke', 'none')
      .style('pointer-events', 'all');

    const dot = repoG
      .append('circle')
      .attr('class', 'dot')
      .attr('r', (d) => repoRadius(d.stars))
      .attr('fill', (d) => getColor(d.domain))
      .attr('fill-opacity', 0)
      .style('pointer-events', 'none');

    // Bloom from each continent's core out to its settled coastline.
    const bloomDelay = (d: RepoMapPosition) => {
      if (reducedMotion) return 0;
      const a = d.cluster_id != null ? clusterAnchor.get(d.cluster_id) : null;
      const s = settledFor(d);
      if (!a) return 0;
      return Math.min(Math.hypot(s.x - a.x, s.y - a.y) * 4, 650);
    };
    repoG
      .transition()
      .duration(reducedMotion ? 0 : 700)
      .delay(bloomDelay)
      .ease(d3.easeCubicOut)
      .attr('transform', (d) => `translate(${settledFor(d).x},${settledFor(d).y})`);
    dot
      .transition()
      .duration(reducedMotion ? 0 : 700)
      .delay(bloomDelay)
      .ease(d3.easeCubicOut)
      .attr('fill-opacity', (d) => (d.cluster_id == null ? 0.45 : 1));

    repoG
      .on('mouseover', function (event, d) {
        d3.select(this).raise();
        d3.select(this)
          .select('.dot')
          .attr('r', HOVER_R)
          .attr('fill-opacity', 1)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.4)
          .attr('stroke-opacity', 0.55);
        onRepoHover({ id: d.repo_id, x: d.x, y: d.y });
        const tip = tooltipRef.current;
        if (tip) {
          tip.style.opacity = '1';
          tip.style.left = `${event.clientX + 14}px`;
          tip.style.top = `${event.clientY - 12}px`;
          tip.innerHTML =
            d.owner && d.name
              ? `<strong>${d.owner}/${d.name}</strong><br/><span style="color:${getColor(d.domain)}">★ ${d.stars.toLocaleString()}</span>`
              : `Repo #${d.repo_id}`;
        }
      })
      .on('mousemove', function (event) {
        const tip = tooltipRef.current;
        if (tip) {
          tip.style.left = `${event.clientX + 14}px`;
          tip.style.top = `${event.clientY - 12}px`;
        }
      })
      .on('mouseout', function (_event, d) {
        d3.select(this)
          .select('.dot')
          .attr('r', repoRadius(d.stars))
          .attr('fill-opacity', d.cluster_id == null ? 0.45 : 1)
          .attr('stroke', 'none');
        onRepoHover(null);
        const tip = tooltipRef.current;
        if (tip) tip.style.opacity = '0';
      })
      .on('click', (_event, d) => onRepoClick(d.repo_id));

    // ── Cluster labels — bold, centered in the densest part of the landmass ──
    const labelG = main.append('g').attr('class', 'cluster-labels').style('transition', 'opacity 0.2s ease');
    filteredClusters.forEach((cluster) => {
      const c = layout.centroids.get(cluster.cluster_id);
      if (!c) return;
      const fontSize = Math.min(Math.max(c.r * 0.5, 10), 28);
      const g = labelG.append('g').attr('transform', `translate(${c.x},${c.y})`).attr('opacity', 0);
      // Offset dark shadow for legibility over the dot cloud.
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', `${fontSize}px`)
        .attr('font-weight', 700)
        .attr('letter-spacing', '0.02em')
        .attr('fill', '#0a0a0a')
        .attr('opacity', 0.9)
        .attr('transform', 'translate(1.5,1.5)')
        .attr('pointer-events', 'none')
        .text(cluster.label);
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', `${fontSize}px`)
        .attr('font-weight', 700)
        .attr('letter-spacing', '0.02em')
        .attr('fill', '#ffffff')
        .attr('pointer-events', 'none')
        .text(cluster.label);
      g.transition().delay(reducedMotion ? 0 : 520).duration(reducedMotion ? 0 : 480).attr('opacity', 1);
    });

    // ── Zoom / pan with level-of-detail ─────────────────────────────────────
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.08, 24])
      .on('zoom', (e: { transform: ZoomTransform }) => {
        const k = e.transform.k;
        main.attr('transform', e.transform.toString());
        // Zoomed far out, continents read as glowing masses; labels and full
        // detail return as you zoom in.
        glowG.style('opacity', String(k < 0.35 ? 0.9 : 1));
        dotG.style('opacity', String(k < 0.35 ? 0.4 : 1));
        labelG.style('opacity', String(k < 0.42 ? 0 : 1));
      })
      .on('start', () => svg.style('cursor', 'grabbing'))
      .on('end', () => svg.style('cursor', 'grab'));
    zoomRef.current = zoom;
    svg.call(zoom);
    svg.style('cursor', 'grab');

    // ── Fit to content ──────────────────────────────────────────────────────
    const fit = computeFit();
    if (fit) {
      svg.transition().duration(reducedMotion ? 0 : 550).call(zoom.transform, d3.zoomIdentity.translate(fit.x, fit.y).scale(fit.k));
    }

    return () => {
      svg.on('.zoom', null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, filteredClusters, filteredRepos, getColor, computeFit, clusterAnchor]);

  // ── Zoom controls ─────────────────────────────────────────────────────────
  const zoomBy = useCallback((factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(280).call(zoomRef.current.scaleBy, factor);
  }, []);

  const fitContent = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const fit = computeFit();
    if (!fit) return;
    d3.select(svgRef.current)
      .transition()
      .duration(450)
      .call(zoomRef.current.transform as any, d3.zoomIdentity.translate(fit.x, fit.y).scale(fit.k));
  }, [computeFit]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative h-full flex-1 overflow-hidden bg-[#0a0a0a]">
      <svg
        ref={svgRef}
        className="h-full w-full"
        style={{ touchAction: 'none' }}
        role="img"
        aria-label="Semantic map of GitHub repositories"
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-50 rounded-lg border border-white/10 bg-black/90 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm"
        style={{ opacity: 0, transition: 'opacity 0.12s ease' }}
      />

      {/* Zoom controls — top-right */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-1">
        {[
          { label: 'Zoom in', icon: '+', fn: () => zoomBy(1.5) },
          { label: 'Zoom out', icon: '−', fn: () => zoomBy(0.67) },
          { label: 'Fit to content', icon: '⛶', fn: fitContent },
        ].map(({ label, icon, fn }) => (
          <button
            key={label}
            onClick={fn}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/60 text-sm text-white/60 backdrop-blur-sm transition-colors hover:border-white/25 hover:text-white"
            aria-label={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Legend — bottom-left */}
      {visibleDomains.length > 0 && (
        <div className="absolute bottom-4 left-4 z-30 flex max-w-[calc(50%-2rem)] flex-wrap gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-sm">
          {visibleDomains.map((domain) => (
            <div key={domain} className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-white/55">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: getColor(domain) }}
              />
              {domain}
            </div>
          ))}
        </div>
      )}

      {/* Stats — bottom-right */}
      <div className="absolute bottom-4 right-4 z-30 font-mono text-[10px] tracking-tight text-white/30">
        {filteredRepos.length} repos · {filteredClusters.length} clusters
      </div>

      {/* Search — bottom-center, reduced width to avoid legend collision */}
      {onSearch && (
        <div className="absolute bottom-4 left-1/2 z-30 w-[320px] max-w-[calc(100%-4rem)] -translate-x-1/2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) onSearch(searchQuery.trim());
            }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search repositories, topics, languages…"
                className="w-full rounded-full border border-white/10 bg-black/60 py-2.5 pl-11 pr-5 text-sm text-white placeholder-white/30 shadow-lg shadow-black/50 backdrop-blur-sm outline-none transition-colors focus:border-white/30"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

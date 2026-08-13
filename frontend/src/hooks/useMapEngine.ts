/**
 * useMapEngine — AlphaXiv-faithful canvas renderer for GitMaps.
 *
 * Visual spec (from reference screenshots):
 *  - Dots are large (8–22px screen radius), fully opaque, solid-filled circles
 *  - Stars drive size via sqrt scale: min 8px → max 22px screen at fit-zoom
 *  - Color = Gaussian-blended OKLCH hue from cluster centroids (same cluster
 *    = same hue; adjacent clusters gradient-blend at boundaries)
 *  - Labels: bold, colored (matching cluster hue), thick dark stroke halo,
 *    drawn at cluster centroid, collision-avoided, no member count suffix
 *  - Two-pass search: non-matches shrink + dim; matches stay full-size bright
 *  - Smooth 600ms cubic camera animation for fly-to
 */
'use client';

import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import type { RepoMapPosition, DomainCentroid, ClusterPosition } from '@/lib/types';
import {
  computeSigma2,
  buildDomainCentroidMap,
  hueToOklch,
  getDomainHue,
  gaussianWeight,
  hueFromVector,
} from '@/utils/mapColors';

// ── World / zoom constants ────────────────────────────────────────────────────
const WORLD     = 520;      // backend coords [-1,1] → world units
const MAX_ZOOM  = 80;
const DPR_CAP   = 2;

// ── Dot sizing (world units, before zoom) ─────────────────────────────────────
// At fit-zoom (~1.2 for 180 repos), these become:
//   MIN_R * zoom ≈ 6–8px screen  MAX_R * zoom ≈ 20–26px screen
const MIN_R = 5.5;   // world-unit radius for a 0-star repo
const MAX_R = 18;    // world-unit radius for a 100k+ star repo

// ── Opacity ───────────────────────────────────────────────────────────────────
const OP_NORMAL = 1.0;
const OP_DIM    = 0.07;
const OP_MATCH  = 1.0;

// ── Label style ───────────────────────────────────────────────────────────────
// Show labels once screen-space cluster radius > LABEL_MIN_SCREEN_R px
const LABEL_MIN_ZOOM   = 0.28;   // don't draw labels below this zoom
const LABEL_FONT_BASE  = 15;     // px at fit-zoom
const LABEL_FONT_ZOOM  = 20;     // px when zoomed in 2×

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PointData {
  repo_id: number;
  wx: number;
  wy: number;
  r: number;          // world-unit radius (pre-computed, zoom-independent)
  color: string;      // precomputed CSS color
  colorHue: number;   // raw hue degrees (for label color)
  haystack: string;
  domain: string;
  domains: string[];
  name: string;
  owner: string;
  stars: number;
}

export interface LabelData {
  text: string;
  wx: number;
  wy: number;
  hue: number;        // OKLCH hue for colored label text
  memberCount: number;
}

export interface CameraState {
  cx: number;
  cy: number;
  zoom: number;
}

export interface UseMapEngineOptions {
  repos: RepoMapPosition[];
  domainCentroids: DomainCentroid[];
  clusters: ClusterPosition[];
  filterDomains: string[];
  filterClusters: number[];
  onRepoClick: (repoId: number) => void;
  onRepoHover: (repo: { id: number; x: number; y: number } | null) => void;
}

export interface HoveredPointState {
  id: number;
  screenX: number;
  screenY: number;
  name: string;
  owner: string;
  stars: number;
  domains: string[];
  color: string;
}

export interface UseMapEngineReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  matchCount: number;
  flyToDomain: (domain: string) => void;
  hoveredPoint: HoveredPointState | null;
}

// ── Camera animation ──────────────────────────────────────────────────────────
interface CameraAnim {
  startCx: number; startCy: number; startZoom: number;
  endCx:   number; endCy:   number; endZoom:   number;
  startTime: number; duration: number;
}

function cubicEase(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ── Spatial hash ──────────────────────────────────────────────────────────────
function buildSpatialHash(points: PointData[], cellSize: number): Map<string, number[]> {
  const grid = new Map<string, number[]>();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const gx = Math.floor(p.wx / cellSize);
    const gy = Math.floor(p.wy / cellSize);
    const key = `${gx},${gy}`;
    const b = grid.get(key);
    if (b) b.push(i); else grid.set(key, [i]);
  }
  return grid;
}

function hitTest(
  worldX: number, worldY: number,
  points: PointData[],
  grid: Map<string, number[]>,
  cellSize: number, maxR: number,
): PointData | null {
  const r = maxR * 1.4 + 4;
  const gx0 = Math.floor((worldX - r) / cellSize);
  const gx1 = Math.floor((worldX + r) / cellSize);
  const gy0 = Math.floor((worldY - r) / cellSize);
  const gy1 = Math.floor((worldY + r) / cellSize);
  let best: PointData | null = null;
  let bestD2 = r * r;
  for (let gx = gx0; gx <= gx1; gx++) {
    for (let gy = gy0; gy <= gy1; gy++) {
      const b = grid.get(`${gx},${gy}`);
      if (!b) continue;
      for (const idx of b) {
        const p = points[idx];
        const dx = p.wx - worldX, dy = p.wy - worldY;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) { bestD2 = d2; best = p; }
      }
    }
  }
  return best;
}

// ── Stars → world-radius (sqrt scale) ────────────────────────────────────────
function starsToRadius(stars: number): number {
  // sqrt scale: 0 stars → MIN_R, ~50k stars → MAX_R
  const t = Math.min(Math.sqrt(stars) / Math.sqrt(50_000), 1.0);
  return MIN_R + t * (MAX_R - MIN_R);
}

// ── Gaussian hue blend from cluster centroids (AlphaXiv algorithm) ───────────
function blendHue(
  wx: number, wy: number,          // world coords (scaled)
  clusterHues: number[],           // hue per cluster (degrees)
  clusterCentroids: [number, number][],  // world coords per cluster
  sigma2: number,
): number {
  let cosSum = 0, sinSum = 0;
  for (let i = 0; i < clusterCentroids.length; i++) {
    const dx = wx - clusterCentroids[i][0];
    const dy = wy - clusterCentroids[i][1];
    const w = gaussianWeight(dx * dx + dy * dy, sigma2);
    const rad = (clusterHues[i] * Math.PI) / 180;
    cosSum += w * Math.cos(rad);
    sinSum += w * Math.sin(rad);
  }
  return hueFromVector(cosSum, sinSum);
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useMapEngine({
  repos,
  domainCentroids,
  clusters,
  filterDomains,
  filterClusters,
  onRepoClick,
  onRepoHover,
}: UseMapEngineOptions): UseMapEngineReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [matchCount,    setMatchCount]    = useState(0);
  const [hoveredState,  setHoveredState]  = useState<HoveredPointState | null>(null);

  const cam          = useRef<CameraState>({ cx: 0, cy: 0, zoom: 1 });
  const anim         = useRef<CameraAnim | null>(null);
  const raf          = useRef<number | null>(null);
  const isDragging   = useRef(false);
  const hasDragged   = useRef(false);
  const dragStart    = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const hoveredRef   = useRef<PointData | null>(null);
  const searchRef    = useRef('');
  const fDomainsRef  = useRef(filterDomains);
  const fClustersRef = useRef(filterClusters);
  fDomainsRef.current  = filterDomains;
  fClustersRef.current = filterClusters;

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // ── Precompute points + labels ────────────────────────────────────────────
  const { points, labels, maxR } = useMemo(() => {
    if (repos.length === 0 || clusters.length === 0) {
      return { points: [] as PointData[], labels: [] as LabelData[], maxR: MIN_R };
    }

    // Assign evenly-spaced hues around the color wheel to clusters,
    // sorted by angular position (matching AlphaXiv's approach).
    // First compute cluster centroids in world space.
    const clusterCentroids: [number, number][] = clusters.map(c => [c.x * WORLD, c.y * WORLD]);

    // Sort clusters by angle from centroid of all clusters (for even hue spacing)
    const avgCx = clusterCentroids.reduce((s, [x]) => s + x, 0) / clusterCentroids.length;
    const avgCy = clusterCentroids.reduce((s, [, y]) => s + y, 0) / clusterCentroids.length;
    const angles = clusterCentroids.map(([x, y]) => Math.atan2(y - avgCy, x - avgCx));
    const sortedOrder = clusters
      .map((_, i) => i)
      .sort((a, b) => angles[a] - angles[b]);

    const BASE_HUE = 25; // start angle (AlphaXiv uses 25°)
    const clusterHues: number[] = new Array(clusters.length);
    sortedOrder.forEach((clusterIdx, rank) => {
      clusterHues[clusterIdx] = (BASE_HUE + 360 * rank / clusters.length) % 360;
    });

    // sigma2 for Gaussian blending: (0.13 * maxExtent)^2
    const allX = clusterCentroids.map(([x]) => x);
    const allY = clusterCentroids.map(([, y]) => y);
    const spanX = Math.max(...allX) - Math.min(...allX);
    const spanY = Math.max(...allY) - Math.min(...allY);
    const sigma2 = Math.pow(0.13 * Math.max(spanX, spanY, 1), 2);

    // Build cluster hue lookup by cluster_id
    const clusterHueById = new Map<number, number>();
    clusters.forEach((c, i) => clusterHueById.set(c.cluster_id, clusterHues[i]));

    // Build points
    const pts: PointData[] = repos.map(r => {
      const wx = r.x * WORLD;
      const wy = r.y * WORLD;
      const radius = starsToRadius(r.stars);

      // Blend hue from all cluster centroids
      const hue = blendHue(wx, wy, clusterHues, clusterCentroids, sigma2);
      const color = hueToOklch(hue, true); // dark mode: L=0.72, C=0.15

      const haystack = [r.owner ?? '', r.name ?? '', ...(r.domains ?? [])].join(' ').toLowerCase();

      return {
        repo_id: r.repo_id,
        wx, wy,
        r: radius,
        color,
        colorHue: hue,
        haystack,
        domain: r.domain ?? '',
        domains: r.domains ?? [],
        name: r.name ?? '',
        owner: r.owner ?? '',
        stars: r.stars,
      };
    });

    const mxR = pts.reduce((m, p) => Math.max(m, p.r), MIN_R);

    // Build domain labels at domain centroids
    const domainMemberCounts = new Map<string, number>();
    for (const r of repos) {
      for (const d of r.domains) {
        domainMemberCounts.set(d, (domainMemberCounts.get(d) ?? 0) + 1);
      }
    }

    const lbls: LabelData[] = domainCentroids.map(dc => {
      const wx = dc.x * WORLD;
      const wy = dc.y * WORLD;
      const hue = blendHue(wx, wy, clusterHues, clusterCentroids, sigma2);
      return {
        text: dc.domain,
        wx, wy,
        hue,
        memberCount: domainMemberCounts.get(dc.domain) ?? 0,
      };
    });

    return { points: pts, labels: lbls, maxR: mxR };
  }, [repos, clusters, domainCentroids]);

  // Spatial hash ref (updated each frame)
  const spatialHashRef = useRef<Map<string, number[]>>(new Map());
  const cellSizeRef    = useRef(Math.max(maxR * 18, 1));

  // ── Fit to content ────────────────────────────────────────────────────────
  const fitToContent = useCallback((canvas: HTMLCanvasElement, instant = false) => {
    if (points.length === 0) return;
    const dpr  = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.wx < minX) minX = p.wx;
      if (p.wx > maxX) maxX = p.wx;
      if (p.wy < minY) minY = p.wy;
      if (p.wy > maxY) maxY = p.wy;
    }
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    // leave 14% padding on each side
    const newZoom = Math.min(cssW / spanX, cssH / spanY) * 0.72;

    if (instant || prefersReducedMotion) {
      cam.current = { cx: centerX, cy: centerY, zoom: newZoom };
    } else {
      anim.current = {
        startCx: cam.current.cx, startCy: cam.current.cy, startZoom: cam.current.zoom,
        endCx: centerX, endCy: centerY, endZoom: newZoom,
        startTime: performance.now(), duration: 700,
      };
    }
  }, [points, prefersReducedMotion]);

  // ── Fly to domain ─────────────────────────────────────────────────────────
  const flyToDomain = useCallback((domain: string) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const dpr  = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;

    const members = points.filter(p => p.domains.includes(domain) || p.domain === domain);
    if (members.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of members) {
      if (p.wx < minX) minX = p.wx;
      if (p.wx > maxX) maxX = p.wx;
      if (p.wy < minY) minY = p.wy;
      if (p.wy > maxY) maxY = p.wy;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const newZoom = Math.min(MAX_ZOOM, Math.min(cssW / (spanX * 1.3), cssH / (spanY * 1.3)));

    if (prefersReducedMotion) {
      cam.current = { cx, cy, zoom: newZoom };
      scheduleRender();
    } else {
      anim.current = {
        startCx: cam.current.cx, startCy: cam.current.cy, startZoom: cam.current.zoom,
        endCx: cx, endCy: cy, endZoom: newZoom,
        startTime: performance.now(), duration: 650,
      };
      scheduleRender();
    }
  }, [points, prefersReducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render loop ───────────────────────────────────────────────────────────
  function scheduleRender() {
    if (raf.current !== null) return;
    raf.current = requestAnimationFrame(renderFrame);
  }

  function renderFrame(now: number) {
    raf.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr  = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;

    // ── Advance animation ──────────────────────────────────────────────────
    if (anim.current) {
      const a = anim.current;
      const t = Math.min((now - a.startTime) / a.duration, 1);
      const e = cubicEase(t);
      cam.current = {
        cx:   a.startCx   + (a.endCx   - a.startCx)   * e,
        cy:   a.startCy   + (a.endCy   - a.startCy)   * e,
        zoom: a.startZoom + (a.endZoom - a.startZoom) * e,
      };
      if (t < 1) scheduleRender();
      else anim.current = null;
    }

    const { cx, cy, zoom } = cam.current;
    const query    = searchRef.current.toLowerCase().trim();
    const fDomains = fDomainsRef.current;

    const screenX = (wx: number) => (wx - cx) * zoom + cssW / 2;
    const screenY = (wy: number) => (wy - cy) * zoom + cssH / 2;

    // ── Clear ──────────────────────────────────────────────────────────────
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // ── Rebuild spatial hash ───────────────────────────────────────────────
    const cs = Math.max(maxR * 20, 2);
    cellSizeRef.current  = cs;
    spatialHashRef.current = buildSpatialHash(points, cs);

    // ── Filter points ──────────────────────────────────────────────────────
    const hasDomainFilter = fDomains.length > 0;
    const visiblePoints = hasDomainFilter
      ? points.filter(p => fDomains.some(d => p.domains.includes(d) || p.domain === d))
      : points;

    // ── Search matching ────────────────────────────────────────────────────
    const hasQuery = query.length > 0;
    let matches: Set<number> | null = null;
    if (hasQuery) {
      matches = new Set();
      for (const p of visiblePoints) {
        if (p.haystack.includes(query)) matches.add(p.repo_id);
      }
      setMatchCount(matches.size);
    } else {
      setMatchCount(visiblePoints.length);
    }

    // ── Draw dots ──────────────────────────────────────────────────────────
    // Two-pass when searching (dim first, then bright) — single pass otherwise
    const passes: Array<{ pts: PointData[]; alpha: number; scaleMult: number }> =
      hasQuery && matches
        ? [
            // pass 1: dimmed non-matches (drawn first, underneath)
            {
              pts: visiblePoints.filter(p => !matches!.has(p.repo_id)),
              alpha: OP_DIM,
              scaleMult: 0.65,
            },
            // pass 2: bright matches
            {
              pts: visiblePoints.filter(p =>  matches!.has(p.repo_id)),
              alpha: OP_MATCH,
              scaleMult: 1.0,
            },
          ]
        : [{ pts: visiblePoints, alpha: OP_NORMAL, scaleMult: 1.0 }];

    for (const { pts, alpha, scaleMult } of passes) {
      ctx.globalAlpha = alpha;
      for (const p of pts) {
        const sx = screenX(p.wx);
        const sy = screenY(p.wy);
        const sr = Math.max(1.5, p.r * zoom * scaleMult);
        // Viewport cull with generous margin
        if (sx < -sr - 2 || sx > cssW + sr + 2 || sy < -sr - 2 || sy > cssH + sr + 2) continue;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // ── Hovered dot ring ───────────────────────────────────────────────────
    const hov = hoveredRef.current;
    if (hov) {
      const sx = screenX(hov.wx);
      const sy = screenY(hov.wy);
      const sr = Math.max(2, hov.r * zoom);
      // White outer ring
      ctx.beginPath();
      ctx.arc(sx, sy, sr + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Re-draw dot on top (so ring doesn't clip it)
      ctx.fillStyle = hov.color;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Domain labels ──────────────────────────────────────────────────────
    const labelAlpha = Math.min(1, Math.max(0, (zoom - LABEL_MIN_ZOOM) / 0.08));
    if (labelAlpha > 0) {
      const fontSize = zoom > 0.9 ? LABEL_FONT_ZOOM : LABEL_FONT_BASE;
      ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = labelAlpha;

      const labelsToRender = hasDomainFilter
        ? labels.filter(l => fDomains.includes(l.text))
        : labels;
      // Larger clusters get priority in collision avoidance
      const sorted = [...labelsToRender].sort((a, b) => b.memberCount - a.memberCount);

      // Collision boxes
      const placed: { x: number; y: number; w: number; h: number }[] = [];

      for (const lbl of sorted) {
        const sx = screenX(lbl.wx);
        const sy = screenY(lbl.wy);
        if (sx < -150 || sx > cssW + 150 || sy < -40 || sy > cssH + 40) continue;

        const text = lbl.text;
        const tw = ctx.measureText(text).width;
        const th = fontSize + 4;

        // Collision check
        const collides = placed.some(
          b => sx - tw / 2 < b.x + b.w + 8 &&
               sx + tw / 2 > b.x - 8 &&
               sy - th / 2 < b.y + b.h + 8 &&
               sy + th / 2 > b.y - 8,
        );
        if (collides) continue;
        placed.push({ x: sx - tw / 2, y: sy - th / 2, w: tw, h: th });

        // Dark stroke halo (thick, for contrast on any background)
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.lineWidth   = fontSize * 0.55;
        ctx.strokeText(text, sx, sy);

        // Lighter outer halo
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth   = fontSize * 0.25;
        ctx.strokeText(text, sx, sy);

        // Colored label text (matching cluster hue, bright)
        ctx.fillStyle = hueToOklch(lbl.hue, false); // light mode colors = brighter
        ctx.fillText(text, sx, sy);
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ── Event handling ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

    // Initial size + fit
    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.round(rect.width  * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };
    setSize();
    fitToContent(canvas, true);
    scheduleRender();

    // Resize
    const ro = new ResizeObserver(() => { setSize(); scheduleRender(); });
    ro.observe(canvas);

    // Wheel zoom (pinch-zoom friendly)
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = canvas!.getBoundingClientRect();
      const sx   = e.clientX - rect.left;
      const sy   = e.clientY - rect.top;
      const cssW = rect.width;
      const cssH = rect.height;
      // World position under cursor (before zoom)
      const wx = (sx - cssW / 2) / cam.current.zoom + cam.current.cx;
      const wy = (sy - cssH / 2) / cam.current.zoom + cam.current.cy;

      const factor  = Math.exp(-e.deltaY * 0.0020);
      const newZoom = Math.min(MAX_ZOOM, Math.max(0.04, cam.current.zoom * factor));
      // Re-anchor to cursor world-position
      cam.current = {
        cx:   wx - (sx - cssW / 2) / newZoom,
        cy:   wy - (sy - cssH / 2) / newZoom,
        zoom: newZoom,
      };
      anim.current = null;
      scheduleRender();
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      isDragging.current = true;
      hasDragged.current = false;
      dragStart.current  = { x: e.clientX, y: e.clientY, cx: cam.current.cx, cy: cam.current.cy };
      canvas!.style.cursor = 'grabbing';
    }

    function onMouseMove(e: MouseEvent) {
      const c = canvasRef.current;
      if (!c) return;

      if (isDragging.current) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) hasDragged.current = true;
        cam.current = {
          cx: dragStart.current.cx - dx / cam.current.zoom,
          cy: dragStart.current.cy - dy / cam.current.zoom,
          zoom: cam.current.zoom,
        };
        anim.current = null;
        scheduleRender();
        return;
      }

      // Hover hit-test
      const rect = c.getBoundingClientRect();
      const sx   = e.clientX - rect.left;
      const sy   = e.clientY - rect.top;
      const wx   = (sx - rect.width  / 2) / cam.current.zoom + cam.current.cx;
      const wy   = (sy - rect.height / 2) / cam.current.zoom + cam.current.cy;

      const hit = hitTest(wx, wy, points, spatialHashRef.current, cellSizeRef.current, maxR);
      if (hit !== hoveredRef.current) {
        hoveredRef.current = hit;
        onRepoHover(hit ? { id: hit.repo_id, x: hit.wx / WORLD, y: hit.wy / WORLD } : null);
        c.style.cursor = hit ? 'pointer' : 'grab';
        scheduleRender();
        setHoveredState(hit ? {
          id: hit.repo_id,
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top,
          name: hit.name, owner: hit.owner, stars: hit.stars,
          domains: hit.domains, color: hit.color,
        } : null);
      } else if (hit) {
        // Update screen coords while over same point
        setHoveredState(prev => prev ? {
          ...prev,
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top,
        } : null);
      }
    }

    function onMouseUp(e: MouseEvent) {
      if (!isDragging.current) return;
      isDragging.current = false;
      canvas!.style.cursor = hoveredRef.current ? 'pointer' : 'grab';
      if (!hasDragged.current && hoveredRef.current) {
        onRepoClick(hoveredRef.current.repo_id);
      }
    }

    function onMouseLeave() {
      isDragging.current = false;
      if (hoveredRef.current) {
        hoveredRef.current = null;
        onRepoHover(null);
        setHoveredState(null);
        scheduleRender();
      }
    }

    canvas.addEventListener('wheel',      onWheel,      { passive: false });
    canvas.addEventListener('mousedown',  onMouseDown);
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.style.cursor = 'grab';

    return () => {
      ro.disconnect();
      canvas.removeEventListener('wheel',      onWheel);
      canvas.removeEventListener('mousedown',  onMouseDown);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseup',    onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      if (raf.current !== null) { cancelAnimationFrame(raf.current); raf.current = null; }
    };
  }, [points, maxR, fitToContent, onRepoClick, onRepoHover]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    searchRef.current = searchQuery;
    scheduleRender();
  }, [searchQuery, filterDomains, filterClusters]); // eslint-disable-line react-hooks/exhaustive-deps

  return { canvasRef, searchQuery, setSearchQuery, matchCount, flyToDomain, hoveredPoint: hoveredState };
}

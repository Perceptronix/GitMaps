'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Selection, ZoomTransform } from 'd3';
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

const CLUSTER_RADIUS = 40;
const REPO_RADIUS = 4;
const HOVERED_REPO_RADIUS = 8;

export function MapView({
  clusters,
  repos,
  onRepoClick,
  onRepoHover,
  hoveredRepo,
  filterDomains,
  filterClusters,
}: MapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  // Filter clusters and repos based on active filters
  const filteredClusters = useMemo(() => {
    return clusters.filter((c: ClusterPosition) => {
      if (filterDomains.length > 0 && !filterDomains.includes(c.domain)) return false;
      if (filterClusters.length > 0 && !filterClusters.includes(c.cluster_id)) return false;
      return true;
    });
  }, [clusters, filterDomains, filterClusters]);

  const filteredRepos = useMemo(() => {
    return repos.filter((r: RepoMapPosition) => {
      const cluster = clusters.find((c: ClusterPosition) => c.cluster_id === r.repo_id);
      // If we can't find the cluster, include the repo
      if (!cluster) return true;
      if (filterDomains.length > 0 && !filterDomains.includes(cluster.domain)) return false;
      if (filterClusters.length > 0 && !filterClusters.includes(cluster.cluster_id)) return false;
      return true;
    });
  }, [repos, clusters, filterDomains, filterClusters]);

  // Get unique domains for color scale
  const domains = useMemo(() => {
    return Array.from(new Set(filteredClusters.map((c: ClusterPosition) => c.domain))).sort();
  }, [filteredClusters]);

  const colorScale = useMemo(() => {
    const scheme = d3.schemeCategory10;
    return d3.scaleOrdinal<string, string>()
      .domain(domains)
      .range(scheme);
  }, [domains]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    // Clear previous content
    svg.selectAll('*').remove();

    const width = svgRef.current?.clientWidth || 800;
    const height = svgRef.current?.clientHeight || 600;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: { transform: ZoomTransform }) => {
        g.attr('transform', event.transform.toString());
      });

    zoomRef.current = zoom;

    // @ts-expect-error - d3 type mismatch
    svg.call(zoom);

    // Main group for zoom/pan
    const g = svg.append('g');

    // Background grid
    const gridSize = 100;
    const grid = g.append('g').attr('class', 'grid');
    for (let x = -width * 5; x < width * 5; x += gridSize) {
      grid.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', -height * 5).attr('y2', height * 5)
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.3);
    }
    for (let y = -height * 5; y < height * 5; y += gridSize) {
      grid.append('line')
        .attr('x1', -width * 5).attr('x2', width * 5)
        .attr('y1', y).attr('y2', y)
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.3);
    }

    // Draw clusters
    const clusterGroup = g.append('g').attr('class', 'clusters');

    filteredClusters.forEach((cluster: ClusterPosition) => {
      const clusterG = clusterGroup.append('g')
        .attr('class', 'cluster')
        .attr('transform', `translate(${cluster.x}, ${cluster.y})`)
        .style('cursor', 'default');

      // Cluster circle
      clusterG.append('circle')
        .attr('r', CLUSTER_RADIUS)
        .attr('fill', colorScale(cluster.domain))
        .attr('fill-opacity', 0.15)
        .attr('stroke', colorScale(cluster.domain))
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4');

      // Cluster label
      clusterG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 600)
        .attr('fill', colorScale(cluster.domain))
        .attr('pointer-events', 'none')
        .text(cluster.label);

      // Member count
      clusterG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('dy', '16px')
        .attr('font-size', '9px')
        .attr('fill', '#888')
        .attr('pointer-events', 'none')
        .text(`${cluster.member_count} repos`);
    });

    // Draw repos
    const repoGroup = g.append('g').attr('class', 'repos');

    filteredRepos.forEach((repo: RepoMapPosition) => {
      const repoEl = repoGroup.append('circle')
        .attr('class', 'repo')
        .attr('cx', repo.x)
        .attr('cy', repo.y)
        .attr('r', REPO_RADIUS)
        .attr('fill', '#00d4aa')
        .attr('fill-opacity', 0.8)
        .attr('stroke', '#00d4aa')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('transition', 'r 0.15s ease, fill-opacity 0.15s ease')
        .on('mouseover', function() {
          d3.select(this)
            .attr('r', HOVERED_REPO_RADIUS)
            .attr('fill-opacity', 1)
            .attr('stroke-width', 2);
          onRepoHover({ id: repo.repo_id, x: repo.x, y: repo.y });
        })
        .on('mouseout', function() {
          const isHovered = hoveredRepo?.id === repo.repo_id;
          d3.select(this)
            .attr('r', isHovered ? HOVERED_REPO_RADIUS : REPO_RADIUS)
            .attr('fill-opacity', isHovered ? 1 : 0.8)
            .attr('stroke-width', isHovered ? 2 : 1);
          if (!isHovered) onRepoHover(null);
        })
        .on('click', () => onRepoClick(repo.repo_id));

      // Highlight if hovered
      if (hoveredRepo?.id === repo.repo_id) {
        repoEl
          .attr('r', HOVERED_REPO_RADIUS)
          .attr('fill-opacity', 1)
          .attr('stroke-width', 2);
      }
    });

    // Draw hovered repo indicator (crosshair)
    if (hoveredRepo) {
      const crosshair = g.append('g').attr('class', 'crosshair').attr('pointer-events', 'none');
      crosshair.append('line')
        .attr('x1', hoveredRepo.x - 20).attr('x2', hoveredRepo.x + 20)
        .attr('y1', hoveredRepo.y).attr('y2', hoveredRepo.y)
        .attr('stroke', '#00d4aa').attr('stroke-width', 1).attr('stroke-dasharray', '4,2');
      crosshair.append('line')
        .attr('x1', hoveredRepo.x).attr('x2', hoveredRepo.x)
        .attr('y1', hoveredRepo.y - 20).attr('y2', hoveredRepo.y + 20)
        .attr('stroke', '#00d4aa').attr('stroke-width', 1).attr('stroke-dasharray', '4,2');
    }

    // Legend
    if (domains.length > 0) {
      const legend = g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 180}, 20)`);

      domains.forEach((domain: string, i: number) => {
        const item = legend.append('g')
          .attr('transform', `translate(0, ${i * 22})`);

        item.append('circle')
          .attr('r', 8)
          .attr('fill', colorScale(domain))
          .attr('fill-opacity', 0.15)
          .attr('stroke', colorScale(domain))
          .attr('stroke-width', 2);

        item.append('text')
          .attr('x', 18)
          .attr('y', 4)
          .attr('font-size', '12px')
          .attr('fill', '#ddd')
          .text(domain.charAt(0).toUpperCase() + domain.slice(1));
      });
    }

    // Fit to content initially if no transform
    const hasInitialZoom = false; // Skip initial fit for now
    if (!hasInitialZoom) {
      // Calculate bounds
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      filteredClusters.forEach((c: ClusterPosition) => {
        minX = Math.min(minX, c.x - CLUSTER_RADIUS);
        maxX = Math.max(maxX, c.x + CLUSTER_RADIUS);
        minY = Math.min(minY, c.y - CLUSTER_RADIUS);
        maxY = Math.max(maxY, c.y + CLUSTER_RADIUS);
      });
      filteredRepos.forEach((r: RepoMapPosition) => {
        minX = Math.min(minX, r.x - REPO_RADIUS);
        maxX = Math.max(maxX, r.x + REPO_RADIUS);
        minY = Math.min(minY, r.y - REPO_RADIUS);
        maxY = Math.max(maxY, r.y + REPO_RADIUS);
      });

      if (minX !== Infinity) {
        const dx = maxX - minX;
        const dy = maxY - minY;
        const scale = Math.min(width / dx, height / dy) * 0.8;
        const translateX = width / 2 - (minX + maxX) / 2 * scale;
        const translateY = height / 2 - (minY + maxY) / 2 * scale;
        svg.transition().duration(750).call(
          zoom.transform as any,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
      }
    }

    return () => {
      svg.on('.zoom', null);
    };
  }, [filteredClusters, filteredRepos, hoveredRepo, domains, colorScale, onRepoClick, onRepoHover]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
      role="img"
      aria-label="Semantic map of GitHub repositories"
    />
  );
}
'use client';

import { ChevronDown, X, SlidersHorizontal, MapIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { ClusterSummary, DomainCentroid } from '@/lib/types';
import { hueToOklch, getDomainHue } from '@/utils/mapColors';

interface FilterPanelProps {
  domains: string[];
  selectedDomains: string[];
  onDomainsChange: (domains: string[]) => void;
  selectedClusters: number[];
  onClustersChange: (clusters: number[]) => void;
  clusters: ClusterSummary[];
  /** Domain centroids for color dots */
  domainCentroids?: DomainCentroid[];
  /** Called when user clicks "fly to domain" in sidebar */
  onFlyToDomain?: (domain: string) => void;
}

export function FilterPanel({
  domains,
  selectedDomains,
  onDomainsChange,
  selectedClusters,
  onClustersChange,
  clusters,
  domainCentroids = [],
  onFlyToDomain,
}: FilterPanelProps) {
  const [openClusters, setOpenClusters] = useState(false);
  const clustersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clustersRef.current && !clustersRef.current.contains(event.target as Node)) {
        setOpenClusters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDomain = (domain: string) => {
    onDomainsChange(
      selectedDomains.includes(domain)
        ? selectedDomains.filter(d => d !== domain)
        : [...selectedDomains, domain]
    );
  };

  const toggleCluster = (clusterId: number) => {
    onClustersChange(
      selectedClusters.includes(clusterId)
        ? selectedClusters.filter(c => c !== clusterId)
        : [...selectedClusters, clusterId]
    );
  };

  const clearAll = () => {
    onDomainsChange([]);
    onClustersChange([]);
  };

  const hasFilters = selectedDomains.length > 0 || selectedClusters.length > 0;

  // Build domain member count map from centroids
  const domainCountMap = new Map<string, number>();
  for (const dc of domainCentroids) {
    domainCountMap.set(dc.domain, dc.cluster_count);
  }

  // Domains to show in sidebar: all unique domains from the domain list
  const sidebarDomains = domains.length > 0 ? domains : domainCentroids.map(d => d.domain);

  return (
    <div
      className="fixed top-4 left-[calc(var(--sidebar-w)+0.5rem)] z-30 flex flex-col gap-2 max-h-[calc(100vh-2rem)] overflow-y-auto"
      role="region"
      aria-label="Map filters"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 text-xs font-medium text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        Filters
        {hasFilters && (
          <span className="px-2 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
            {selectedDomains.length + selectedClusters.length} active
          </span>
        )}
      </div>

      {/* Domain sidebar — click to toggle filter + fly-to camera */}
      {sidebarDomains.length > 0 && (
        <div className="rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 overflow-hidden">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/50 flex items-center gap-1.5">
            <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Domains
          </div>
          <ul role="list" className="py-1">
            {sidebarDomains.map(domain => {
              const hue = getDomainHue(domain);
              const color = hueToOklch(hue);
              const isSelected = selectedDomains.includes(domain);
              const count = domainCountMap.get(domain);
              return (
                <li key={domain} className="flex items-center">
                  <button
                    className={`flex-1 flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors hover:bg-secondary/60 ${
                      isSelected ? 'bg-secondary/80 font-medium' : ''
                    }`}
                    onClick={() => toggleDomain(domain)}
                    aria-pressed={isSelected}
                    aria-label={`Toggle ${domain} filter`}
                  >
                    {/* Color dot */}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                    <span className="truncate flex-1">{domain}</span>
                    {count !== undefined && (
                      <span className="text-xs text-muted-foreground shrink-0">{count}</span>
                    )}
                  </button>
                  {/* Fly-to button */}
                  {onFlyToDomain && (
                    <button
                      className="px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      onClick={() => onFlyToDomain(domain)}
                      aria-label={`Fly to ${domain} on map`}
                      title={`Fly to ${domain}`}
                    >
                      <MapIcon className="h-3 w-3" aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Clusters dropdown */}
      {clusters.length > 0 && (
        <div className="relative" ref={clustersRef}>
          <button
            onClick={() => setOpenClusters(!openClusters)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-md border bg-background text-sm font-medium transition-colors ${
              selectedClusters.length > 0
                ? 'border-primary text-primary bg-primary/10'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
            aria-expanded={openClusters}
            aria-haspopup="listbox"
            aria-label={`Clusters filter (${selectedClusters.length} selected)`}
          >
            <span className="truncate">Clusters</span>
            {selectedClusters.length > 0 && (
              <span className="ml-auto px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {selectedClusters.length}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${openClusters ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          {openClusters && (
            <div
              className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-background shadow-lg p-2"
              role="listbox"
              aria-label="Select clusters"
            >
              {clusters.map(cluster => (
                <label
                  key={cluster.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={selectedClusters.includes(cluster.id)}
                    onChange={() => toggleCluster(cluster.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0"
                    aria-label={`${cluster.label} cluster`}
                  />
                  <span className="truncate max-w-[200px]">
                    {cluster.label} ({cluster.member_count})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
          aria-label="Clear all filters"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear filters
        </button>
      )}
    </div>
  );
}

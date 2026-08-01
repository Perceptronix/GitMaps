'use client';

import { ChevronDown, Filter, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { ClusterSummary } from '@/lib/types';

interface FilterPanelProps {
  domains: string[];
  selectedDomains: string[];
  onDomainsChange: (domains: string[]) => void;
  selectedClusters: number[];
  onClustersChange: (clusters: number[]) => void;
  clusters: ClusterSummary[];
}

export function FilterPanel({
  domains,
  selectedDomains,
  onDomainsChange,
  selectedClusters,
  onClustersChange,
  clusters,
}: FilterPanelProps) {
  const [openDomains, setOpenDomains] = useState(false);
  const [openClusters, setOpenClusters] = useState(false);
  const domainsRef = useRef<HTMLDivElement>(null);
  const clustersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (domainsRef.current && !domainsRef.current.contains(event.target as Node)) {
        setOpenDomains(false);
      }
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

  return (
    <div className="fixed top-16 left-4 z-30 flex flex-col gap-2" role="region" aria-label="Filters">
      <div className="relative" ref={domainsRef}>
        <button
          onClick={() => setOpenDomains(!openDomains)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md border bg-background text-sm font-medium transition-colors ${
            selectedDomains.length > 0
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border text-muted-foreground hover:border-primary/50'
          }`}
          aria-expanded={openDomains}
          aria-haspopup="listbox"
          aria-label={`Technology domains filter (${selectedDomains.length} selected)`}
        >
          <Filter className="h-4 w-4" />
          Domains
          {selectedDomains.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {selectedDomains.length}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${openDomains ? 'rotate-180' : ''}`} />
        </button>
        {openDomains && (
          <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto rounded-md border border-border bg-background shadow-lg p-2">
            {domains.map(domain => (
              <label
                key={domain}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-secondary"
              >
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain)}
                  onChange={() => toggleDomain(domain)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="capitalize">{domain}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={clustersRef}>
        <button
          onClick={() => setOpenClusters(!openClusters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md border bg-background text-sm font-medium transition-colors ${
            selectedClusters.length > 0
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border text-muted-foreground hover:border-primary/50'
          }`}
          aria-expanded={openClusters}
          aria-haspopup="listbox"
          aria-label={`Clusters filter (${selectedClusters.length} selected)`}
        >
          <Filter className="h-4 w-4" />
          Clusters
          {selectedClusters.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {selectedClusters.length}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${openClusters ? 'rotate-180' : ''}`} />
        </button>
        {openClusters && (
          <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto rounded-md border border-border bg-background shadow-lg p-2">
            {clusters.map(cluster => (
              <label
                key={cluster.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-secondary"
              >
                <input
                  type="checkbox"
                  checked={selectedClusters.includes(cluster.id)}
                  onChange={() => toggleCluster(cluster.id)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="truncate max-w-[200px]">{cluster.label} ({cluster.member_count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
          aria-label="Clear all filters"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      )}
    </div>
  );
}
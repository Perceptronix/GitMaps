'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { MapView } from '@/components/MapView';
import { RepoDetailPanel } from '@/components/RepoDetailPanel';
import { SimilarReposPanel } from '@/components/SimilarReposPanel';
import { SearchPanel } from '@/components/SearchPanel';
import { FilterPanel } from '@/components/FilterPanel';
import { TrendingView } from '@/components/TrendingView';
import { Header } from '@/components/Header';
import type { MapResponse, ClusterSummary, RepoDetail, SimilarResponse, SearchResponse, TrendingResponse, ClustersResponse } from '@/lib/types';
import { api } from '@/lib/api';

interface RepoData {
  id: number;
  detail: RepoDetail;
  similar: SimilarResponse['items'];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function HomePage() {
  const [view, setView] = useState<'map' | 'search' | 'trending'>('map');
  const [selectedRepo, setSelectedRepo] = useState<RepoData | null>(null);
  const [hoveredRepo, setHoveredRepo] = useState<{ id: number; x: number; y: number } | null>(null);
  const [filterDomains, setFilterDomains] = useState<string[]>([]);
  const [filterClusters, setFilterClusters] = useState<number[]>([]);

  // Fetch map data
  const { data: mapData, error: mapError, mutate: mutateMap } = useSWR<MapResponse>(
    '/api/backend/map',
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch domains for filter
  const { data: clustersData } = useSWR<ClustersResponse>(
    '/api/backend/clusters?per_page=100',
    fetcher,
    { revalidateOnFocus: false }
  );

  const domains = (clustersData?.items.map(c => c.domain).filter((d, i, arr) => arr.indexOf(d) === i) || []) as string[];

  const handleRepoClick = useCallback(async (repoId: number) => {
    if (selectedRepo?.detail.id === repoId) {
      setSelectedRepo(null);
      return;
    }
    try {
      const [detail, similar] = await Promise.all([
        api.getRepo(repoId),
        api.getSimilar(repoId),
      ]);
      setSelectedRepo({ id: repoId, detail, similar: similar.items });
    } catch (err) {
      console.error('Failed to load repo:', err);
    }
  }, [selectedRepo?.detail.id]);

  const handleRepoHover = useCallback((repo: { id: number; x: number; y: number } | null) => {
    setHoveredRepo(repo);
  }, []);

  if (mapError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Failed to load map</h1>
          <p className="text-muted-foreground mt-2">Unable to connect to the backend API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Header onViewChange={setView} currentView={view} />

      <main className="flex-1 flex overflow-hidden">
        {view === 'map' && mapData && (
          <>
            <FilterPanel
              domains={domains}
              selectedDomains={filterDomains}
              onDomainsChange={setFilterDomains}
              selectedClusters={filterClusters}
              onClustersChange={setFilterClusters}
              clusters={clustersData?.items || []}
            />
            <MapView
              clusters={mapData.clusters}
              repos={mapData.repos}
              onRepoClick={handleRepoClick}
              onRepoHover={handleRepoHover}
              hoveredRepo={hoveredRepo}
              filterDomains={filterDomains}
              filterClusters={filterClusters}
            />
          </>
        )}

        {view === 'search' && <SearchPanel onRepoClick={handleRepoClick} />}
        {view === 'trending' && <TrendingView onRepoClick={handleRepoClick} />}

        {selectedRepo && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSelectedRepo(null)}
              aria-hidden="true"
            />
            <RepoDetailPanel
              repo={selectedRepo.detail}
              similar={selectedRepo.similar}
              onClose={() => setSelectedRepo(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
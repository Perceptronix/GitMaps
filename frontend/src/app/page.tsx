'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';
import { MapViewCanvas } from '@/components/MapViewCanvas';
import { RepoDetailPanel } from '@/components/RepoDetailPanel';
import { SearchPanel } from '@/components/SearchPanel';
import { TrendingView } from '@/components/TrendingView';
import { NavRail } from '@/components/NavRail';
import type {
  MapResponse,
  RepoDetail,
  SimilarResponse,
  ClustersResponse,
} from '@/lib/types';
import { api } from '@/lib/api';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

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

  // Track when new data arrives so we can show the diff toast
  const prevRepoCountRef = useRef<number | null>(null);
  const prevUpdatedAtRef = useRef<string | null>(null);
  const [newReposDelta, setNewReposDelta] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const flyToDomainRef = useRef<((domain: string) => void) | null>(null);

  // ── Map data — refreshes every 5 minutes ────────────────────────────────
  const { data: mapData, error: mapError, isValidating } = useSWR<MapResponse>(
    '/api/backend/map',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: REFRESH_INTERVAL_MS,
      dedupingInterval: 60_000,
      onSuccess: (data) => {
        const newCount = data.repos.length;
        const newUpdatedAt = data.updated_at;

        // First load — no diff
        if (prevRepoCountRef.current === null) {
          prevRepoCountRef.current = newCount;
          prevUpdatedAtRef.current = newUpdatedAt;
          setLastUpdatedAt(new Date());
          console.log(`[map] loaded ${newCount} repos · ${data.clusters.length} clusters`);
          return;
        }

        // Subsequent refresh — compute diff
        const delta = newCount - prevRepoCountRef.current;
        const isNewData = newUpdatedAt !== prevUpdatedAtRef.current || delta !== 0;

        if (isNewData) {
          setNewReposDelta(delta);
          setLastUpdatedAt(new Date());
          prevRepoCountRef.current = newCount;
          prevUpdatedAtRef.current = newUpdatedAt;
          console.log(
            `[map] refreshed — ${newCount} repos (+${delta}) · ${data.clusters.length} clusters`,
          );
        }
      },
    }
  );

  // Track isValidating to show spinner in the live indicator
  useEffect(() => {
    if (isValidating && mapData) {
      setIsRefreshing(true);
    } else {
      // Small delay so the spinner is visible for at least 600ms
      const t = setTimeout(() => setIsRefreshing(false), 600);
      return () => clearTimeout(t);
    }
  }, [isValidating, mapData]);

  const { data: clustersData } = useSWR<ClustersResponse>(
    '/api/backend/clusters?per_page=100',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: REFRESH_INTERVAL_MS,
    }
  );

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
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--destructive)' }}>
            Failed to load map
          </h1>
          <p className="mt-2" style={{ color: 'var(--subtext)' }}>
            Unable to connect to the backend API
          </p>
        </div>
      </div>
    );
  }

  const isMapLoading = view === 'map' && !mapData && !mapError;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <NavRail onViewChange={setView} currentView={view} />

      <main
        className="flex flex-1 overflow-hidden"
        style={{ marginLeft: 'var(--nav-rail-w)' }}
      >
        {/* MAP VIEW */}
        {view === 'map' && mapData && (
          <div className="relative flex-1 h-full">
            <MapViewCanvas
              clusters={mapData.clusters}
              repos={mapData.repos}
              domainCentroids={mapData.domain_centroids}
              onRepoClick={handleRepoClick}
              onRepoHover={handleRepoHover}
              hoveredRepo={hoveredRepo}
              filterDomains={filterDomains}
              filterClusters={filterClusters}
              onFlyToDomainRegister={(fn) => { flyToDomainRef.current = fn; }}
              repoCount={mapData.repos.length}
              clusterCount={mapData.clusters.length}
              isRefreshing={isRefreshing}
              lastUpdatedAt={lastUpdatedAt}
              newReposDelta={newReposDelta}
              onDeltaDismiss={() => setNewReposDelta(0)}
              refreshIntervalMs={REFRESH_INTERVAL_MS}
            />
          </div>
        )}

        {/* MAP LOADING */}
        {isMapLoading && (
          <div className="flex flex-1 h-full items-center justify-center">
            <div className="text-center">
              <Loader2
                className="h-10 w-10 animate-spin mx-auto mb-4"
                style={{ color: 'var(--custom-accent)' }}
              />
              <p className="text-sm" style={{ color: 'var(--subtext)' }}>
                Loading semantic map…
              </p>
            </div>
          </div>
        )}

        {/* SEARCH VIEW */}
        {view === 'search' && (
          <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg)' }}>
            <SearchPanel onRepoClick={handleRepoClick} />
          </div>
        )}

        {/* TRENDING VIEW */}
        {view === 'trending' && (
          <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg)' }}>
            <TrendingView onRepoClick={handleRepoClick} />
          </div>
        )}

        {/* REPO DETAIL MODAL */}
        {selectedRepo && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0"
              style={{ background: 'rgba(0,0,0,0.6)' }}
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

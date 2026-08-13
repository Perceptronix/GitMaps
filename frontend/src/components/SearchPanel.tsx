'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { Search, Filter, X, Loader2, ChevronDown } from 'lucide-react';
import type { SearchResponse, RepoBase } from '@/lib/types';
import { api } from '@/lib/api';

interface SearchPanelProps {
  onRepoClick: (repoId: number) => void;
  /** Query carried over from the map's search bar, if any. */
  initialQuery?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function SearchPanel({ onRepoClick, initialQuery }: SearchPanelProps) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [language, setLanguage] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [minStars, setMinStars] = useState<number | ''>('');
  const [maxStars, setMaxStars] = useState<number | ''>('');
  const [tracked, setTracked] = useState<boolean | null>(null);
  const [surfaced, setSurfaced] = useState<boolean | null>(null);
  const [hasCluster, setHasCluster] = useState<boolean | null>(null);
  const [hasMapPosition, setHasMapPosition] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState('stars');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Any change to the search identity (query, filters, page size, sort) starts
  // a brand-new search — always from page 1. Without this, filtering while on
  // page 3 keeps the URL at page=3, which lands on an empty/dead page once the
  // narrowed results have fewer pages.
  const searchIdentity = JSON.stringify([
    query, language, topics, domains, minStars, maxStars,
    tracked, surfaced, hasCluster, hasMapPosition, perPage, sort, order,
  ]);
  useEffect(() => {
    setPage(1);
  }, [searchIdentity]);

  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (language) params.append('language', language);
  topics.forEach(t => params.append('topics', t));
  domains.forEach(d => params.append('domains', d));
  if (minStars !== '') params.append('min_stars', String(minStars));
  if (maxStars !== '') params.append('max_stars', String(maxStars));
  if (tracked !== null) params.append('tracked', String(tracked));
  if (surfaced !== null) params.append('surfaced', String(surfaced));
  if (hasCluster !== null) params.append('has_cluster', String(hasCluster));
  if (hasMapPosition !== null) params.append('has_map_position', String(hasMapPosition));
  params.append('page', String(page));
  params.append('per_page', String(perPage));
  params.append('sort', sort);
  params.append('order', order);

  const searchUrl = `/api/backend/search?${params.toString()}`;
  const { data, error, isLoading } = useSWR<SearchResponse>(
    query || showAdvanced ? searchUrl : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  }, []);

  const hasAdvancedFilters = topics.length > 0 || domains.length > 0 || minStars !== '' || maxStars !== '' || tracked !== null || surfaced !== null || hasCluster !== null || hasMapPosition !== null;

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Search Header */}
      <div className="border-b p-4 sticky top-0 z-10 backdrop-blur-sm"
        style={{ borderColor: 'var(--border-solid)', background: 'rgba(13,14,20,0.96)' }}
      >
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search repositories (name, description, topics)..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAdvanced || hasAdvancedFilters
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <Filter className="h-4 w-4" />
              {showAdvanced ? 'Hide' : 'Show'} Filters
              {(hasAdvancedFilters || (showAdvanced && (topics.length > 0 || domains.length > 0))) && (
                <span className="px-2 py-0.5 text-xs bg-primary-foreground/20 rounded-full">
                  {topics.length + domains.length + (minStars !== '' ? 1 : 0) + (maxStars !== '' ? 1 : 0) + (tracked !== null ? 1 : 0) + (surfaced !== null ? 1 : 0) + (hasCluster !== null ? 1 : 0) + (hasMapPosition !== null ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            {hasAdvancedFilters && (
              <button
                type="button"
                onClick={() => {
                  setTopics([]);
                  setDomains([]);
                  setMinStars('');
                  setMaxStars('');
                  setTracked(null);
                  setSurfaced(null);
                  setHasCluster(null);
                  setHasMapPosition(null);
                  setLanguage('');
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </button>
            )}
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-down">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  placeholder="e.g., TypeScript, Python"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Topics (comma-separated)</label>
                <input
                  type="text"
                  value={topics.join(', ')}
                  onChange={e => setTopics(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  placeholder="e.g., react, hooks, typescript"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Min Stars</label>
                <input
                  type="number"
                  value={minStars}
                  onChange={e => setMinStars(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Max Stars</label>
                <input
                  type="number"
                  value={maxStars}
                  onChange={e => setMaxStars(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="100000"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tracked</label>
                <select
                  value={tracked === null ? '' : String(tracked)}
                  onChange={e => setTracked(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Surfaced</label>
                <select
                  value={surfaced === null ? '' : String(surfaced)}
                  onChange={e => setSurfaced(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Has Cluster</label>
                <select
                  value={hasCluster === null ? '' : String(hasCluster)}
                  onChange={e => setHasCluster(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Has Map Position</label>
                <select
                  value={hasMapPosition === null ? '' : String(hasMapPosition)}
                  onChange={e => setHasMapPosition(e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive">
            <p>Failed to search: {error.message || 'Unknown error'}</p>
          </div>
        )}

        {data && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {data.items.length} of {data.total} results
              {data.query && <span> for "{data.query}"</span>}
            </div>

            {data.items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No repositories found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.items.map(repo => (
                  <RepoResultCard key={repo.id} repo={repo} onClick={onRepoClick} />
                ))}
              </div>
            )}

          </>
        )}

        {!data && !isLoading && !error && !query && !showAdvanced && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Search GitHub repositories</p>
            <p className="text-sm mt-1">Enter a query above or click "Show Filters" for advanced options</p>
          </div>
        )}
      </div>

      {/* Pagination — pinned footer, always visible regardless of how long the
          result list is. Buttons key off the response's own page numbers so the
          disabled/hover state always matches what's on screen. */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 shrink-0">
          <button
            type="button"
            onClick={() => setPage(data.page - 1)}
            disabled={data.page <= 1}
            aria-label="Previous page"
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-secondary text-foreground transition-colors hover:bg-secondary/80 hover:border-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-secondary"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-muted-foreground" aria-current="page">
            Page {data.page} of {data.total_pages}
          </span>
          <button
            type="button"
            onClick={() => setPage(data.page + 1)}
            disabled={data.page >= data.total_pages}
            aria-label="Next page"
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-secondary text-foreground transition-colors hover:bg-secondary/80 hover:border-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function RepoResultCard({ repo, onClick }: { repo: RepoBase; onClick: (id: number) => void }) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <button
      onClick={() => onClick(repo.id)}
      className="w-full text-left p-4 rounded-lg border border-border hover:bg-secondary transition-colors flex items-start gap-4 group"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate group-hover:text-primary transition-colors">{repo.full_name}</h3>
        <p className="text-sm text-muted-foreground truncate mt-1">{repo.description || 'No description'}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {repo.language && (
            <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">{repo.language}</span>
          )}
          {repo.topics.slice(0, 4).map(topic => (
            <span key={topic} className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">#{topic}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground ml-4 flex-shrink-0">
        <span className="font-mono text-foreground">{formatNumber(repo.stars)}</span>
        <span className="text-muted-foreground">★</span>
      </div>
    </button>
  );
}
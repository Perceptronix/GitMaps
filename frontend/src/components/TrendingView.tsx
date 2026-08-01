'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { TrendingUp, Loader2, ChevronDown, Clock, Star, GitBranch, ExternalLink } from 'lucide-react';
import type { TrendingResponse, RepoBase } from '@/lib/types';

interface TrendingViewProps {
  onRepoClick: (repoId: number) => void;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function TrendingView({ onRepoClick }: TrendingViewProps) {
  const [period, setPeriod] = useState<'1d' | '7d' | '30d'>('7d');
  const [language, setLanguage] = useState('');
  const [topic, setTopic] = useState('');
  const [domain, setDomain] = useState('');
  const [minScore, setMinScore] = useState<number | ''>('');
  const [surfacedOnly, setSurfacedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const params = new URLSearchParams();
  params.append('period', period);
  if (language) params.append('language', language);
  if (topic) params.append('topic', topic);
  if (domain) params.append('domain', domain);
  if (minScore !== '') params.append('min_score', String(minScore));
  if (surfacedOnly) params.append('surfaced_only', String(surfacedOnly));
  params.append('page', String(page));
  params.append('per_page', String(perPage));

  const trendingUrl = `/api/backend/trending?${params.toString()}`;
  const { data, error, isLoading } = useSWR<TrendingResponse>(
    trendingUrl,
    fetcher,
    { revalidateOnFocus: false }
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const periodLabels: Record<string, string> = {
    '1d': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 bg-background/95 backdrop-blur-sm sticky top-14 z-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">Trending Repositories</h2>
            <p className="text-sm text-muted-foreground">
              Ranked by momentum score · {periodLabels[period]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={e => { setPeriod(e.target.value as '1d' | '7d' | '30d'); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1d">24h</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-slide-down">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Language</label>
              <input
                type="text"
                value={language}
                onChange={e => { setLanguage(e.target.value); setPage(1); }}
                placeholder="e.g., TypeScript"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={e => { setTopic(e.target.value); setPage(1); }}
                placeholder="e.g., react"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={e => { setDomain(e.target.value); setPage(1); }}
                placeholder="e.g., AI"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Min Score</label>
              <input
                type="number"
                step="0.1"
                value={minScore}
                onChange={e => { setMinScore(e.target.value ? parseFloat(e.target.value) : ''); setPage(1); }}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={surfacedOnly}
                  onChange={e => { setSurfacedOnly(e.target.checked); setPage(1); }}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">Surfaced only</span>
              </label>
            </div>
          </div>
        )}
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
            <p>Failed to load trending: {error.message || 'Unknown error'}</p>
          </div>
        )}

        {data && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {data.items.length} of {data.total} repositories
              <span className="ml-2 px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">
                {periodLabels[period]}
              </span>
            </div>

            {data.items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No trending repositories</p>
                <p className="text-sm mt-1">Try adjusting the period or filters</p>
              </div>
            ) : (
              <ol className="space-y-2">
                {data.items.map((repo, index) => (
                  <TrendingRepoCard
                    key={repo.id}
                    repo={repo}
                    rank={data.per_page * (page - 1) + index + 1}
                    onClick={onRepoClick}
                  />
                ))}
              </ol>
            )}

            {/* Pagination */}
            {data.total_pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-muted-foreground">
                  Page {data.page} of {data.total_pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages}
                  className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TrendingRepoCard({ repo, rank, onClick }: { repo: RepoBase; rank: number; onClick: (id: number) => void }) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <li className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-secondary transition-colors group">
      <span className="w-8 text-right text-muted-foreground font-mono text-lg font-bold">
        #{rank}
      </span>
      <button
        onClick={() => onClick(repo.id)}
        className="flex-1 min-w-0 text-left"
      >
        <h3 className="font-medium truncate group-hover:text-primary transition-colors">{repo.full_name}</h3>
        <p className="text-sm text-muted-foreground truncate">{repo.description || 'No description'}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {repo.language && (
            <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">{repo.language}</span>
          )}
          {repo.topics.slice(0, 3).map(topic => (
            <span key={topic} className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">#{topic}</span>
          ))}
        </div>
      </button>
      <div className="flex items-center gap-4 text-sm text-muted-foreground ml-4 flex-shrink-0">
        <span className="flex items-center gap-1 font-mono text-foreground">
          <Star className="h-4 w-4" /> {formatNumber(repo.stars)}
        </span>
        <span className="flex items-center gap-1">
          <GitBranch className="h-4 w-4" /> {formatNumber(repo.forks)}
        </span>
        <a
          href={`https://github.com/${repo.full_name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-secondary transition-colors"
          aria-label="Open on GitHub"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </li>
  );
}
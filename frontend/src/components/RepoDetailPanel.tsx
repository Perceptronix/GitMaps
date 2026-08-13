'use client';

import { useEffect, useRef } from 'react';
import { X, ExternalLink, Star, GitBranch, Eye, Tag, Clock, Globe, FolderOpen } from 'lucide-react';
import type { RepoDetail, SimilarRepo } from '@/lib/types';

interface RepoDetailPanelProps {
  repo: RepoDetail;
  similar: SimilarRepo[];
  onClose: () => void;
}

function SignalBadge({ signal, data }: { signal: string; data: any }) {
  const isPositive = data.growth > 0;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
      <span className="text-xs font-medium capitalize">{signal}</span>
      <span className={`text-xs font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{data.growth_per_day?.toFixed(2)}/day
      </span>
      <span className="text-xs text-muted-foreground">score: {data.score?.toFixed(1) || 0}</span>
      <span className="text-xs text-muted-foreground">({(data.contribution * 100).toFixed(1)}%)</span>
    </div>
  );
}

function MomentumChart({ periods }: { periods: Record<string, { score: number; signals: Record<string, { growth_per_day: number; score: number; contribution: number }> }> }) {
  const periodOrder = ['1d', '7d', '30d'];
  const availablePeriods = periodOrder.filter(p => periods[p]);

  if (availablePeriods.length === 0) {
    return <p className="text-muted-foreground text-sm">No momentum data available</p>;
  }

  return (
    <div className="space-y-3">
      {availablePeriods.map(period => {
        const p = periods[period];
        const signals = Object.entries(p.signals || {}).filter(([, s]: any) => s.contribution > 0.01);

        return (
          <div key={period} className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium capitalize">{period}</span>
              <span className="text-lg font-bold text-primary">{p.score?.toFixed(1) || 0}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {signals.map(([name, data]: any) => (
                <SignalBadge key={name} signal={name} data={data} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RepoDetailPanel({ repo, similar, onClose }: RepoDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className="fixed right-0 top-0 bottom-0 w-full max-w-xl overflow-y-auto z-50 animate-slide-in"
      style={{
        background: 'var(--bg-panel)',
        borderLeft: '1px solid var(--border-solid)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="repo-title"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b p-4 sticky top-0 z-10 backdrop-blur-sm"
          style={{ borderColor: 'var(--border-solid)', background: 'rgba(19,20,26,0.96)' }}
        >
          <div className="flex-1 min-w-0">
            <h2 id="repo-title" className="text-lg font-bold truncate">{repo.full_name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{repo.description || 'No description'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a
              href={repo.homepage || `https://github.com/${repo.full_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="h-4 w-4" />
              {repo.homepage ? 'Website' : 'GitHub'}
            </a>
            {repo.language && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {repo.language}
              </span>
            )}
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" /> {formatNumber(repo.stars)}
              </span>
              <span className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" /> {formatNumber(repo.forks)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {formatNumber(repo.watchers)}
              </span>
            </div>
          </div>

          {/* Tags */}
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {repo.topics.map(topic => (
                <span key={topic} className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground">
                  #{topic}
                </span>
              ))}
            </div>
          )}

          {/* Domains */}
          {repo.domains.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Technology Domains</h3>
              <div className="flex flex-wrap gap-2">
                {repo.domains.map(domain => (
                  <span
                    key={domain}
                    className="px-2 py-1 text-xs rounded bg-primary/10 text-primary font-medium"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cluster & Map Position */}
          {(repo.cluster_id || repo.map_x !== null || repo.map_y !== null) && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <h3 className="text-sm font-medium mb-2">Map Position</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {repo.cluster_id && (
                  <div>
                    <span className="text-muted-foreground">Cluster</span>
                    <div className="font-medium">#{repo.cluster_id}</div>
                  </div>
                )}
                {repo.map_x !== null && repo.map_y !== null && (
                  <>
                    <div>
                      <span className="text-muted-foreground">X</span>
                      <div className="font-mono">{repo.map_x.toFixed(3)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Y</span>
                      <div className="font-mono">{repo.map_y.toFixed(3)}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Momentum */}
          {repo.momentum && (
            <div>
              <h3 className="text-sm font-medium mb-2">Momentum Scores</h3>
              <MomentumChart periods={repo.momentum.periods} />
            </div>
          )}

          {/* Significance */}
          {repo.significance_score !== null && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <h3 className="text-sm font-medium mb-2">Significance Score</h3>
              <div className="text-2xl font-bold text-primary">{repo.significance_score.toFixed(3)}</div>
              {repo.significance_vars && Object.keys(repo.significance_vars).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {Object.entries(repo.significance_vars).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span>{k}</span>
                      <span className="font-mono">
                        {typeof v === 'number' ? v.toFixed(3) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-4">
            <div>
              <span className="text-muted-foreground block">Created</span>
              <span className="font-medium">{formatDate(repo.created_at)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Last Push</span>
              <span className="font-medium">{formatDate(repo.pushed_at)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">License</span>
              <span className="font-medium">{repo.license || 'None'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Status</span>
              <span className="font-medium capitalize">
                {repo.archived ? 'Archived' : repo.is_fork ? 'Fork' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Similar Repos */}
        {similar.length > 0 && (
          <div className="border-t border-border p-4">
            <h3 className="text-sm font-medium mb-3">Similar Repositories</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {similar.slice(0, 10).map(s => (
                <button
                  key={s.id}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> {formatNumber(s.stars)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">
                      {(s.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
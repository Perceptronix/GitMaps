'use client';

import { Star, Tag, ExternalLink } from 'lucide-react';
import type { SimilarRepo } from '@/lib/types';

interface SimilarReposPanelProps {
  repos: SimilarRepo[];
}

export function SimilarReposPanel({ repos }: SimilarReposPanelProps) {
  if (repos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No similar repositories found</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-2">
      {repos.map(repo => (
        <a
          key={repo.id}
          href={`https://github.com/${repo.full_name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate group-hover:text-primary transition-colors">
              {repo.full_name}
            </h4>
            <p className="text-sm text-muted-foreground truncate">{repo.description || 'No description'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {repo.language && (
                <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">
                  {repo.language}
                </span>
              )}
              {repo.topics.slice(0, 3).map(topic => (
                <span key={topic} className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                  #{topic}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-4">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" /> {formatNumber(repo.stars)}
            </span>
            <span className="px-2 py-1 rounded bg-primary/10 text-primary font-mono font-medium">
              {(repo.similarity * 100).toFixed(1)}%
            </span>
            <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100" />
          </div>
        </a>
      ))}
    </div>
  );
}
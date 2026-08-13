'use client';

import { Search, TrendingUp, MapIcon, Github } from 'lucide-react';

type View = 'map' | 'search' | 'trending';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'map',      label: 'Explore',   icon: <MapIcon className="h-5 w-5" /> },
  { id: 'search',   label: 'Search',    icon: <Search className="h-5 w-5" /> },
  { id: 'trending', label: 'Trending',  icon: <TrendingUp className="h-5 w-5" /> },
];

export function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-w)] flex-col border-r border-border/50 bg-background/95 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
        <span className="text-xl font-bold text-primary">GitMaps</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              currentView === id
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
            aria-current={currentView === id ? 'page' : undefined}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom attribution */}
      <div className="mt-auto px-5 py-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <Github className="h-3.5 w-3.5" />
          <span>AI-powered GitHub intelligence</span>
        </div>
      </div>
    </aside>
  );
}

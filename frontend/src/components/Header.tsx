'use client';

import { Search, TrendingUp, Map, X } from 'lucide-react';

type View = 'map' | 'search' | 'trending';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const views: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'map', label: 'Map', icon: <Map className="h-4 w-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="h-4 w-4" /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-14 items-center px-4 gap-4">
        <h1 className="flex items-center gap-2 text-lg font-bold text-primary">
          <Map className="h-5 w-5" />
          GitMaps
        </h1>
        <nav className="flex-1 flex justify-center gap-1" aria-label="Main navigation">
          {views.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentView === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              aria-current={currentView === id ? 'page' : undefined}
            >
              {icon} {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
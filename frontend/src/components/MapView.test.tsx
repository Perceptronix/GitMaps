import { render, fireEvent } from '@testing-library/react';
import { MapView } from './MapView';
import type { ClusterPosition, RepoMapPosition } from '@/lib/types';

const clusters: ClusterPosition[] = [
  { cluster_id: 1, domain: 'AI', label: 'AI Tooling', member_count: 3, x: -0.3, y: 0.1 },
  { cluster_id: 2, domain: 'Web', label: 'Web Frontend', member_count: 2, x: 0.4, y: -0.2 },
];

const repos: RepoMapPosition[] = [
  { repo_id: 10, x: -0.31, y: 0.11, cluster_id: 1, domain: 'AI', domains: ['AI'], name: 'llm', owner: 'acme', stars: 5000 },
  { repo_id: 11, x: -0.28, y: 0.09, cluster_id: 1, domain: 'AI', domains: ['AI'], name: 'embed', owner: 'acme', stars: 1200 },
  { repo_id: 12, x: -0.29, y: 0.13, cluster_id: 1, domain: 'AI', domains: ['AI'], name: 'rerank', owner: 'acme', stars: 800 },
  { repo_id: 20, x: 0.41, y: -0.21, cluster_id: 2, domain: 'Web', domains: ['Web'], name: 'ui', owner: 'bob', stars: 300 },
  { repo_id: 21, x: 0.39, y: -0.19, cluster_id: 2, domain: 'Web', domains: ['Web'], name: 'hooks', owner: 'bob', stars: 90 },
  { repo_id: 99, x: 0.05, y: 0.05, cluster_id: null, domain: null, domains: ['Uncategorized'], name: 'misc', owner: 'carol', stars: 10 },
];

describe('MapView', () => {
  it('renders one dot per repo and a label per cluster', () => {
    const { container } = render(
      <MapView
        clusters={clusters}
        repos={repos}
        onRepoClick={() => {}}
        onRepoHover={() => {}}
        hoveredRepo={null}
        filterDomains={[]}
        filterClusters={[]}
      />
    );

    // One visible dot per repo (the .dot circle, inside a per-repo .repo group),
    // all inside the .repos layer (glow circles excluded).
    expect(container.querySelectorAll('g.repos circle.dot')).toHaveLength(repos.length);
    // Each cluster label renders twice: an offset shadow layer + the white text.
    expect(container.textContent).toContain('AI Tooling');
    expect(container.textContent).toContain('Web Frontend');
  });

  it('gives every repo a generous invisible hit target', () => {
    const { container } = render(
      <MapView
        clusters={clusters}
        repos={repos}
        onRepoClick={() => {}}
        onRepoHover={() => {}}
        hoveredRepo={null}
        filterDomains={[]}
        filterClusters={[]}
      />
    );

    // One hit-area per repo, with a fixed radius ≥14px regardless of the
    // star-scaled visual dot size — the hover/click surface that matters.
    const hitAreas = container.querySelectorAll('g.repos circle.hit-area');
    expect(hitAreas).toHaveLength(repos.length);
    hitAreas.forEach((c) => {
      expect(Number(c.getAttribute('r'))).toBeGreaterThanOrEqual(14);
    });
  });

  it('calls onRepoClick with the repo id when a dot is clicked', () => {
    const onRepoClick = jest.fn();
    const { container } = render(
      <MapView
        clusters={clusters}
        repos={repos}
        onRepoClick={onRepoClick}
        onRepoHover={() => {}}
        hoveredRepo={null}
        filterDomains={[]}
        filterClusters={[]}
      />
    );

    const hitArea = container.querySelector('g.repos circle.hit-area') as SVGCircleElement;
    expect(hitArea).not.toBeNull();
    // Clicking the invisible hit target (not the visible dot) must still
    // resolve to the repo — the pointer surface is the group's hit area.
    fireEvent.click(hitArea);
    expect(onRepoClick).toHaveBeenCalledTimes(1);
    // First repo in the (sorted) dataset is repo_id 10.
    expect(onRepoClick).toHaveBeenCalledWith(10);
  });
});

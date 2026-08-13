import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '@/components/FilterPanel';

const mockClusters = [
  { id: 1, domain: 'AI', label: 'Cluster 1', member_count: 10, centroid_x: 0, centroid_y: 0, computed_at: null },
  { id: 2, domain: 'Frontend', label: 'Cluster 2', member_count: 5, centroid_x: 1, centroid_y: 1, computed_at: null },
];

describe('FilterPanel', () => {
  it('renders domain and cluster filters', () => {
    render(
      <FilterPanel
        domains={['AI', 'Frontend', 'Backend']}
        selectedDomains={[]}
        onDomainsChange={jest.fn()}
        selectedClusters={[]}
        onClustersChange={jest.fn()}
        clusters={mockClusters}
      />
    );

    expect(screen.getByText('Domains')).toBeInTheDocument();
    expect(screen.getByText('Clusters')).toBeInTheDocument();
  });

  it('shows selected domain count badge', () => {
    render(
      <FilterPanel
        domains={['AI', 'Frontend']}
        selectedDomains={['AI']}
        onDomainsChange={jest.fn()}
        selectedClusters={[]}
        onClustersChange={jest.fn()}
        clusters={mockClusters}
      />
    );

    expect(screen.getByText('1 active')).toBeInTheDocument();
  });

  it('toggles domain selection', () => {
    const onDomainsChange = jest.fn();
    render(
      <FilterPanel
        domains={['AI', 'Frontend']}
        selectedDomains={[]}
        onDomainsChange={onDomainsChange}
        selectedClusters={[]}
        onClustersChange={jest.fn()}
        clusters={mockClusters}
      />
    );

    // Click the AI domain button directly by its label
    const aiButton = screen.getByLabelText('Toggle AI filter');
    fireEvent.click(aiButton);

    expect(onDomainsChange).toHaveBeenCalledWith(['AI']);
  });

  it('shows clear filters button when filters active', () => {
    render(
      <FilterPanel
        domains={['AI']}
        selectedDomains={['AI']}
        onDomainsChange={jest.fn()}
        selectedClusters={[]}
        onClustersChange={jest.fn()}
        clusters={mockClusters}
      />
    );

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });
});
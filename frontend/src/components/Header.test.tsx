import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/Header';

describe('Header', () => {
  it('renders navigation buttons', () => {
    render(<Header currentView="map" onViewChange={jest.fn()} />);

    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Trending')).toBeInTheDocument();
  });

  it('highlights active view', () => {
    render(<Header currentView="search" onViewChange={jest.fn()} />);

    const searchButton = screen.getByText('Search').closest('button');
    expect(searchButton).toHaveClass('bg-primary/15');
  });

  it('calls onViewChange when button clicked', () => {
    const onViewChange = jest.fn();
    render(<Header currentView="map" onViewChange={onViewChange} />);

    fireEvent.click(screen.getByText('Trending'));
    expect(onViewChange).toHaveBeenCalledWith('trending');
  });
});

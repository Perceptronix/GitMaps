import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchPanel } from '@/components/SearchPanel';
import type { RepoBase } from '@/lib/types';

const repo: RepoBase = {
  id: 1,
  owner: 'acme',
  name: 'repo',
  full_name: 'acme/repo',
  description: null,
  topics: [],
  language: null,
  license: null,
  homepage: null,
  archived: false,
  is_fork: false,
  created_at: null,
  pushed_at: null,
  stars: 100,
  forks: 0,
  watchers: 0,
  open_issues: 0,
};

/** Scripted /search backend: echoes the requested page, always 3 pages deep. */
function mockSearchFetch(pages: number) {
  return jest.fn(async (url: string | URL) => {
    // the app fetches a relative path — give it a base for URL parsing
    const u = new URL(String(url), 'http://localhost');
    const page = Number(u.searchParams.get('page') || '1');
    return {
      json: async () => ({
        items: [repo],
        page,
        per_page: 20,
        total: 45,
        total_pages: pages,
        query: u.searchParams.get('q') || null,
      }),
    };
  });
}

describe('SearchPanel pagination', () => {
  afterEach(() => {
    // reset fetch so SWR state from one test can't bleed into the next
    global.fetch = jest.fn();
    jest.restoreAllMocks();
  });

  it('shows a pinned pagination footer and Next advances the page', async () => {
    const fetchMock = mockSearchFetch(3);
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<SearchPanel onRepoClick={jest.fn()} initialQuery="test" />);

    // page 1 of 3 renders once the (mocked) search resolves
    await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeInTheDocument());

    const next = screen.getByRole('button', { name: /next page/i });
    const previous = screen.getByRole('button', { name: /previous page/i });
    expect(next).not.toBeDisabled();
    expect(previous).toBeDisabled(); // on the first page, only Next makes sense

    fireEvent.click(next);

    await waitFor(() => expect(screen.getByText('Page 2 of 3')).toBeInTheDocument());
    // the second request carried page=2
    expect(String(fetchMock.mock.calls[1][0])).toContain('page=2');
  });

  it('disables Next on the last page', async () => {
    global.fetch = mockSearchFetch(3) as unknown as typeof fetch;

    render(<SearchPanel onRepoClick={jest.fn()} initialQuery="test" />);
    await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeInTheDocument());

    const next = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(next); // -> page 2
    await waitFor(() => expect(screen.getByText('Page 2 of 3')).toBeInTheDocument());
    fireEvent.click(next); // -> page 3
    await waitFor(() => expect(screen.getByText('Page 3 of 3')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous page/i })).not.toBeDisabled();
  });

  it('resets to page 1 when the search query changes', async () => {
    const fetchMock = mockSearchFetch(3);
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<SearchPanel onRepoClick={jest.fn()} initialQuery="test" />);
    await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeInTheDocument());

    // advance to page 3
    const next = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(next);
    await waitFor(() => expect(screen.getByText('Page 2 of 3')).toBeInTheDocument());
    fireEvent.click(next);
    await waitFor(() => expect(screen.getByText('Page 3 of 3')).toBeInTheDocument());

    // typing a new query is a brand-new search -> must land on page 1
    const input = screen.getByPlaceholderText(/search repositories/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'react' } });
    await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeInTheDocument());
  });
});

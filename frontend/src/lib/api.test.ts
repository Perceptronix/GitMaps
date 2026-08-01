import { api } from '@/lib/api';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('ApiClient', () => {
  let mockGet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet = jest.fn();
    (axios.create as jest.Mock).mockReturnValue({ get: mockGet });
  });

  it('should have all required methods', () => {
    expect(typeof api.getMap).toBe('function');
    expect(typeof api.getRepo).toBe('function');
    expect(typeof api.getSimilar).toBe('function');
    expect(typeof api.getClusters).toBe('function');
    expect(typeof api.search).toBe('function');
    expect(typeof api.getTrending).toBe('function');
    expect(typeof api.healthCheck).toBe('function');
  });

  it('calls correct endpoint for getMap', async () => {
    const mockData = { clusters: [], repos: [], updated_at: null };
    mockGet.mockResolvedValue({ data: mockData });

    const result = await api.getMap();
    expect(result).toEqual(mockData);
    expect(mockGet).toHaveBeenCalledWith('/map');
  });

  it('calls correct endpoint for getRepo', async () => {
    const mockData = { id: 1, full_name: 'test/repo' };
    mockGet.mockResolvedValue({ data: mockData });

    const result = await api.getRepo(1);
    expect(result).toEqual(mockData);
    expect(mockGet).toHaveBeenCalledWith('/repo/1');
  });

  it('builds query params for search', async () => {
    mockGet.mockResolvedValue({ data: { items: [], total: 0 } });

    await api.search({ q: 'test', language: 'TypeScript', page: 2, per_page: 10 });

    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('q=test')
    );
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('language=TypeScript')
    );
  });
});
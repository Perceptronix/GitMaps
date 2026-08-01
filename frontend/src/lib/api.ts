import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  RepoBase,
  RepoDetail,
  SimilarResponse,
  MapResponse,
  ClusterSummary,
  ClustersResponse,
  SearchResponse,
  TrendingResponse,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getMap(): Promise<MapResponse> {
    const response = await this.client.get<MapResponse>('/map');
    return response.data;
  }

  async getRepo(id: number): Promise<RepoDetail> {
    const response = await this.client.get<RepoDetail>(`/repo/${id}`);
    return response.data;
  }

  async getSimilar(
    id: number,
    options?: {
      language?: string;
      topic?: string;
      min_similarity?: number;
      top_n?: number;
    }
  ): Promise<SimilarResponse> {
    const params = new URLSearchParams();
    if (options?.language) params.append('language', options.language);
    if (options?.topic) params.append('topic', options.topic);
    if (options?.min_similarity !== undefined) params.append('min_similarity', String(options.min_similarity));
    if (options?.top_n !== undefined) params.append('top_n', String(options.top_n));

    const response = await this.client.get<SimilarResponse>(`/similar/${id}?${params.toString()}`);
    return response.data;
  }

  async getClusters(options?: {
    page?: number;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    domain?: string;
  }): Promise<ClustersResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));
    if (options?.sort) params.append('sort', options.sort);
    if (options?.order) params.append('order', options.order);
    if (options?.domain) params.append('domain', options.domain);

    const response = await this.client.get<ClustersResponse>(`/clusters?${params.toString()}`);
    return response.data;
  }

  async search(options?: {
    q?: string;
    language?: string;
    topics?: string[];
    domains?: string[];
    min_stars?: number;
    max_stars?: number;
    tracked?: boolean;
    surfaced?: boolean;
    has_cluster?: boolean;
    has_map_position?: boolean;
    page?: number;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<SearchResponse> {
    const params = new URLSearchParams();
    if (options?.q) params.append('q', options.q);
    if (options?.language) params.append('language', options.language);
    if (options?.topics) options.topics.forEach(t => params.append('topics', t));
    if (options?.domains) options.domains.forEach(d => params.append('domains', d));
    if (options?.min_stars !== undefined) params.append('min_stars', String(options.min_stars));
    if (options?.max_stars !== undefined) params.append('max_stars', String(options.max_stars));
    if (options?.tracked !== undefined) params.append('tracked', String(options.tracked));
    if (options?.surfaced !== undefined) params.append('surfaced', String(options.surfaced));
    if (options?.has_cluster !== undefined) params.append('has_cluster', String(options.has_cluster));
    if (options?.has_map_position !== undefined) params.append('has_map_position', String(options.has_map_position));
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));
    if (options?.sort) params.append('sort', options.sort);
    if (options?.order) params.append('order', options.order);

    const response = await this.client.get<SearchResponse>(`/search?${params.toString()}`);
    return response.data;
  }

  async getTrending(options?: {
    period?: '1d' | '7d' | '30d';
    language?: string;
    topic?: string;
    domain?: string;
    min_score?: number;
    surfaced_only?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<TrendingResponse> {
    const params = new URLSearchParams();
    if (options?.period) params.append('period', options.period);
    if (options?.language) params.append('language', options.language);
    if (options?.topic) params.append('topic', options.topic);
    if (options?.domain) params.append('domain', options.domain);
    if (options?.min_score !== undefined) params.append('min_score', String(options.min_score));
    if (options?.surfaced_only !== undefined) params.append('surfaced_only', String(options.surfaced_only));
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));

    const response = await this.client.get<TrendingResponse>(`/trending?${params.toString()}`);
    return response.data;
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>('/health');
    return response.data;
  }
}

export const api = new ApiClient();
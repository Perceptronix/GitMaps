export interface RepoBase {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  topics: string[];
  language: string | null;
  license: string | null;
  homepage: string | null;
  archived: boolean;
  is_fork: boolean;
  created_at: string | null;
  pushed_at: string | null;
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
}

export interface MomentumSignal {
  signal: string;
  start: number | null;
  end: number | null;
  growth: number;
  span_days: number;
  growth_per_day: number;
  prior_floor: number;
  size_factor: number;
  target_per_day: number;
  weight: number;
  score: number;
  contribution: number;
}

export interface MomentumPeriod {
  period: string;
  score: number;
  window_days: number;
  age_days: number | null;
  age_factor: number;
  age_cap: number;
  max_signal_score: number;
  signals: Record<string, MomentumSignal>;
}

export interface MomentumScores {
  repo_id: number;
  computed_at: string;
  periods: Record<string, MomentumPeriod>;
}

export interface RepoDetail extends RepoBase {
  tracked: boolean;
  surfaced: boolean;
  surfaced_at: string | null;
  significance_score: number | null;
  significance_vars: Record<string, unknown>;
  domains: string[];
  domains_fingerprint: string | null;
  classified_at: string | null;
  embedding_fingerprint: string | null;
  embedded_at: string | null;
  cluster_id: number | null;
  clustered_at: string | null;
  map_x: number | null;
  map_y: number | null;
  momentum: MomentumScores | null;
}

export interface SimilarRepo {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  surfaced: boolean;
  similarity: number;
}

export interface SimilarResponse {
  source: string;
  items: SimilarRepo[];
}

export interface ClusterPosition {
  cluster_id: number;
  domain: string;
  label: string;
  member_count: number;
  x: number;
  y: number;
}

export interface RepoMapPosition {
  repo_id: number;
  x: number;
  y: number;
  cluster_id: number | null;
  domain: string | null;
  name: string | null;
  owner: string | null;
  stars: number;
}

export interface MapResponse {
  clusters: ClusterPosition[];
  repos: RepoMapPosition[];
  /** Total repos with a map position (what discovery/surfacing produced). */
  total: number;
  updated_at: string | null;
}

export interface ClusterSummary {
  id: number;
  domain: string;
  label: string;
  member_count: number;
  centroid_x: number;
  centroid_y: number;
  computed_at: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ClustersResponse extends PaginatedResponse<ClusterSummary> {}

export interface SearchResponse extends PaginatedResponse<RepoBase> {
  query: string | null;
}

export interface TrendingResponse extends PaginatedResponse<RepoBase> {
  period: string;
}
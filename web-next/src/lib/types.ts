// AI Trend Tracker - Type Definitions

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// Dashboard
export interface DashboardSummary {
  total_models: number;
  total_videos: number;
  total_papers: number;
  total_news: number;
  total_github_projects: number;
  total_conferences: number;
  total_platforms: number;
  total_jobs: number;
  total_policies: number;
  trending_keywords: TrendingKeyword[];
  category_stats: CategoryStat[];
  last_updated: string;
}

export interface CategoryStat {
  category: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  change_percent: number;
  last_updated: string;
}

export interface TrendingKeyword {
  keyword: string;
  count: number;
  category: string;
  trend: 'up' | 'down' | 'stable';
}

// Hugging Face Models
export interface HuggingFaceModel {
  id: number;
  model_id: string;
  model_name: string;
  author: string;
  description?: string;
  summary?: string;
  task?: string;
  tags: string[];
  library_name?: string;
  downloads: number;
  likes: number;
  last_modified?: string;
  collected_at?: string;
  url?: string;
  is_featured?: boolean;
  is_trending?: boolean;
  // Legacy aliases for backward compat
  name?: string;
  pipeline_tag?: string;
}

// YouTube Videos
export interface YouTubeVideo {
  id: number | string;
  video_id?: string;
  title: string;
  channel_name?: string;
  channel_title?: string;
  channel_id?: string;
  channel_language?: string;
  description?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at?: string;
  thumbnail_url?: string;
  url?: string;
  duration?: string;
  tags: string[];
  summary?: string;
}

// AI Papers
export interface AIPaper {
  id: number | string;
  arxiv_id?: string;
  title: string;
  authors: string[];
  abstract: string;
  summary?: string;
  published_date?: string;
  source?: string;
  url?: string;
  pdf_url?: string;
  arxiv_url?: string;
  categories: string[];
  topic?: string;
  conference_name?: string;
  conference_year?: number;
  citations?: number;
  keywords: string[];
}

// AI News
export interface AINews {
  id: number | string;
  title: string;
  source: string;
  author?: string;
  description?: string;
  content?: string;
  excerpt?: string;
  url: string;
  source_url?: string;
  image_url?: string;
  published_at?: string;
  published_date?: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  summary?: string;
}

// GitHub Projects
export interface GitHubProject {
  id: number | string;
  repo_name?: string;
  owner?: string;
  name?: string;
  full_name?: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  topics: string[];
  url?: string;
  created_at?: string;
  updated_at?: string;
  updated_at_github?: string;
  open_issues: number;
  watchers: number;
  trending_score?: number;
  summary?: string;
  keywords?: string[];
}

// AI Conferences
export interface AIConference {
  id: number | string;
  name?: string;
  conference_name?: string;
  conference_acronym?: string;
  description?: string;
  summary?: string;
  start_date: string;
  end_date: string;
  location: string;
  url?: string;
  website_url?: string;
  type: 'academic' | 'industry' | 'workshop' | 'meetup';
  tier?: 'A*' | 'A' | 'B';
  topics: string[];
  highlights?: string[];
  submission_deadline?: string;
  is_virtual: boolean;
}

// AI Platforms
export interface AIPlatform {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  pricing: string;
  features: string[];
  rating?: number;
  logo_url?: string;
  last_updated: string;
}

// AI Jobs
export interface AIJob {
  id: number | string;
  title?: string;
  job_title?: string;
  company?: string;
  company_name?: string;
  location?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  description?: string;
  requirements: string[];
  salary_range?: string;
  url?: string;
  job_url?: string;
  posted_at?: string;
  posted_date?: string;
  skills: string[];
  required_skills?: string[];
  summary?: string;
  keywords?: string[];
  is_remote?: boolean;
  experience_level: 'junior' | 'mid' | 'senior' | 'lead';
}

// AI Policies
export interface AIPolicy {
  id: number | string;
  title: string;
  country?: string;
  organization?: string;
  description?: string;
  category?: string;
  status?: 'proposed' | 'enacted' | 'under_review' | 'withdrawn' | string;
  policy_type?: string;
  effective_date?: string;
  url?: string;
  source_url?: string;
  published_at?: string;
  keywords: string[];
  impact_areas?: string[];
  summary?: string;
  source?: string;
}

// System
export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  version: string;
  services: ServiceStatus[];
  last_crawl: string | null;
  next_crawl: string | null;
  database: {
    status: string;
    size: string;
    collections: number;
  };
  crawler: {
    status: string;
    active_jobs: number;
    completed_today: number;
    failed_today: number;
  };
  scheduler_jobs?: SchedulerJob[];
  categories?: Record<string, {
    name: string;
    total: number;
    last_update: string | null;
    status: string;
  }>;
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  last_check: string;
  response_time_ms?: number;
}

export interface SchedulerJob {
  id: string;
  name: string;
  next_run: string | null;
  last_run: string | null;
  last_status: 'success' | 'error' | null;
  last_error?: string | null;
}

// Keyword
export interface Keyword {
  id: string;
  keyword: string;
  category: string;
  count: number;
  first_seen: string;
  last_seen: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SearchResultItem {
  category: string;
  id: string;
  title: string;
  snippet?: string;
  url?: string;
  score: number;
  published_at?: string | null;
}

export interface GlobalSearchResponse extends PaginatedResponse<SearchResultItem> {
  q: string;
}

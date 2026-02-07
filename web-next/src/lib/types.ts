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
  id: string;
  name: string;
  author: string;
  description: string;
  downloads: number;
  likes: number;
  tags: string[];
  pipeline_tag: string;
  last_modified: string;
  url: string;
  trending_score?: number;
}

// YouTube Videos
export interface YouTubeVideo {
  id: string;
  title: string;
  channel_name: string;
  channel_id: string;
  description: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string;
  thumbnail_url: string;
  url: string;
  duration: string;
  tags: string[];
}

// AI Papers
export interface AIPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published_date: string;
  source: string;
  url: string;
  pdf_url?: string;
  categories: string[];
  citations?: number;
  keywords: string[];
}

// AI News
export interface AINews {
  id: string;
  title: string;
  source: string;
  author?: string;
  description: string;
  content?: string;
  url: string;
  image_url?: string;
  published_at: string;
  category: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords: string[];
}

// GitHub Projects
export interface GitHubProject {
  id: string;
  name: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  url: string;
  created_at: string;
  updated_at: string;
  open_issues: number;
  watchers: number;
  trending_score?: number;
}

// AI Conferences
export interface AIConference {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  url: string;
  type: 'academic' | 'industry' | 'workshop' | 'meetup';
  topics: string[];
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
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  description: string;
  requirements: string[];
  salary_range?: string;
  url: string;
  posted_at: string;
  skills: string[];
  experience_level: 'junior' | 'mid' | 'senior' | 'lead';
}

// AI Policies
export interface AIPolicy {
  id: string;
  title: string;
  country: string;
  organization: string;
  description: string;
  category: string;
  status: 'proposed' | 'enacted' | 'under_review' | 'withdrawn';
  effective_date?: string;
  url: string;
  published_at: string;
  keywords: string[];
}

// System
export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  version: string;
  services: ServiceStatus[];
  last_crawl: string;
  next_crawl: string;
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
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  last_check: string;
  response_time_ms?: number;
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

// AI Trend Tracker - API Client

import type {
  ApiResponse,
  DashboardSummary,
  TrendingKeyword,
  CategoryStat,
  SystemStatus,
  Keyword,
  HuggingFaceModel,
  YouTubeVideo,
  AIPaper,
  AINews,
  GitHubProject,
  AIConference,
  AIPlatform,
  AIJob,
  AIPolicy,
  PaginatedResponse,
} from './types';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Generic API fetch function with authentication
 */
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, headers: customHeaders, ...fetchOptions } = options;

  // Build URL with query parameters
  const fullPath = `${BASE_URL}${endpoint}`;
  const url = BASE_URL ? new URL(fullPath) : new URL(fullPath, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `API Error ${response.status}: ${response.statusText} - ${errorBody}`
    );
  }

  return response.json() as Promise<T>;
}

// ─── Dashboard ───────────────────────────────────────────────

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchApi<DashboardSummary>('/api/v1/dashboard/summary');
}

export async function getDashboardTrendingKeywords(): Promise<TrendingKeyword[]> {
  return fetchApi<TrendingKeyword[]>('/api/v1/dashboard/trending-keywords');
}

export async function getDashboardCategoryStats(): Promise<CategoryStat[]> {
  return fetchApi<CategoryStat[]>('/api/v1/dashboard/category-stats');
}

// ─── System ──────────────────────────────────────────────────

export async function getSystemStatus(): Promise<SystemStatus> {
  return fetchApi<SystemStatus>('/api/v1/system/status');
}

// ─── Keywords ────────────────────────────────────────────────

export async function getKeywords(
  category?: string
): Promise<ApiResponse<Keyword[]>> {
  return fetchApi<ApiResponse<Keyword[]>>('/api/v1/system/keywords', {
    params: { category },
  });
}

// ─── Hugging Face ────────────────────────────────────────────
// Response: { total: number, items: HuggingFaceModel[] }

export async function getHuggingFaceModels(
  page = 1,
  pageSize = 20
): Promise<{ total: number; items: HuggingFaceModel[] }> {
  return fetchApi<{ total: number; items: HuggingFaceModel[] }>(
    '/api/v1/huggingface/',
    { params: { page, page_size: pageSize } }
  );
}

export async function getHuggingFaceModel(
  id: string
): Promise<HuggingFaceModel> {
  return fetchApi<HuggingFaceModel>(`/api/v1/huggingface/${id}`);
}

// ─── YouTube ─────────────────────────────────────────────────
// Response: { total: number, videos: YouTubeVideo[] }

export async function getYouTubeVideos(
  page = 1,
  pageSize = 20
): Promise<{ total: number; videos: YouTubeVideo[] }> {
  return fetchApi<{ total: number; videos: YouTubeVideo[] }>(
    '/api/v1/youtube/videos',
    { params: { page, page_size: pageSize } }
  );
}

// ─── Papers ──────────────────────────────────────────────────
// Response: { total: number, papers: AIPaper[] }

export async function getAIPapers(
  page = 1,
  pageSize = 20
): Promise<{ total: number; papers: AIPaper[] }> {
  return fetchApi<{ total: number; papers: AIPaper[] }>('/api/v1/papers/', {
    params: { page, page_size: pageSize },
  });
}

// ─── News ────────────────────────────────────────────────────
// Response: { total: number, news: AINews[] }

export async function getAINews(
  page = 1,
  pageSize = 20
): Promise<{ total: number; news: AINews[] }> {
  return fetchApi<{ total: number; news: AINews[] }>('/api/v1/news/news', {
    params: { page, page_size: pageSize },
  });
}

// ─── GitHub ──────────────────────────────────────────────────
// Response: { total: number, items: GitHubProject[] }

export async function getGitHubProjects(
  page = 1,
  pageSize = 20
): Promise<{ total: number; items: GitHubProject[] }> {
  return fetchApi<{ total: number; items: GitHubProject[] }>(
    '/api/v1/github/projects',
    { params: { page, page_size: pageSize } }
  );
}

// ─── Conferences ─────────────────────────────────────────────
// Response: { total: number, items: AIConference[] }

export async function getAIConferences(
  page = 1,
  pageSize = 20
): Promise<{ total: number; items: AIConference[] }> {
  return fetchApi<{ total: number; items: AIConference[] }>(
    '/api/v1/conferences/',
    { params: { page, page_size: pageSize } }
  );
}

// ─── Platforms (backend: /tools) ─────────────────────────────
// Response: { total: number, items: AIPlatform[] }

export async function getAIPlatforms(
  page = 1,
  pageSize = 20
): Promise<{ total: number; items: AIPlatform[] }> {
  return fetchApi<{ total: number; items: AIPlatform[] }>('/api/v1/tools/', {
    params: { page, page_size: pageSize },
  });
}

// ─── Jobs ────────────────────────────────────────────────────
// Response: { total: number, items: AIJob[] }

export async function getAIJobs(
  page = 1,
  pageSize = 20
): Promise<{ total: number; items: AIJob[] }> {
  return fetchApi<{ total: number; items: AIJob[] }>('/api/v1/jobs/', {
    params: { page, page_size: pageSize },
  });
}

// ─── Policies ────────────────────────────────────────────────
// Response: { total: number, items: AIPolicy[] }

export async function getAIPolicies(
  page = 1,
  pageSize = 20
): Promise<{ total: number; items: AIPolicy[] }> {
  return fetchApi<{ total: number; items: AIPolicy[] }>('/api/v1/policies/', {
    params: { page, page_size: pageSize },
  });
}

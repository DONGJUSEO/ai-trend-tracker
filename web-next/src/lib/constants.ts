// AI Trend Tracker - Constants

export const CATEGORIES = [
  { id: 'dashboard', name: 'Dashboard', koreanName: '대시보드', iconKey: 'dashboard', color: '#E53E3E', href: '/' },
  { id: 'huggingface', name: 'Hugging Face', koreanName: '허깅페이스', iconKey: 'huggingface', color: '#FFD21E', href: '/huggingface' },
  { id: 'youtube', name: 'YouTube', koreanName: '유튜브', iconKey: 'youtube', color: '#FF0000', href: '/youtube' },
  { id: 'papers', name: 'AI Papers', koreanName: 'AI 논문', iconKey: 'papers', color: '#3B82F6', href: '/papers' },
  { id: 'news', name: 'AI News', koreanName: 'AI 뉴스', iconKey: 'news', color: '#10B981', href: '/news' },
  { id: 'github', name: 'GitHub', koreanName: 'GitHub', iconKey: 'github', color: '#8B5CF6', href: '/github' },
  { id: 'conferences', name: 'Conferences', koreanName: '컨퍼런스', iconKey: 'conferences', color: '#F59E0B', href: '/conferences' },
  { id: 'platforms', name: 'AI Platforms', koreanName: 'AI 플랫폼', iconKey: 'platforms', color: '#EC4899', href: '/platforms' },
  { id: 'jobs', name: 'AI Jobs', koreanName: 'AI 채용', iconKey: 'jobs', color: '#06B6D4', href: '/jobs' },
  { id: 'policies', name: 'AI Policies', koreanName: 'AI 정책', iconKey: 'policies', color: '#6366F1', href: '/policies' },
  { id: 'system', name: 'System', koreanName: '시스템', iconKey: 'system', color: '#6B7280', href: '/system' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const NAV_ITEMS = CATEGORIES;

export const APP_NAME = 'AI봄';
export const APP_VERSION = 'v3.0';
export const APP_DESCRIPTION = 'AI 트렌드를 한눈에 보는 큐레이션 서비스';

// Sidebar dimensions
export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 0;

// Route to category mapping helper
export function getCategoryByHref(href: string) {
  return CATEGORIES.find((cat) => cat.href === href) ?? CATEGORIES[0];
}

export function getCategoryById(id: string) {
  return CATEGORIES.find((cat) => cat.id === id);
}

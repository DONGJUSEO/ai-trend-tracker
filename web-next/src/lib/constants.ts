// AI Trend Tracker - Constants

export const CATEGORIES = [
  { id: 'dashboard', name: 'Dashboard', koreanName: '대시보드', icon: '📊', color: '#E53E3E', href: '/' },
  { id: 'huggingface', name: 'Hugging Face', koreanName: '허깅페이스', icon: '🤗', color: '#FFD21E', href: '/huggingface' },
  { id: 'youtube', name: 'YouTube', koreanName: '유튜브', icon: '📺', color: '#FF0000', href: '/youtube' },
  { id: 'papers', name: 'AI Papers', koreanName: 'AI 논문', icon: '📄', color: '#3B82F6', href: '/papers' },
  { id: 'news', name: 'AI News', koreanName: 'AI 뉴스', icon: '📰', color: '#10B981', href: '/news' },
  { id: 'github', name: 'GitHub', koreanName: 'GitHub', icon: '💻', color: '#8B5CF6', href: '/github' },
  { id: 'conferences', name: 'Conferences', koreanName: '컨퍼런스', icon: '🎤', color: '#F59E0B', href: '/conferences' },
  { id: 'platforms', name: 'AI Platforms', koreanName: 'AI 플랫폼', icon: '🧠', color: '#EC4899', href: '/platforms' },
  { id: 'jobs', name: 'AI Jobs', koreanName: 'AI 채용', icon: '💼', color: '#06B6D4', href: '/jobs' },
  { id: 'policies', name: 'AI Policies', koreanName: 'AI 정책', icon: '📜', color: '#6366F1', href: '/policies' },
  { id: 'system', name: 'System', koreanName: '시스템', icon: '⚙️', color: '#6B7280', href: '/system' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const NAV_ITEMS = CATEGORIES;

export const APP_NAME = 'Ain싸';
export const APP_VERSION = 'v2.0';
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

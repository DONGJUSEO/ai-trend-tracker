"use client";

export const BOOKMARKS_KEY = "aibom-bookmarks";
export const RECENT_KEY = "aibom-recent";
export const ALERT_SETTINGS_KEY = "aibom-alert-settings";

export interface SavedItem {
  id: string;
  title: string;
  url?: string;
  category: string;
  saved_at: string;
}

export type AlertSettings = Record<string, boolean>;

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getBookmarks(): SavedItem[] {
  if (!isBrowser()) return [];
  return parseJson<SavedItem[]>(localStorage.getItem(BOOKMARKS_KEY), []);
}

export function toggleBookmark(item: Omit<SavedItem, "saved_at">): SavedItem[] {
  if (!isBrowser()) return [];
  const current = getBookmarks();
  const exists = current.some((x) => x.id === item.id && x.category === item.category);
  const next = exists
    ? current.filter((x) => !(x.id === item.id && x.category === item.category))
    : [{ ...item, saved_at: new Date().toISOString() }, ...current].slice(0, 200);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  return next;
}

export function isBookmarked(id: string, category: string): boolean {
  if (!isBrowser()) return false;
  return getBookmarks().some((x) => x.id === id && x.category === category);
}

export function getRecentItems(): SavedItem[] {
  if (!isBrowser()) return [];
  return parseJson<SavedItem[]>(localStorage.getItem(RECENT_KEY), []);
}

export function pushRecentItem(item: Omit<SavedItem, "saved_at">): SavedItem[] {
  if (!isBrowser()) return [];
  const current = getRecentItems();
  const deduped = current.filter((x) => !(x.id === item.id && x.category === item.category));
  const next = [{ ...item, saved_at: new Date().toISOString() }, ...deduped].slice(0, 50);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function getAlertSettings(): AlertSettings {
  if (!isBrowser()) return {};
  return parseJson<AlertSettings>(localStorage.getItem(ALERT_SETTINGS_KEY), {});
}

export function setAlertSetting(category: string, enabled: boolean): AlertSettings {
  if (!isBrowser()) return {};
  const current = getAlertSettings();
  const next = { ...current, [category]: enabled };
  localStorage.setItem(ALERT_SETTINGS_KEY, JSON.stringify(next));
  return next;
}


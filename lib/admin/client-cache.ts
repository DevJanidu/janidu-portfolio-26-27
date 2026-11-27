"use client";

/**
 * Lightweight client-side SWR cache for the Admin Dashboard so navigating
 * between sidebar modules renders instantly (0ms) while refreshing fresh
 * data in the background. Automatically cleared on mutations and logout.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_STALE_MS = 30_000; // 30s fresh window

export function getAdminCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  return entry.data as T;
}

export function isAdminCacheFresh(key: string, maxAgeMs = DEFAULT_STALE_MS): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < maxAgeMs;
}

export function setAdminCache<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

export function invalidateAdminCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

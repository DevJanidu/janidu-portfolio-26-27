import { Redis } from "@upstash/redis";

const CACHE_PREFIX = "jd:v1";

export type CacheTag =
  | "projects"
  | "categories"
  | "reviews"
  | "media"
  | "enquiries"
  | "clients"
  | "content"
  | "services"
  | "settings"
  | "overview"
  | "badges"
  | "analytics";

interface MemoryEntry {
  value: unknown;
  expiresAt: number;
  tags: CacheTag[];
}

// L1 in-process memory cache (bounded LRU-style map for sub-millisecond repeat hits)
const MAX_L1_ENTRIES = 300;
const memoryCache = new Map<string, MemoryEntry>();

// Single-flight promise map to prevent cache stampedes under concurrent load
const inFlight = new Map<string, Promise<unknown>>();

let cachedRedis: Redis | null = null;

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null;
  if (!cachedRedis) {
    cachedRedis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!.trim(),
      token: process.env.UPSTASH_REDIS_REST_TOKEN!.trim(),
    });
  }
  return cachedRedis;
}

function fullKey(key: string): string {
  return `${CACHE_PREFIX}:${key}`;
}

function tagKey(tag: CacheTag): string {
  return `${CACHE_PREFIX}:tag:${tag}`;
}

function setL1(key: string, value: unknown, ttlMs: number, tags: CacheTag[]) {
  if (memoryCache.size >= MAX_L1_ENTRIES) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    tags,
  });
}

function getL1<T>(key: string): { hit: true; value: T } | { hit: false } {
  const entry = memoryCache.get(key);
  if (!entry) return { hit: false };
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return { hit: false };
  }
  return { hit: true, value: entry.value as T };
}

export interface CacheOptions {
  /** Redis TTL in seconds (default: 120s) */
  ttlSeconds?: number;
  /** In-process L1 TTL in seconds (default: min(15, ttlSeconds)) */
  l1TtlSeconds?: number;
  /** Logical invalidation tags */
  tags?: CacheTag[];
}

/**
 * Enterprise 2-tier cache helper (L1 Memory -> L2 Upstash Redis -> Loader)
 * with single-flight stampede protection and fail-open fallback.
 */
export async function cachedQuery<T>(
  key: string,
  loader: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const ttlSeconds = options.ttlSeconds ?? 120;
  const l1Seconds = Math.min(options.l1TtlSeconds ?? 15, ttlSeconds);
  const tags = options.tags ?? [];
  const fKey = fullKey(key);

  // 1. Check L1 in-memory cache (< 0.1ms)
  const l1 = getL1<T>(fKey);
  if (l1.hit) {
    return l1.value;
  }

  // 2. Deduplicate concurrent misses (single-flight)
  const existingFlight = inFlight.get(fKey);
  if (existingFlight) {
    return (await existingFlight) as T;
  }

  const work = (async () => {
    const redis = getRedis();

    // 3. Check L2 Upstash Redis
    if (redis) {
      try {
        const raw = await redis.get<T>(fKey);
        if (raw !== null && raw !== undefined) {
          setL1(fKey, raw, l1Seconds * 1000, tags);
          return raw;
        }
      } catch {
        // Fail open — never break the request if Redis is temporarily unavailable
      }
    }

    // 4. Load fresh data from Neon Postgres
    const fresh = await loader();

    // 5. Populate L1 immediately
    setL1(fKey, fresh, l1Seconds * 1000, tags);

    // 6. Populate L2 Upstash Redis + tag index asynchronously (non-blocking pipeline)
    if (redis) {
      try {
        const pipe = redis.pipeline();
        pipe.set(fKey, fresh, { ex: ttlSeconds });
        for (const t of tags) {
          const tKey = tagKey(t);
          pipe.sadd(tKey, fKey);
          pipe.expire(tKey, Math.max(ttlSeconds * 2, 3600));
        }
        await pipe.exec();
      } catch {
        // Ignore Redis write errors; L1 and DB still succeeded
      }
    }

    return fresh;
  })();

  inFlight.set(fKey, work);
  try {
    return await work;
  } finally {
    inFlight.delete(fKey);
  }
}

/**
 * Instantly invalidates all L1 and L2 Redis keys associated with the given tags.
 */
export async function invalidateCacheTags(tags: CacheTag[]): Promise<void> {
  if (tags.length === 0) return;
  const tagSet = new Set(tags);

  // 1. Purge matching L1 memory entries immediately
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.tags.some((t) => tagSet.has(t))) {
      memoryCache.delete(key);
    }
  }

  // 2. Purge matching L2 Upstash Redis keys via tag sets
  const redis = getRedis();
  if (!redis) return;

  try {
    const keysToDelete = new Set<string>();
    const tagKeys = tags.map(tagKey);

    const memberLists = await Promise.all(
      tagKeys.map((tk) => redis.smembers<string[]>(tk).catch(() => [] as string[]))
    );

    for (const members of memberLists) {
      if (Array.isArray(members)) {
        for (const m of members) keysToDelete.add(m);
      }
    }

    const allDel = [...keysToDelete, ...tagKeys];
    if (allDel.length > 0) {
      await redis.del(...allDel);
    }
  } catch {
    // Fail open
  }
}

/**
 * Deletes specific cache keys directly (e.g. a single signed media URL).
 */
export async function invalidateCacheKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const fKeys = keys.map(fullKey);
  for (const fk of fKeys) memoryCache.delete(fk);

  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(...fKeys);
  } catch {
    // Fail open
  }
}

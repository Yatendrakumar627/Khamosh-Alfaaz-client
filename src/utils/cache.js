/**
 * Client-Side SWR (Stale-While-Revalidate) Cache
 * Enables instant (0ms) page renders using cached data while quietly
 * validating and updating from the network in the background.
 */

const memoryCache = new Map();
const DEFAULT_TTL = 3 * 60 * 1000; // 3 minutes
const MAX_CACHE_ENTRIES = 100;

const getSessionStorageKey = (key) => `ka_cache_${key}`;

export const getCache = (key, maxAge = DEFAULT_TTL) => {
  const now = Date.now();

  // 1. Try memory cache first (fastest, 0ms)
  if (memoryCache.has(key)) {
    const item = memoryCache.get(key);
    const age = now - item.timestamp;
    return {
      data: item.data,
      isStale: age > maxAge,
      timestamp: item.timestamp,
    };
  }

  // 2. Fall back to sessionStorage if available
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(getSessionStorageKey(key));
      if (stored) {
        const item = JSON.parse(stored);
        const age = now - item.timestamp;
        // Warm memory cache
        memoryCache.set(key, item);
        return {
          data: item.data,
          isStale: age > maxAge,
          timestamp: item.timestamp,
        };
      }
    } catch {
      // Ignore sessionStorage parsing or quota errors
    }
  }

  return null;
};

export const setCache = (key, data) => {
  if (memoryCache.size >= MAX_CACHE_ENTRIES && !memoryCache.has(key)) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) {
      memoryCache.delete(firstKey);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem(getSessionStorageKey(firstKey));
        } catch {}
      }
    }
  }

  const item = {
    data,
    timestamp: Date.now(),
  };

  memoryCache.set(key, item);

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(getSessionStorageKey(key), JSON.stringify(item));
    } catch {
      // Storage quota exceeded or disabled - silently ignore
    }
  }
};

export const invalidateCache = (pattern) => {
  if (typeof pattern === 'string') {
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }
    if (typeof window !== 'undefined') {
      try {
        const prefix = 'ka_cache_';
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(prefix) && k.includes(pattern)) {
            sessionStorage.removeItem(k);
          }
        }
      } catch {}
    }
  } else if (typeof pattern === 'function') {
    for (const [key, item] of memoryCache.entries()) {
      if (pattern(key, item)) {
        memoryCache.delete(key);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.removeItem(getSessionStorageKey(key));
          } catch {}
        }
      }
    }
    if (typeof window !== 'undefined') {
      try {
        const prefix = 'ka_cache_';
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(prefix)) {
            const raw = sessionStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              const realKey = k.slice(prefix.length);
              if (pattern(realKey, parsed)) {
                sessionStorage.removeItem(k);
              }
            }
          }
        }
      } catch {}
    }
  }
};

export const clearAllCache = () => {
  memoryCache.clear();
  if (typeof window !== 'undefined') {
    try {
      const prefix = 'ka_cache_';
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(prefix)) {
          sessionStorage.removeItem(k);
        }
      }
    } catch {}
  }
};

// Automatically invalidate user caches on entry changes
if (typeof window !== 'undefined') {
  window.addEventListener('entries-updated', () => {
    invalidateCache('entries');
    invalidateCache('dashboard');
    invalidateCache('stats');
    invalidateCache('public');
    invalidateCache('onThisDay');
  });
}


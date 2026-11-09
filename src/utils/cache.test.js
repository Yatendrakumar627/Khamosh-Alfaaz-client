import { describe, it, expect, beforeEach } from 'vitest';
import { getCache, setCache, invalidateCache, clearAllCache } from './cache';

describe('Client SWR Cache Utility', () => {
  beforeEach(() => {
    clearAllCache();
    sessionStorage.clear();
  });

  it('stores and retrieves data from memory cache', () => {
    setCache('test_key', { foo: 'bar' });
    const cached = getCache('test_key');
    expect(cached).not.toBeNull();
    expect(cached.data).toEqual({ foo: 'bar' });
    expect(cached.isStale).toBe(false);
  });

  it('correctly identifies stale data when maxAge is exceeded', async () => {
    setCache('stale_key', 'some_data');
    // Query with negative maxAge to force staleness
    const cached = getCache('stale_key', -1);
    expect(cached).not.toBeNull();
    expect(cached.data).toBe('some_data');
    expect(cached.isStale).toBe(true);
  });

  it('populates and falls back to sessionStorage', () => {
    setCache('session_key', { count: 42 });
    expect(sessionStorage.getItem('ka_cache_session_key')).toBeTruthy();
  });

  it('invalidates cache by string pattern', () => {
    setCache('entries_list', [1, 2, 3]);
    setCache('entries_detail', { id: 1 });
    setCache('categories_all', ['cat1']);

    invalidateCache('entries');

    expect(getCache('entries_list')).toBeNull();
    expect(getCache('entries_detail')).toBeNull();
    expect(getCache('categories_all')).not.toBeNull();
  });

  it('invalidates cache by function predicate', () => {
    setCache('user_1', { role: 'guest' });
    setCache('user_2', { role: 'admin' });

    invalidateCache((key, item) => item.data.role === 'guest');

    expect(getCache('user_1')).toBeNull();
    expect(getCache('user_2')).not.toBeNull();
  });

  it('completely purges memory and sessionStorage on clearAllCache', () => {
    setCache('item_a', 'alpha');
    setCache('item_b', 'beta');
    sessionStorage.setItem('other_key', 'preserve_me');

    clearAllCache();

    expect(getCache('item_a')).toBeNull();
    expect(getCache('item_b')).toBeNull();
    expect(sessionStorage.getItem('ka_cache_item_a')).toBeNull();
    expect(sessionStorage.getItem('ka_cache_item_b')).toBeNull();
    // Non-cache keys in sessionStorage should be preserved
    expect(sessionStorage.getItem('other_key')).toBe('preserve_me');
  });

  it('evicts oldest entry when cache capacity is exceeded', () => {
    for (let i = 0; i < 105; i++) {
      setCache(`key_${i}`, `val_${i}`);
    }
    // Oldest entries (key_0, key_1, key_2, key_3, key_4) should have been evicted
    expect(getCache('key_0')).toBeNull();
    expect(getCache('key_104')).not.toBeNull();
  });
});


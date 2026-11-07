import { useState, useEffect, useCallback, useRef } from 'react';
import { entriesApi, categoriesApi } from '../services/api';
import { useToast } from '../context';
import { getCache, setCache, invalidateCache } from '../utils/cache';

const sanitizeParams = (p) => {
  const { signal, ...clean } = p;
  for (const key of ['type', 'search', 'tags', 'from', 'to', 'date', 'calendar', 'fields']) {
    if (clean[key] === undefined || clean[key] === null || clean[key] === '') {
      delete clean[key];
    }
  }
  if (clean.favorite !== true) delete clean.favorite;
  if (clean.pinned !== true) delete clean.pinned;
  return clean;
};

const getEntriesCacheKey = (p) => `entries:${JSON.stringify(sanitizeParams(p))}`;

export const useEntries = (initialParams = {}) => {
  const initialLimit = initialParams.limit || 20;
  const mergedParams = { page: 1, limit: initialLimit, ...initialParams };
  const initialCacheKey = getEntriesCacheKey(mergedParams);
  const cached = getCache(initialCacheKey);

  const [entries, setEntries] = useState(() => (Array.isArray(cached?.data?.entries) ? cached.data.entries : []));
  const [loading, setLoading] = useState(() => !Array.isArray(cached?.data?.entries) || cached.data.entries.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState(
    () => cached?.data?.pagination || { page: 1, limit: initialLimit, total: 0, totalPages: 0 }
  );
  const [params, setParams] = useState(mergedParams);

  const abortRef = useRef(null);
  const { error: showError } = useToast();

  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  const paramsRef = useRef(params);
  paramsRef.current = params;

  // Immediately clear entries on category change to prevent cross-category entry contamination
  const prevTypeRef = useRef(initialParams.type);
  useEffect(() => {
    if (prevTypeRef.current !== initialParams.type) {
      prevTypeRef.current = initialParams.type;
      const nextKey = getEntriesCacheKey({ ...paramsRef.current, type: initialParams.type });
      const nextCached = getCache(nextKey);
      setEntries(nextCached?.data?.entries || []);
    }
  }, [initialParams.type]);

  const fetchEntries = useCallback(async (fetchParams = paramsRef.current, append = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const cacheKey = getEntriesCacheKey(fetchParams);
    const cachedItem = getCache(cacheKey);

    if (append) {
      setLoadingMore(true);
    } else if (Array.isArray(cachedItem?.data?.entries)) {
      // Instant (0ms) render from cache!
      setEntries(cachedItem.data.entries);
      if (cachedItem.data.pagination) setPagination(cachedItem.data.pagination);
      setLoading(false);
      setIsValidating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const queryParams = sanitizeParams(fetchParams);
      const reqConfig = { signal: controller.signal };
      let response;
      if (queryParams.search && queryParams.search.trim()) {
        response = await entriesApi.search(queryParams.search.trim(), queryParams, reqConfig);
      } else {
        response = await entriesApi.list(queryParams, reqConfig);
      }
      if (controller.signal.aborted) return;
      const data = Array.isArray(response.data?.entries) ? response.data.entries : [];
      const pag = response.data?.pagination;
      if (append) {
        setEntries(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const existingIds = new Set(safePrev.map(e => e._id));
          const uniqueNew = data.filter(e => e && !existingIds.has(e._id));
          return [...safePrev, ...uniqueNew];
        });
      } else {
        setEntries(data);
      }
      if (pag) {
        setPagination(pag);
      }
      setCache(cacheKey, { entries: data, pagination: pag });
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || controller.signal.aborted) {
        return;
      }
      setError(err.message);
      showError(append ? 'Failed to load more entries' : 'Failed to load entries');
    } finally {
      if (!controller.signal.aborted) {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
          setIsValidating(false);
        }
      }
    }
  }, [showError]);

  // Initial load and filter change trigger: only runs when filter/search/sort/date parameters change
  const initialParamsKey = JSON.stringify(initialParams);
  useEffect(() => {
    const nextParams = { ...paramsRef.current, page: 1, limit: initialLimit, ...initialParams };
    setParams(nextParams);
    fetchEntries(nextParams, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialParamsKey, initialLimit, fetchEntries]);

  const hasMore = pagination.page < pagination.totalPages;

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = paginationRef.current.page + 1;
    const nextParams = { ...paramsRef.current, page: nextPage };
    await fetchEntries(nextParams, true);
  }, [loading, loadingMore, hasMore, fetchEntries]);

  const searchEntries = useCallback(async (query, searchParams = {}) => {
    const nextParams = { ...paramsRef.current, ...searchParams, search: query, page: 1 };
    setParams(nextParams);
    fetchEntries(nextParams, false);
  }, [fetchEntries]);

  const createEntry = useCallback(async (data) => {
    try {
      const response = await entriesApi.create(data);
      const newEntry = response.data.entry;
      setEntries(prev => [newEntry, ...prev]);
      invalidateCache('entries');
      invalidateCache('dashboard');
      return newEntry;
    } catch (err) {
      showError('Failed to create entry');
      throw err;
    }
  }, [showError]);

  const updateEntry = useCallback(async (id, data) => {
    try {
      const response = await entriesApi.update(id, data);
      const updated = response.data.entry;
      setEntries(prev => prev.map(e => e._id === id ? updated : e));
      invalidateCache('entries');
      invalidateCache('dashboard');
      invalidateCache(`entry:${id}`);
      return updated;
    } catch (err) {
      showError('Failed to update entry');
      throw err;
    }
  }, [showError]);

  const deleteEntry = useCallback(async (id) => {
    try {
      await entriesApi.delete(id);
      setEntries(prev => prev.filter(e => e._id !== id));
      setPagination(prev => {
        const total = Math.max(0, prev.total - 1);
        const pages = Math.ceil(total / prev.limit) || 1;
        return { ...prev, total, pages, totalPages: pages };
      });
      invalidateCache('entries');
      invalidateCache('dashboard');
      invalidateCache(`entry:${id}`);
    } catch (err) {
      showError('Failed to delete entry');
      throw err;
    }
  }, [showError]);

  const toggleFavorite = useCallback(async (id, value) => {
    try {
      const response = await entriesApi.toggleFavorite(id, value);
      const updated = response.data.entry;
      setEntries(prev => prev.map(e => e._id === id ? updated : e));
      invalidateCache('entries');
      return updated;
    } catch (err) {
      showError('Failed to update favorite');
      throw err;
    }
  }, [showError]);

  const togglePin = useCallback(async (id, value) => {
    try {
      const response = await entriesApi.togglePin(id, value);
      const updated = response.data.entry;
      setEntries(prev => prev.map(e => e._id === id ? updated : e));
      invalidateCache('entries');
      return updated;
    } catch (err) {
      showError('Failed to update pin');
      throw err;
    }
  }, [showError]);

  const setPage = useCallback((page) => {
    const nextParams = { ...paramsRef.current, page };
    setParams(nextParams);
    fetchEntries(nextParams, false);
  }, [fetchEntries]);

  const setFilters = useCallback((filters) => {
    const nextParams = {
      ...paramsRef.current,
      ...filters,
      page: filters.page ?? 1,
    };
    setParams(nextParams);
    fetchEntries(nextParams, false);
  }, [fetchEntries]);

  const refresh = useCallback(() => {
    invalidateCache('entries');
    return fetchEntries({ ...paramsRef.current, page: 1 }, false);
  }, [fetchEntries]);

  return {
    entries,
    loading,
    loadingMore,
    isValidating,
    hasMore,
    loadMore,
    error,
    pagination,
    params,
    fetchEntries,
    searchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    togglePin,
    setPage,
    setFilters,
    refresh,
  };
};

export const useEntry = (id) => {
  const cacheKey = `entry:${id}`;
  const cached = id ? getCache(cacheKey) : null;

  const [entry, setEntry] = useState(() => cached?.data?.entry || null);
  const [loading, setLoading] = useState(() => !cached?.data?.entry);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  const fetchEntry = useCallback(async () => {
    if (!id) return;
    const currentCached = getCache(cacheKey);
    if (currentCached?.data?.entry) {
      setEntry(currentCached.data.entry);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await entriesApi.get(id);
      const fetched = response.data.entry;
      setEntry(fetched);
      setCache(cacheKey, { entry: fetched });
    } catch (err) {
      setError(err.message);
      showError('Failed to load entry');
    } finally {
      setLoading(false);
    }
  }, [id, cacheKey, showError]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  return { entry, loading, error, refresh: fetchEntry };
};

export const useCategories = () => {
  const cacheKey = 'categories:list';
  const cached = getCache(cacheKey);

  const [categories, setCategories] = useState(() => cached?.data?.categories || []);
  const [loading, setLoading] = useState(() => !cached?.data?.categories?.length);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  const fetchCategories = useCallback(async () => {
    const currentCached = getCache(cacheKey);
    if (currentCached?.data?.categories?.length) {
      setCategories(currentCached.data.categories);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await categoriesApi.list();
      const fetched = response.data.categories || [];
      setCategories(fetched);
      setCache(cacheKey, { categories: fetched });
    } catch (err) {
      setError(err.message);
      showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [cacheKey, showError]);

  const createCategory = useCallback(async (data) => {
    try {
      const response = await categoriesApi.create(data);
      const created = response.data.category;
      setCategories(prev => [...prev, created]);
      invalidateCache('categories');
      return created;
    } catch (err) {
      showError('Failed to create category');
      throw err;
    }
  }, [showError]);

  const updateCategory = useCallback(async (id, data) => {
    try {
      const response = await categoriesApi.update(id, data);
      const updated = response.data.category;
      setCategories(prev => prev.map(c => c._id === id ? updated : c));
      invalidateCache('categories');
      return updated;
    } catch (err) {
      showError('Failed to update category');
      throw err;
    }
  }, [showError]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      invalidateCache('categories');
    } catch (err) {
      showError('Failed to delete category');
      throw err;
    }
  }, [showError]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory };
};

export const useCalendar = (month) => {
  const cacheKey = `calendar:${month}`;
  const cached = month ? getCache(cacheKey) : null;

  const [byDay, setByDay] = useState(() => cached?.data?.byDay || {});
  const [entries, setEntries] = useState(() => cached?.data?.entries || []);
  const [loading, setLoading] = useState(() => !cached?.data);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  const fetchCalendar = useCallback(async () => {
    if (!month) return;
    const currentCached = getCache(cacheKey);
    if (currentCached?.data) {
      setByDay(currentCached.data.byDay || {});
      setEntries(currentCached.data.entries || []);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await entriesApi.calendar(month);
      const dataByDay = response.data.byDay || {};
      const dataEntries = response.data.entries || [];
      setByDay(dataByDay);
      setEntries(dataEntries);
      setCache(cacheKey, { byDay: dataByDay, entries: dataEntries });
    } catch (err) {
      setError(err.message);
      showError('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [month, cacheKey, showError]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const days = Object.keys(byDay).map(Number);
  return { byDay, entries, days, loading, error, refresh: fetchCalendar };
};

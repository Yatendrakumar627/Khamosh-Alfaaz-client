import { useState, useEffect, useCallback, useRef } from 'react';
import { publicApi } from '../services/api';
import { getCache, setCache } from '../utils/cache';

const getPublicListKey = (p) =>
  `public:entries:${p.page || 1}:${p.limit || 12}:${p.sort || 'newest'}:${p.type || ''}:${p.search || ''}`;

export const usePublicEntries = (initialParams = {}) => {
  const mergedParams = { page: 1, limit: 12, ...initialParams };
  const initialCacheKey = getPublicListKey(mergedParams);
  const cached = getCache(initialCacheKey);

  const [entries, setEntries] = useState(() => cached?.data?.entries || []);
  const [loading, setLoading] = useState(() => !cached?.data?.entries?.length);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(
    () => cached?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
  );
  const [params, setParams] = useState(mergedParams);
  const abortRef = useRef(null);

  const fetchEntries = useCallback(async (fetchParams = params, append = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const cacheKey = getPublicListKey(fetchParams);
    const cachedItem = getCache(cacheKey);

    if (append) {
      setLoading(false);
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
      const { signal, ...queryParams } = fetchParams;
      const response = await publicApi.list(queryParams, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const data = Array.isArray(response.data?.entries) ? response.data.entries : [];
      const pag = response.data?.pagination;
      if (append) {
        setEntries((prev) => [...(Array.isArray(prev) ? prev : []), ...data]);
      } else {
        setEntries(data);
      }
      if (pag) setPagination(pag);
      setCache(cacheKey, { entries: data, pagination: pag });
    } catch (err) {
      if (
        err.name === 'AbortError' ||
        err.name === 'CanceledError' ||
        err.code === 'ERR_CANCELED' ||
        controller.signal.aborted
      ) {
        return;
      }
      setError(err.message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setIsValidating(false);
      }
    }
  }, [params]);

  const setPage = useCallback((page) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setFilters = useCallback((filters) => {
    setParams((prev) => ({ ...prev, ...filters, page: 1 }));
  }, []);

  const refresh = useCallback(() => fetchEntries(params), [fetchEntries, params]);

  useEffect(() => {
    fetchEntries();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search, params.type, params.page, params.sort]);

  return {
    entries,
    loading,
    isValidating,
    error,
    pagination,
    params,
    fetchEntries,
    setPage,
    setFilters,
    refresh,
  };
};

export const usePublicEntry = (id) => {
  const cacheKey = `public:entry:${id}`;
  const cached = id ? getCache(cacheKey) : null;

  const [entry, setEntry] = useState(() => cached?.data?.entry || null);
  const [loading, setLoading] = useState(() => !cached?.data?.entry);
  const [error, setError] = useState(null);

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
      const response = await publicApi.get(id);
      const fetched = response.data.entry;
      setEntry(fetched);
      setCache(cacheKey, { entry: fetched });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, cacheKey]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  return { entry, loading, error, refresh: fetchEntry };
};

export const usePublicQuotes = (limit = 30) => {
  const cacheKey = `public:quotes:${limit}`;
  const cached = getCache(cacheKey);

  const [quotes, setQuotes] = useState(() => cached?.data?.quotes || []);
  const [loading, setLoading] = useState(() => !cached?.data?.quotes?.length);
  const [error, setError] = useState(null);

  const fetchQuotes = useCallback(async () => {
    const currentCached = getCache(cacheKey);
    if (currentCached?.data?.quotes?.length) {
      setQuotes(currentCached.data.quotes);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await publicApi.quotes({ limit });
      const fetched = response.data.entries || [];
      setQuotes(fetched);
      setCache(cacheKey, { quotes: fetched });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit, cacheKey]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return { quotes, loading, error, refresh: fetchQuotes };
};

export const usePublicCategories = () => {
  const cacheKey = 'public:categories';
  const cached = getCache(cacheKey);

  const [categories, setCategories] = useState(() => cached?.data?.categories || []);
  const [loading, setLoading] = useState(() => !cached?.data?.categories?.length);
  const [error, setError] = useState(null);

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
      const response = await publicApi.categories();
      const fetched = response.data.categories || [];
      setCategories(fetched);
      setCache(cacheKey, { categories: fetched });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refresh: fetchCategories };
};

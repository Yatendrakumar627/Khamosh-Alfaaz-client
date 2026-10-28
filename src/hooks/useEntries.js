import { useState, useEffect, useCallback, useRef } from 'react';
import { entriesApi, categoriesApi } from '../services/api';
import { useToast } from '../context';

export const useEntries = (initialParams = {}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const initialLimit = initialParams.limit || 1000;
  const [pagination, setPagination] = useState({ page: 1, limit: initialLimit, total: 0, totalPages: 0 });
  const [params, setParams] = useState({ page: 1, limit: initialLimit, ...initialParams });

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
      setEntries([]);
    }
  }, [initialParams.type]);

  const sanitizeParams = (p) => {
    const { signal, ...clean } = p;
    for (const key of ['type', 'search', 'tags', 'from', 'to', 'date', 'calendar']) {
      if (clean[key] === undefined || clean[key] === null || clean[key] === '') {
        delete clean[key];
      }
    }
    if (clean.favorite !== true) delete clean.favorite;
    if (clean.pinned !== true) delete clean.pinned;
    return clean;
  };

  const fetchEntries = useCallback(async (fetchParams = paramsRef.current, append = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (append) {
      setLoadingMore(true);
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
      const { entries: data, pagination: pag } = response.data;
      if (append) {
        setEntries(prev => {
          const existingIds = new Set(prev.map(e => e._id));
          const uniqueNew = (data || []).filter(e => !existingIds.has(e._id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setEntries(data || []);
      }
      if (pag) {
        setPagination(pag);
      }
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
      setEntries(prev => [response.data.entry, ...prev]);
      return response.data.entry;
    } catch (err) {
      showError('Failed to create entry');
      throw err;
    }
  }, [showError]);

  const updateEntry = useCallback(async (id, data) => {
    try {
      const response = await entriesApi.update(id, data);
      setEntries(prev => prev.map(e => e._id === id ? response.data.entry : e));
      return response.data.entry;
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
    } catch (err) {
      showError('Failed to delete entry');
      throw err;
    }
  }, [showError]);

  const toggleFavorite = useCallback(async (id, value) => {
    try {
      const response = await entriesApi.toggleFavorite(id, value);
      setEntries(prev => prev.map(e => e._id === id ? response.data.entry : e));
      return response.data.entry;
    } catch (err) {
      showError('Failed to update favorite');
      throw err;
    }
  }, [showError]);

  const togglePin = useCallback(async (id, value) => {
    try {
      const response = await entriesApi.togglePin(id, value);
      setEntries(prev => prev.map(e => e._id === id ? response.data.entry : e));
      return response.data.entry;
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
    return fetchEntries({ ...paramsRef.current, page: 1 }, false);
  }, [fetchEntries]);

  return {
    entries,
    loading,
    loadingMore,
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
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  const fetchEntry = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await entriesApi.get(id);
      setEntry(response.data.entry);
    } catch (err) {
      setError(err.message);
      showError('Failed to load entry');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  return { entry, loading, error, refresh: fetchEntry };
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoriesApi.list();
      setCategories(response.data.categories || []);
    } catch (err) {
      setError(err.message);
      showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const createCategory = useCallback(async (data) => {
    try {
      const response = await categoriesApi.create(data);
      setCategories(prev => [...prev, response.data.category]);
      return response.data.category;
    } catch (err) {
      showError('Failed to create category');
      throw err;
    }
  }, [showError]);

  const updateCategory = useCallback(async (id, data) => {
    try {
      const response = await categoriesApi.update(id, data);
      setCategories(prev => prev.map(c => c._id === id ? response.data.category : c));
      return response.data.category;
    } catch (err) {
      showError('Failed to update category');
      throw err;
    }
  }, [showError]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c._id !== id));
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
  const [byDay, setByDay] = useState({});
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  const fetchCalendar = useCallback(async () => {
    if (!month) return;
    setLoading(true);
    setError(null);
    try {
      const response = await entriesApi.calendar(month);
      setByDay(response.data.byDay || {});
      setEntries(response.data.entries || []);
    } catch (err) {
      setError(err.message);
      showError('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [month, showError]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const days = Object.keys(byDay).map(Number);
  return { byDay, entries, days, loading, error, refresh: fetchCalendar };
};
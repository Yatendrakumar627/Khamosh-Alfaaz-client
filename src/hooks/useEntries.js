import { useState, useEffect, useCallback, useRef } from 'react';
import { entriesApi, categoriesApi } from '../services/api';
import { useToast } from '../context';

export const useEntries = (initialParams = {}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [params, setParams] = useState({ page: 1, limit: 100, ...initialParams });
  const abortRef = useRef(null);
  const { error: showError } = useToast();

  const fetchEntries = useCallback(async (fetchParams = params, append = false) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const { signal, ...queryParams } = fetchParams;
      for (const key of ['type', 'search', 'tags', 'from', 'to', 'date', 'calendar']) {
        if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
          delete queryParams[key];
        }
      }
      if (queryParams.favorite !== true) delete queryParams.favorite;
      if (queryParams.pinned !== true) delete queryParams.pinned;
      const response = await entriesApi.list(queryParams);
      const { entries: data, pagination: pag } = response.data;
      if (append) {
        setEntries(prev => [...prev, ...data]);
      } else {
        setEntries(data);
      }
      if (pag) setPagination(pag);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        showError('Failed to load entries');
      }
    } finally {
      setLoading(false);
    }
  }, [params, showError]);

  const searchEntries = useCallback(async (query, searchParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...searchParams };
      for (const key of ['type', 'search', 'tags', 'from', 'to', 'date', 'calendar']) {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      }
      if (params.favorite !== true) delete params.favorite;
      if (params.pinned !== true) delete params.pinned;
      const response = await entriesApi.search(query, params);
      const { entries: data, pagination: pag } = response.data;
      setEntries(data);
      if (pag) setPagination(pag);
    } catch (err) {
      setError(err.message);
      showError('Search failed');
    } finally {
      setLoading(false);
    }
  }, [showError]);

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
    setParams(prev => ({ ...prev, page }));
  }, []);

  const setFilters = useCallback((filters) => {
    setParams(prev => {
      const next = {
        ...prev,
        ...filters,
        page: filters.page ?? prev.page,
      };
      const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
      const unchanged = [...keys].every(key => prev[key] === next[key]);
      return unchanged ? prev : next;
    });
  }, []);

  const refresh = useCallback(() => fetchEntries(params), [fetchEntries, params]);

  useEffect(() => {
    fetchEntries();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchEntries]);

  return {
    entries,
    loading,
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
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  const fetchCalendar = useCallback(async () => {
    if (!month) return;
    setLoading(true);
    setError(null);
    try {
      const response = await entriesApi.calendar(month);
      setDays(response.data.days || []);
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

  return { days, loading, error, refresh: fetchCalendar };
};
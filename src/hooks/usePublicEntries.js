import { useState, useEffect, useCallback, useRef } from 'react';
import { publicApi } from '../services/api';

export const usePublicEntries = (initialParams = {}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [params, setParams] = useState({ page: 1, limit: 12, ...initialParams });
  const abortRef = useRef(null);

  const fetchEntries = useCallback(async (fetchParams = params, append = false) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const { signal, ...queryParams } = fetchParams;
      const response = await publicApi.list({ ...queryParams, _t: Date.now() });
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
      }
    } finally {
      setLoading(false);
    }
  }, [params]);

  const setPage = useCallback((page) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const setFilters = useCallback((filters) => {
    setParams(prev => ({ ...prev, ...filters, page: 1 }));
  }, []);

  const refresh = useCallback(() => fetchEntries(params), [fetchEntries, params]);

  useEffect(() => {
    fetchEntries();
    return () => { if (abortRef.current) abortRef.current.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search, params.type, params.page, params.sort]);

  return {
    entries,
    loading,
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
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntry = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await publicApi.get(id);
      setEntry(response.data.entry);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  return { entry, loading, error, refresh: fetchEntry };
};

export const usePublicQuotes = (limit = 30) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await publicApi.quotes({ limit });
      setQuotes(response.data.entries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return { quotes, loading, error, refresh: fetchQuotes };
};

export const usePublicCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await publicApi.categories();
      setCategories(response.data.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refresh: fetchCategories };
};
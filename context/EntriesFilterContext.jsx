import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_FILTERS = {
  type: null,
  sort: 'newest',
  favorite: false,
  pinned: false,
};

const EntriesFilterContext = createContext(null);

const readFilters = (searchParams) => ({
  type: searchParams.get('type') || null,
  sort: searchParams.get('sort') || 'newest',
  favorite: searchParams.get('favorite') === 'true',
  pinned: searchParams.get('pinned') === 'true',
});

const filtersAreEqual = (left, right) => (
  left.type === right.type
  && left.sort === right.sort
  && left.favorite === right.favorite
  && left.pinned === right.pinned
);

export const EntriesFilterProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => readFilters(searchParams));
  const [filtersOpen, setFiltersOpen] = useState(() => searchParams.get('filters') === 'open');

  useEffect(() => {
    const nextFilters = readFilters(searchParams);
    setFilters(value => filtersAreEqual(value, nextFilters) ? value : nextFilters);
    const nextFiltersOpen = searchParams.get('filters') === 'open';
    setFiltersOpen(value => value === nextFiltersOpen ? value : nextFiltersOpen);
  }, [searchParams]);

  const changeFilters = useCallback((nextFilters) => {
    setFilters(value => {
      const next = typeof nextFilters === 'function' ? nextFilters(value) : { ...value, ...nextFilters };
      return {
        type: next.type || null,
        sort: next.sort || 'newest',
        favorite: Boolean(next.favorite),
        pinned: Boolean(next.pinned),
      };
    });
  }, []);

  const setFiltersOpenState = useCallback((open) => {
    setFiltersOpen(open);
    const nextParams = new URLSearchParams(searchParams);
    if (open) {
      nextParams.set('filters', 'open');
    } else {
      nextParams.delete('filters');
    }
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const toggleFilters = useCallback(() => {
    setFiltersOpenState(!filtersOpen);
  }, [filtersOpen, setFiltersOpenState]);

  const closeFilters = useCallback(() => {
    setFiltersOpenState(false);
  }, [setFiltersOpenState]);

  const value = useMemo(() => ({
    filters,
    filtersOpen,
    changeFilters,
    toggleFilters,
    closeFilters,
  }), [filters, filtersOpen, changeFilters, toggleFilters, closeFilters]);

  return (
    <EntriesFilterContext.Provider value={value}>
      {children}
    </EntriesFilterContext.Provider>
  );
};

export const useEntriesFilters = () => {
  const context = useContext(EntriesFilterContext);
  if (!context) {
    throw new Error('useEntriesFilters must be used within an EntriesFilterProvider');
  }
  return context;
};

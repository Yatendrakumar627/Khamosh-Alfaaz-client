import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEntries } from '../hooks/useEntries';
import { EntryCard } from '../components/diary/EntryCard';
import { EmptyState, ErrorState } from '../components/diary/SearchAndFilter';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';
import { Star, Filter, ChevronDown } from 'lucide-react';
import { formatDate, debounce } from '../utils/helpers';
import { entriesApi } from '../services/api';
import { ENTRY_TYPES, SORT_OPTIONS } from '../constants';

export const Favorites = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || null,
    sort: searchParams.get('sort') || 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef(null);

  const {
    entries,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    pagination,
    params,
    searchEntries,
    setFilters: setApiFilters,
    setPage,
    refresh,
  } = useEntries({
    limit: 12,
    type: filters.type,
    sort: filters.sort,
    favorite: true,
  });

  // Infinite scroll trigger when sentinel comes into viewport
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '250px', threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore]);

  const debouncedSearch = useCallback(
    debounce((query) => {
      setPage(1);
      searchEntries(query, { ...filters, page: 1, favorite: true });
    }, 300),
    [searchEntries, filters, setPage],
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery.trim());
    }
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    if (filters.type) newParams.set('type', filters.type);
    if (filters.sort && filters.sort !== 'newest') newParams.set('sort', filters.sort);
    if (params.page > 1) newParams.set('page', params.page.toString());
    setSearchParams(newParams, { replace: true });
  }, [searchQuery, filters, params.page, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    const nextFilters = { ...filters, ...newFilters };
    setFilters(nextFilters);
    setApiFilters({ ...nextFilters, page: 1, favorite: true });
  };

  if (loading && entries.length === 0) {
    return <LoadingState message="Loading favorites..." />;
  }

  if (error && entries.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="page-container" style={{ width: '100%', maxWidth: '100%', margin: 0, paddingBottom: '48px' }}>
      <header style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: 'var(--gold)', color: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Star size={24} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
                Favorites
              </h1>
              <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
                {pagination.total} favorite{pagination.total !== 1 ? 's' : ''}{filters.type ? ` • ${filters.type}` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="favorites-toolbar">
          <div className="favorites-search-wrap">
            <input
              type="search"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="favorites-search-input"
            />
          </div>
          <Button
            variant={showFilters ? 'filled' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter size={16} />}
            className="favorites-filter-btn"
          >
            Filter
          </Button>
        </div>

        {showFilters && (
          <div className="favorites-filter-panel paper-texture">
            <select
              value={filters.type || 'all'}
              onChange={(e) => handleFilterChange({ type: e.target.value === 'all' ? null : e.target.value })}
              className="favorites-select"
            >
              <option value="all">All Types</option>
              {ENTRY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => handleFilterChange({ sort: e.target.value })}
              className="favorites-select"
            >
              {SORT_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {entries.length === 0 ? (
        <EmptyState
          icon={Star}
          title={searchQuery ? 'Nothing found.' : 'Some thoughts become special. Mark one as your favorite.'}
          message={searchQuery ? 'No favorite entries match your search.' : 'Click the star on any entry to add it here.'}
        />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {entries.map((entry, index) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                index={index}
                onEdit={(e) => navigate(`/entries/${e._id}/edit?from=${encodeURIComponent('/favorites')}`)}
                onDelete={async (id) => {
                  await entriesApi.delete(id);
                  refresh();
                }}
                onFavorite={async (e, next) => {
                  await entriesApi.toggleFavorite(e._id, next);
                  refresh();
                }}
                onPin={async (e, next) => {
                  await entriesApi.togglePin(e._id, next);
                  refresh();
                }}
                onVisibility={async (e, next) => {
                  await entriesApi.update(e._id, { visibility: next });
                  refresh();
                }}
              />
            ))}
          </div>

          {/* ── Infinite Scroll Sentinel / Load More ── */}
          {hasMore && (
            <div className="entries-load-more-section" ref={loadMoreRef}>
              <button
                type="button"
                className={`entries-load-more-btn${loadingMore ? ' loading' : ''}`}
                onClick={loadMore}
                disabled={loadingMore}
                aria-label="Load more favorites"
              >
                {loadingMore ? (
                  <span className="entries-load-more-spinner-content">
                    <span className="entries-load-more-spinner" aria-hidden="true" />
                    <span>Loading more favorites...</span>
                  </span>
                ) : (
                  <span className="entries-load-more-content">
                    <span>Load More Favorites</span>
                    <span className="entries-load-more-badge">
                      +{Math.min(12, (pagination.total || 0) - entries.length)}
                    </span>
                  </span>
                )}
              </button>

              <p className="entries-load-more-progress">
                Showing {entries.length} of {pagination.total} favorite{pagination.total === 1 ? '' : 's'}
              </p>
            </div>
          )}

          {!hasMore && entries.length > 0 && (pagination.total || 0) > 12 && (
            <div className="entries-caught-up-banner">
              <span className="entries-caught-up-line" />
              <span className="entries-caught-up-text">✦ All {pagination.total} favorites loaded · You're all caught up ✦</span>
              <span className="entries-caught-up-line" />
            </div>
          )}
        </>
      )}
    </div>
  );
};
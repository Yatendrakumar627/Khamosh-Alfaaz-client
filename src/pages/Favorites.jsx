import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEntries } from '../hooks/useEntries';
import { EntryCard } from '../components/diary/EntryCard';
import { EmptyState, ErrorState } from '../components/diary/SearchAndFilter';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';
import { Star, Filter, ChevronDown } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { debounce } from '../utils/helpers';
import { entriesApi } from '../services/api';

export const Favorites = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || null,
    sort: searchParams.get('sort') || 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { entries, loading, error, pagination, params, searchEntries, setFilters: setApiFilters, setPage, refresh } = useEntries({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 1000,
    type: filters.type,
    sort: filters.sort,
    favorite: true,
  });

  const debouncedSearch = useCallback(
    debounce((query) => {
      setPage(1);
      searchEntries(query, { ...filters, page: 1, favorite: true });
    }, 300),
    [searchEntries, filters, setPage],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [debouncedSearch]);

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

  const handlePageChange = (page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && entries.length === 0) {
    return <LoadingState message="Loading favorites..." />;
  }

  if (error && entries.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
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

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1, minWidth: '200px', maxWidth: '400px',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              border: '1px solid var(--input-border)', borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--input-bg)', color: 'var(--ink)',
              fontFamily: 'inherit', fontSize: '0.95rem',
            }}
          />
          <Button variant={showFilters ? 'filled' : 'outline'} onClick={() => setShowFilters(!showFilters)} leftIcon={<Filter size={18} />}>
            Filter by Type
          </Button>
        </div>

        {showFilters && (
          <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }} className="paper-texture">
            <select
              value={filters.type || 'all'}
              onChange={(e) => handleFilterChange({ type: e.target.value || null })}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--input-border)',
                borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--ink)',
                fontFamily: 'inherit', fontSize: '0.9rem',
              }}
            >
              <option value="all">All Types</option>
              <option value="diary">Diary</option>
              <option value="thought">Thought</option>
              <option value="quote">Quote</option>
              <option value="idea">Idea</option>
              <option value="note">Note</option>
              <option value="personal">Personal</option>
              <option value="gratitude">Gratitude</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => handleFilterChange({ sort: e.target.value })}
              style={{ marginLeft: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid var(--input-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--input-bg)', color: 'var(--ink)', fontFamily: 'inherit', fontSize: '0.9rem' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="recentlyUpdated">Recently Updated</option>
              <option value="az">A to Z</option>
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
                onEdit={(e) => window.location.href = `/entries/${e._id}/edit?from=${encodeURIComponent('/favorites')}`}
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

          {pagination.totalPages > 1 && (
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)' }}>
              <Button variant="subtle" size="sm" onClick={() => handlePageChange(params.page - 1)} disabled={params.page <= 1}>Previous</Button>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) pageNum = i + 1;
                  else if (params.page <= 3) pageNum = i + 1;
                  else if (params.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                  else pageNum = params.page - 2 + i;
                  return <Button key={pageNum} variant={params.page === pageNum ? 'filled' : 'subtle'} size="sm" onClick={() => handlePageChange(pageNum)}>{pageNum}</Button>;
                })}
              </span>
              <Button variant="subtle" size="sm" onClick={() => handlePageChange(params.page + 1)} disabled={params.page >= pagination.totalPages}>Next</Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useEntries } from '../hooks/useEntries';
import { EntryCard } from '../components/diary/EntryCard';
import { SearchBar, FilterPopover, DatePickerPopover, EmptyState, ErrorState } from '../components/diary/SearchAndFilter';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';
import { Plus, Filter, Calendar, X, BookOpen } from 'lucide-react';
import { formatDate, getEntryTypeLabel } from '../utils/helpers';
import { classNames } from '../utils/helpers';
import { useDateFilter } from '../context/DateFilterContext';
import { entriesApi } from '../services/api';
import { CATEGORY_SECTIONS } from '../constants/categorySections';

const FilterChip = ({ label, onClear }) => (
  <span className="filter-chip">
    <span>{label}</span>
    <button
      type="button"
      className="filter-chip-remove"
      onClick={onClear}
      aria-label={`Remove filter: ${label}`}
    >
      <X size={11} />
    </button>
  </span>
);

const PAGE_SIZE = 12;

export const Entries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { date: selectedDate, setDate: setSelectedDate } = useDateFilter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || null,
    sort: searchParams.get('sort') || 'newest',
    favorite: searchParams.get('favorite') === 'true',
    pinned: searchParams.get('pinned') === 'true',
    publicOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const filterButtonRef = useRef(null);
  const popoverRef = useRef(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarButtonRef = useRef(null);
  const datePopoverRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(e.target)
      ) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilters]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        datePopoverRef.current &&
        !datePopoverRef.current.contains(e.target) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(e.target)
      ) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar]);

  const filterCount = [filters.type, filters.favorite, filters.pinned].filter(Boolean).length;

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
    deleteEntry,
    toggleFavorite,
    togglePin,
    updateEntry,
    refresh,
  } = useEntries({
    limit: PAGE_SIZE,
    type: filters.type,
    sort: filters.sort,
    favorite: filters.favorite,
    pinned: filters.pinned,
    date: selectedDate,
  });

  // Infinite scroll trigger when sentinel comes into viewport
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '180px', threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore]);

  // Unified query updater: synchronizes URL parameters and executes API query
  const updateEntriesQuery = useCallback((newFilters, newDate, newSearch) => {
    // 1. Synchronize URL search params
    const newParams = new URLSearchParams();
    if (newSearch) newParams.set('q', newSearch);
    if (newFilters.type) newParams.set('type', newFilters.type);
    if (newFilters.sort && newFilters.sort !== 'newest') newParams.set('sort', newFilters.sort);
    if (newFilters.favorite) newParams.set('favorite', 'true');
    if (newFilters.pinned) newParams.set('pinned', 'true');
    if (newDate) newParams.set('date', newDate);
    setSearchParams(newParams, { replace: true });

    // 2. Fetch from API starting at page 1
    if (newSearch && newSearch.trim()) {
      searchEntries(newSearch.trim(), { ...newFilters, date: newDate, page: 1, limit: PAGE_SIZE });
    } else {
      setApiFilters({ ...newFilters, date: newDate, page: 1, limit: PAGE_SIZE, search: '' });
    }
  }, [setSearchParams, searchEntries, setApiFilters]);

  // Synchronize state when browser back/forward navigation occurs
  useEffect(() => {
    const nextQuery = searchParams.get('q') || '';
    const nextDate = searchParams.get('date') || '';
    const nextFilters = {
      type: searchParams.get('type') || null,
      sort: searchParams.get('sort') || 'newest',
      favorite: searchParams.get('favorite') === 'true',
      pinned: searchParams.get('pinned') === 'true',
      publicOnly: false,
    };
    setSearchQuery(prev => prev === nextQuery ? prev : nextQuery);
    setSelectedDate(prev => prev === nextDate ? prev : nextDate);
    setFilters(prev => {
      const unchanged = prev.type === nextFilters.type
        && prev.sort === nextFilters.sort
        && prev.favorite === nextFilters.favorite
        && prev.pinned === nextFilters.pinned;
      return unchanged ? prev : nextFilters;
    });
  }, [searchParams, setSelectedDate]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    updateEntriesQuery(filters, selectedDate, query);
  };

  const handleFilterChange = (newFilters) => {
    const nextFilters = { ...filters, ...newFilters };
    setFilters(nextFilters);
    updateEntriesQuery(nextFilters, selectedDate, searchQuery);
  };

  const handleDateSelect = (date) => {
    const nextDate = selectedDate === date ? '' : date;
    setSelectedDate(nextDate);
    setShowCalendar(false);
    updateEntriesQuery(filters, nextDate, searchQuery);
  };

  const handleClearDate = () => {
    setSelectedDate('');
    updateEntriesQuery(filters, '', searchQuery);
  };

  const clearAllFilters = () => {
    const resetFilters = { type: null, sort: 'newest', favorite: false, pinned: false, publicOnly: false };
    setFilters(resetFilters);
    setSelectedDate('');
    setSearchQuery('');
    setShowFilters(false);
    setShowCalendar(false);
    updateEntriesQuery(resetFilters, '', '');
  };

  const hasActiveFilters = filters.type || filters.favorite || filters.pinned || filters.publicOnly || searchQuery || selectedDate;

  if (loading && entries.length === 0) {
    return <LoadingState message="Loading entries..." />;
  }

  if (error && entries.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="entries-page">
      {/* ── Page Header ── */}
      <header className="entries-page-header">
        <div className="entries-page-title-row">
          <div className="entries-title-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 auto' }}>
            <div className="entries-page-icon">
              <BookOpen size={17} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 className="entries-page-title">All Entries</h1>
              <p className="entries-page-meta">
                Showing {entries.length} of {pagination.total ?? entries.length} {(pagination.total ?? entries.length) === 1 ? 'entry' : 'entries'}
                {hasActiveFilters && <span className="entries-filter-indicator"> · filtered</span>}
              </p>
            </div>
          </div>
          <Link to="/dashboard" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button className="entries-new-btn" type="button">
              <Plus size={16} />
              <span>New Entry</span>
            </button>
          </Link>
        </div>

        {/* ── Toolbar: search + filter + calendar in one row ── */}
        <div className="entries-toolbar-row">
          {/* Search */}
          <div className="entries-search-wrap">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onSearch={handleSearchSubmit}
              placeholder="Search entries..."
              loading={loading}
            />
          </div>

          {/* Controls */}
          <div className="entries-controls">
            {/* Filter */}
            <div className="entries-ctrl-anchor" ref={filterButtonRef}>
              <button
                type="button"
                className={`entries-ctrl-btn${showFilters ? ' active' : ''}${filterCount > 0 ? ' has-badge' : ''}`}
                onClick={() => setShowFilters(p => !p)}
                aria-label="Filter entries"
              >
                <Filter size={15} />
                <span>Filter</span>
                {filterCount > 0 && <span className="entries-ctrl-badge">{filterCount}</span>}
              </button>
              {showFilters && (
                <div ref={popoverRef}>
                  <FilterPopover filters={filters} onFilterChange={handleFilterChange} />
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="entries-ctrl-anchor" ref={calendarButtonRef}>
              <button
                type="button"
                className={`entries-ctrl-btn${showCalendar ? ' active' : ''}${selectedDate ? ' has-badge' : ''}`}
                onClick={() => setShowCalendar(p => !p)}
                aria-label="Filter by date"
              >
                <Calendar size={15} />
                <span>{selectedDate ? formatDate(selectedDate, 'SHORT') : 'Date'}</span>
              </button>
              {showCalendar && (
                <div ref={datePopoverRef}>
                  <DatePickerPopover selectedDate={selectedDate} onDateSelect={handleDateSelect} />
                </div>
              )}
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                type="button"
                className="entries-ctrl-btn entries-ctrl-clear"
                onClick={clearAllFilters}
                aria-label="Clear all filters"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Category Quick-Switcher Tabs ── */}
        <div
          className="entries-category-tabs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            padding: '4px 0 6px',
            marginTop: '12px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            type="button"
            onClick={() => handleFilterChange({ type: null })}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: !filters.type ? '1px solid var(--gold)' : '1px solid var(--border)',
              backgroundColor: !filters.type ? 'var(--paper-dark)' : 'var(--paper)',
              color: !filters.type ? 'var(--gold)' : 'var(--ink-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.18s ease',
            }}
          >
            All Spaces
          </button>
          {CATEGORY_SECTIONS.map(cat => {
            const isSelected = filters.type === cat.type;
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => handleFilterChange({ type: isSelected ? null : cat.type })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--gold)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--paper-dark)' : 'var(--paper)',
                  color: isSelected ? 'var(--gold)' : 'var(--ink-muted)',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.18s ease',
                }}
              >
                <CatIcon size={13} style={{ color: isSelected ? 'var(--gold)' : 'currentColor' }} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Active filter chips ── */}
        {hasActiveFilters && (
          <div className="active-filters" role="group" aria-label="Active filters">
            {searchQuery && (
              <FilterChip label={`"${searchQuery}"`} onClear={() => handleSearchSubmit('')} />
            )}
            {filters.type && (
              <FilterChip label={getEntryTypeLabel(filters.type)} onClear={() => handleFilterChange({ type: null })} />
            )}
            {filters.favorite && (
              <FilterChip label="Favorites" onClear={() => handleFilterChange({ favorite: false })} />
            )}
            {filters.pinned && (
              <FilterChip label="Pinned" onClear={() => handleFilterChange({ pinned: false })} />
            )}
            {selectedDate && (
              <FilterChip label={formatDate(selectedDate, 'SHORT')} onClear={handleClearDate} />
            )}
          </div>
        )}
      </header>

      {/* ── Entry list ── */}
      {entries.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={searchQuery ? 'Nothing found. Try another word.' : 'Your pages are still waiting for their first story.'}
          message={searchQuery ? 'No entries match your search.' : 'Start writing to fill these pages with your thoughts, memories, and reflections.'}
          actionLabel="Write Your First Entry"
          onAction={() => window.location.href = '/dashboard'}
        />
      ) : (
        <>
          <div className="entries-list">
            {entries.map((entry, index) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                index={index}
                onEdit={(e) => window.location.href = `/entries/${e._id}/edit?from=${encodeURIComponent('/entries')}`}
                onDelete={async (id) => {
                  await deleteEntry(id);
                }}
                onFavorite={async (e, next) => {
                  await toggleFavorite(e._id, next);
                }}
                onPin={async (e, next) => {
                  await togglePin(e._id, next);
                }}
                onVisibility={async (e, next) => {
                  await updateEntry(e._id, { visibility: next });
                }}
              />
            ))}
          </div>

          {/* ── Load More / Pagination Area ── */}
          {hasMore && (
            <div className="entries-load-more-section" ref={loadMoreRef}>
              <button
                type="button"
                className={`entries-load-more-btn${loadingMore ? ' loading' : ''}`}
                onClick={loadMore}
                disabled={loadingMore}
                aria-label="Load more entries"
              >
                {loadingMore ? (
                  <span className="entries-load-more-spinner-content">
                    <span className="entries-load-more-spinner" aria-hidden="true" />
                    <span>Loading more memories...</span>
                  </span>
                ) : (
                  <span className="entries-load-more-content">
                    <span>Load More Entries</span>
                    <span className="entries-load-more-badge">
                      +{Math.min(PAGE_SIZE, (pagination.total || 0) - entries.length)}
                    </span>
                  </span>
                )}
              </button>

              <p className="entries-load-more-progress">
                Showing {entries.length} of {pagination.total} entries
              </p>
            </div>
          )}

          {!hasMore && entries.length > 0 && (pagination.total || 0) > PAGE_SIZE && (
            <div className="entries-caught-up-banner">
              <span className="entries-caught-up-line" />
              <span className="entries-caught-up-text">✦ All {pagination.total} entries loaded · You're all caught up ✦</span>
              <span className="entries-caught-up-line" />
            </div>
          )}
        </>
      )}
    </div>
  );
};
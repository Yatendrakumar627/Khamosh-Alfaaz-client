import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useEntries } from '../hooks/useEntries';
import { EntryCard } from '../components/diary/EntryCard';
import { SearchBar, FilterPopover, DatePickerPopover, EmptyState, ErrorState } from '../components/diary/SearchAndFilter';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';
import { Plus, Filter, Calendar, X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { formatDate, getEntryTypeLabel } from '../utils/helpers';
import { classNames } from '../utils/helpers';
import { useDateFilter } from '../context/DateFilterContext';
import { entriesApi } from '../services/api';

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
    error,
    pagination,
    params,
    searchEntries,
    setFilters: setApiFilters,
    setPage,
    refresh,
  } = useEntries({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
    type: filters.type,
    sort: filters.sort,
    favorite: filters.favorite,
    pinned: filters.pinned,
    date: selectedDate,
  });

  // Unified query updater: synchronizes URL parameters and executes API query
  const updateEntriesQuery = useCallback((newFilters, newDate, newSearch, newPage = 1) => {
    // 1. Synchronize URL search params
    const newParams = new URLSearchParams();
    if (newSearch) newParams.set('q', newSearch);
    if (newFilters.type) newParams.set('type', newFilters.type);
    if (newFilters.sort && newFilters.sort !== 'newest') newParams.set('sort', newFilters.sort);
    if (newFilters.favorite) newParams.set('favorite', 'true');
    if (newFilters.pinned) newParams.set('pinned', 'true');
    if (newDate) newParams.set('date', newDate);
    if (newPage > 1) newParams.set('page', newPage.toString());
    setSearchParams(newParams, { replace: true });

    // 2. Fetch from API
    setPage(newPage);
    if (newSearch && newSearch.trim()) {
      searchEntries(newSearch.trim(), { ...newFilters, date: newDate, page: newPage });
    } else {
      setApiFilters({ ...newFilters, date: newDate, page: newPage });
    }
  }, [setSearchParams, setPage, searchEntries, setApiFilters]);

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
    updateEntriesQuery(filters, selectedDate, query, 1);
  };

  const handleFilterChange = (newFilters) => {
    const nextFilters = { ...filters, ...newFilters };
    setFilters(nextFilters);
    updateEntriesQuery(nextFilters, selectedDate, searchQuery, 1);
  };

  const handleDateSelect = (date) => {
    const nextDate = selectedDate === date ? '' : date;
    setSelectedDate(nextDate);
    setShowCalendar(false);
    updateEntriesQuery(filters, nextDate, searchQuery, 1);
  };

  const handleClearDate = () => {
    setSelectedDate('');
    updateEntriesQuery(filters, '', searchQuery, 1);
  };

  const handlePageChange = (page) => {
    setPage(page);
    updateEntriesQuery(filters, selectedDate, searchQuery, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    const resetFilters = { type: null, sort: 'newest', favorite: false, pinned: false, publicOnly: false };
    setFilters(resetFilters);
    setSelectedDate('');
    setSearchQuery('');
    setShowFilters(false);
    setShowCalendar(false);
    updateEntriesQuery(resetFilters, '', '', 1);
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
                {pagination.total ?? entries.length} {(pagination.total ?? entries.length) === 1 ? 'entry' : 'entries'}
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

          {/* ── Pagination ── */}
          {pagination.totalPages > 1 && (
            <nav className="entries-pagination" aria-label="Pagination">
              <button
                className="entries-pg-btn"
                onClick={() => handlePageChange(params.page - 1)}
                disabled={params.page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <div className="entries-pg-pages">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) pageNum = i + 1;
                  else if (params.page <= 3) pageNum = i + 1;
                  else if (params.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                  else pageNum = params.page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      className={`entries-pg-num${params.page === pageNum ? ' active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={params.page === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className="entries-pg-btn"
                onClick={() => handlePageChange(params.page + 1)}
                disabled={params.page >= pagination.totalPages}
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useEntries } from '../hooks/useEntries';
import { EntryCard } from '../components/diary/EntryCard';
import { SearchBar, FilterPopover, DatePickerPopover, EmptyState, ErrorState } from '../components/diary/SearchAndFilter';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';
import { Plus, Filter, Calendar } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { classNames } from '../utils/helpers';
import { debounce } from '../utils/helpers';
import { useDateFilter } from '../context/DateFilterContext';
import { entriesApi } from '../services/api';

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

  const { entries, loading, error, pagination, params, searchEntries, setFilters: setApiFilters, setPage, refresh } = useEntries({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
    type: filters.type,
    sort: filters.sort,
    favorite: filters.favorite,
    pinned: filters.pinned,
    date: selectedDate,
  });

  const debouncedSearch = useCallback(
    debounce((query) => {
      setPage(1);
      if (query.trim()) {
        searchEntries(query, { ...filters, page: 1 });
      } else {
        setApiFilters({ ...filters, page: 1 });
      }
    }, 300),
    [searchEntries, filters, setApiFilters, setPage],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [debouncedSearch]);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    if (filters.type) newParams.set('type', filters.type);
    if (filters.sort && filters.sort !== 'newest') newParams.set('sort', filters.sort);
    if (filters.favorite) newParams.set('favorite', 'true');
    if (filters.pinned) newParams.set('pinned', 'true');
    if (selectedDate) newParams.set('date', selectedDate);
    if (params.page > 1) newParams.set('page', params.page.toString());
    setSearchParams(newParams, { replace: true });
  }, [searchQuery, filters, selectedDate, params.page, searchParams, setSearchParams]);

  useEffect(() => {
    const nextQuery = searchParams.get('q') || '';
    const nextDate = searchParams.get('date') || '';
    const nextFilters = {
      type: searchParams.get('type') || null,
      sort: searchParams.get('sort') || 'newest',
      favorite: searchParams.get('favorite') === 'true',
      pinned: searchParams.get('pinned') === 'true',
    };

    setSearchQuery(value => value === nextQuery ? value : nextQuery);
    setFilters(value => {
      const unchanged = value.type === nextFilters.type
        && value.sort === nextFilters.sort
        && value.favorite === nextFilters.favorite
        && value.pinned === nextFilters.pinned;
      return unchanged ? value : nextFilters;
    });
    setSelectedDate(value => value === nextDate ? value : nextDate);
  }, [searchParams]);

  useEffect(() => {
    setApiFilters({
      type: filters.type,
      sort: filters.sort,
      favorite: filters.favorite,
      pinned: filters.pinned,
      date: selectedDate,
      page: params.page,
    });
  }, [filters, selectedDate, params.page, setApiFilters]);

  const handleFilterChange = (newFilters) => {
    const nextFilters = { ...filters, ...newFilters };
    setFilters(nextFilters);
    setApiFilters({ ...nextFilters, page: 1 });
  };

  const handleFilterToggle = () => {
    setShowFilters(prev => !prev);
  };

  const handleCalendarToggle = () => {
    setShowCalendar(prev => !prev);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(prev => (prev === date ? '' : date));
    setPage(1);
    setShowCalendar(false);
  };

  const handlePageChange = (page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    const nextFilters = { type: null, sort: 'newest', favorite: false, pinned: false, publicOnly: false };
    setFilters(nextFilters);
    setApiFilters({ ...nextFilters, date: null, page: 1 });
    setSearchQuery('');
    setSelectedDate('');
    setShowFilters(false);
    setShowCalendar(false);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasActiveFilters = filters.type || filters.favorite || filters.pinned || filters.publicOnly || searchQuery || selectedDate;

  if (loading && entries.length === 0) {
    return <LoadingState message="Loading entries..." />;
  }

  if (error && entries.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
              All Entries
            </h1>
            <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
              {pagination.total} {pagination.total === 1 ? 'entry' : 'entries'}{hasActiveFilters ? ' (filtered)' : ''}
            </p>
          </div>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button className="btn-primary" leftIcon={<Plus size={18} />}>New Entry</Button>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={debouncedSearch}
            placeholder="Search entries..."
            loading={loading}
          />
          <div style={{ position: 'relative', display: 'inline-block' }} ref={filterButtonRef}>
            <Button
              variant={showFilters ? 'filled' : 'outline'}
              onClick={handleFilterToggle}
              leftIcon={<Filter size={18} />}
              style={filterCount > 0 ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}}
            >
              Filter
              {filterCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    marginLeft: '6px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--gold)',
                    color: 'var(--ink)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {filterCount}
                </span>
              )}
            </Button>
            {showFilters && (
              <div ref={popoverRef}>
                <FilterPopover
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }} ref={calendarButtonRef}>
            <Button
              variant={showCalendar ? 'filled' : 'outline'}
              onClick={handleCalendarToggle}
              leftIcon={<Calendar size={18} />}
              style={selectedDate ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}}
            >
              {selectedDate ? formatDate(`${selectedDate}T00:00:00`, 'SHORT') : 'Calendar'}
            </Button>
            {showCalendar && (
              <div ref={datePopoverRef}>
                <DatePickerPopover selectedDate={selectedDate} onDateSelect={handleDateSelect} />
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <Button variant="subtle" size="sm" onClick={clearAllFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </header>

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {entries.map(entry => (
              <EntryCard
                key={entry._id}
                entry={entry}
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

          {pagination.totalPages > 1 && (
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)' }}>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => handlePageChange(params.page - 1)}
                disabled={params.page <= 1}
              >
                Previous
              </Button>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (params.page <= 3) {
                    pageNum = i + 1;
                  } else if (params.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = params.page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={params.page === pageNum ? 'filled' : 'subtle'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </span>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => handlePageChange(params.page + 1)}
                disabled={params.page >= pagination.totalPages}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};
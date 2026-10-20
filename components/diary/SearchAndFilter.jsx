import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Star, Pin, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { debounce } from '../../utils/helpers';
import { classNames } from '../../utils/helpers';
import { getMonthYear, generateCalendarDays } from '../../utils/helpers';
import { ENTRY_TYPES, SORT_OPTIONS } from '../../constants';

export const SearchBar = ({ value, onChange, onSearch, placeholder = 'Search entries...', loading = false }) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedSearch = useCallback(debounce((val) => {
    onSearch(val);
  }, 300), [onSearch]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    debouncedSearch('');
  };

  return (
    <div className="search-bar-root" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <label htmlFor="search" className="sr-only">Search entries</label>
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          className="search-bar-icon"
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--ink-light)',
            pointerEvents: 'none',
          }}
        />
        <input
          id="search"
          type="search"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="search-bar-input"
          style={{
            width: '100%',
            padding: 'var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 40px',
            border: '1px solid var(--input-border)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--ink)',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
          }}
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 'var(--spacing-sm)',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: 'var(--spacing-xs)',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-light)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
        {loading && (
          <div style={{
            position: 'absolute',
            right: localValue ? '44px' : 'var(--spacing-sm)',
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <div style={{ width: '16px', height: '16px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export const FilterPopover = ({ filters, onFilterChange }) => {
  const { type, sort, favorite, pinned, publicOnly } = filters;

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        zIndex: 1100,
        width: 'min(320px, calc(100vw - 24px))',
        maxHeight: 'calc(100dvh - 120px)',
        overflowY: 'auto',
        borderRadius: '12px',
        backgroundColor: 'var(--paper-dark)',
        border: '1px solid var(--border-dark)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'var(--spacing-md)',
      }}
      className="paper-texture filter-popover"
    >
      <div style={{
        fontFamily: 'var(--font-family-heading)',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--ink)',
        marginBottom: 'var(--spacing-sm)',
      }}>
        Filter
      </div>

      <input
        type="search"
        placeholder="Search entries..."
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid var(--input-border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--input-bg)',
          color: 'var(--ink)',
          fontFamily: 'inherit',
          fontSize: '0.9rem',
          marginBottom: 'var(--spacing-md)',
          minHeight: '44px',
          boxSizing: 'border-box',
        }}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-md)',
      }}>
        <select
          value={type || 'all'}
          onChange={(e) => onFilterChange({ type: e.target.value || null })}
          className="form-select"
          style={{
            padding: '10px 12px',
            border: '1px solid var(--input-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--ink)',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            minHeight: '44px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <option value="all">All Types</option>
          {ENTRY_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={sort || 'newest'}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
          className="form-select"
          style={{
            padding: '10px 12px',
            border: '1px solid var(--input-border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--ink)',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            minHeight: '44px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
        marginBottom: 'var(--spacing-md)',
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: 'var(--ink-muted)',
          minHeight: '44px',
        }}>
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => onFilterChange({ favorite: e.target.checked })}
            style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }}
          />
          <Star size={14} style={{ color: favorite ? 'var(--gold)' : 'var(--ink-light)', flexShrink: 0 }} fill={favorite ? 'currentColor' : 'none'} />
          Favorites
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: 'var(--ink-muted)',
          minHeight: '44px',
        }}>
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => onFilterChange({ pinned: e.target.checked })}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
          />
          <Pin size={14} style={{ color: pinned ? 'var(--accent)' : 'var(--ink-light)', flexShrink: 0 }} fill={pinned ? 'currentColor' : 'none'} />
          Pinned
        </label>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: 'var(--ink-muted)',
          minHeight: '44px',
        }}>
          <input
            type="checkbox"
            checked={publicOnly}
            onChange={(e) => onFilterChange({ publicOnly: e.target.checked })}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
          />
          <Globe size={14} style={{ color: publicOnly ? 'var(--accent)' : 'var(--ink-light)', flexShrink: 0 }} />
          Public Only
        </label>
      </div>

      <button
        type="button"
        style={{
          width: '100%',
          padding: '10px 16px',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--gold)',
          color: 'var(--ink)',
          fontFamily: 'inherit',
          fontSize: '0.9rem',
          fontWeight: 500,
          cursor: 'pointer',
          minHeight: '44px',
        }}
      >
        Apply Filters
      </button>
    </div>
  );
};

export const FilterBar = ({ filters, onFilterChange, categories = [] }) => {
  const { type, sort, favorite, pinned } = filters;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--spacing-md)',
      alignItems: 'center',
      padding: 'var(--spacing-md)',
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 'var(--spacing-lg)',
    }} className="paper-texture">
      <select
        value={type || 'all'}
        onChange={(e) => onFilterChange({ type: e.target.value || null })}
        className="form-select"
        style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          border: '1px solid var(--input-border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--input-bg)',
          color: 'var(--ink)',
          fontFamily: 'inherit',
          fontSize: '0.9rem',
          minWidth: '140px',
        }}
      >
        <option value="all">All Types</option>
        {['diary', 'thought', 'quote', 'idea', 'note', 'personal', 'gratitude', 'other'].map(t => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>

      <select
        value={sort || 'newest'}
        onChange={(e) => onFilterChange({ sort: e.target.value })}
        className="form-select"
        style={{
          padding: 'var(--spacing-sm) var(--spacing-md)',
          border: '1px solid var(--input-border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--input-bg)',
          color: 'var(--ink)',
          fontFamily: 'inherit',
          fontSize: '0.9rem',
          minWidth: '160px',
        }}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="recentlyUpdated">Recently Updated</option>
        <option value="az">A to Z</option>
      </select>

      <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginLeft: 'auto' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => onFilterChange({ favorite: e.target.checked })}
            style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }}
          />
          <Star size={14} style={{ color: favorite ? 'var(--gold)' : 'var(--ink-light)' }} fill={favorite ? 'currentColor' : 'none'} />
          Favorites
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => onFilterChange({ pinned: e.target.checked })}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
          />
          <Pin size={14} style={{ color: pinned ? 'var(--accent)' : 'var(--ink-light)' }} fill={pinned ? 'currentColor' : 'none'} />
          Pinned
        </label>
      </div>
    </div>
  );
};

export const DatePickerPopover = ({ selectedDate, onDateSelect }) => {
  const popoverRef = useRef(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  })();

  const days = generateCalendarDays(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
  );

  const selectedDateStr = selectedDate || '';

  // Prevent popover from spilling outside viewport on small / mobile screens
  useEffect(() => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();
      const padding = 12;
      if (rect.right > window.innerWidth - padding) {
        const overflow = rect.right - (window.innerWidth - padding);
        popoverRef.current.style.right = `${overflow}px`;
      } else if (rect.left < padding) {
        const overflow = padding - rect.left;
        popoverRef.current.style.right = `-${overflow}px`;
      }
    }
  }, [currentMonth]);

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const isNextMonthFuture = (() => {
    const today = new Date();
    const nextY = currentMonth.getMonth() === 11 ? currentMonth.getFullYear() + 1 : currentMonth.getFullYear();
    const nextM = (currentMonth.getMonth() + 1) % 12;
    return nextY > today.getFullYear() || (nextY === today.getFullYear() && nextM > today.getMonth());
  })();

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        zIndex: 1100,
        width: 'min(310px, calc(100vw - 24px))',
        maxWidth: 'calc(100vw - 24px)',
        borderRadius: '12px',
        backgroundColor: 'var(--paper-dark)',
        border: '1px solid var(--border-dark)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'var(--spacing-md)',
        maxHeight: 'calc(100dvh - 120px)',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
      className="paper-texture datepicker-popover"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)', gap: '4px' }}>
        <div style={{ fontFamily: 'var(--font-family-heading)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
          {getMonthYear(currentMonth)}
        </div>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setCurrentMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return new Date(d.getFullYear(), d.getMonth(), 1); })}
            style={{ padding: '4px', border: 'none', background: 'transparent', color: 'var(--ink-muted)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '30px', minHeight: '30px' }}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={goToToday}
            style={{ padding: '3px 8px', border: '1px solid var(--border)', background: 'var(--paper)', color: 'var(--gold)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600, fontFamily: 'inherit', minHeight: '28px' }}
          >
            Today
          </button>

          {selectedDateStr && (
            <button
              type="button"
              onClick={() => onDateSelect('')}
              style={{ padding: '3px 8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-light)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.74rem', fontFamily: 'inherit', minHeight: '28px' }}
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return new Date(d.getFullYear(), d.getMonth(), 1); })}
            disabled={isNextMonthFuture}
            style={{ padding: '4px', border: 'none', background: 'transparent', color: isNextMonthFuture ? 'var(--ink-light)' : 'var(--ink-muted)', opacity: isNextMonthFuture ? 0.35 : 1, borderRadius: '6px', cursor: isNextMonthFuture ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '30px', minHeight: '30px' }}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: 'var(--spacing-xs)' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: 'var(--ink-light)', padding: '4px 0', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', overflowY: 'auto' }}>
        {days.map((dayInfo, i) => {
          if (!dayInfo.date) return <div key={`empty-${i}`} style={{ height: '34px' }} />;
          const isSelected = dayInfo.date === selectedDateStr;
          const isToday = dayInfo.date === todayStr;
          const isFuture = dayInfo.date > todayStr;
          return (
            <button
              key={dayInfo.date}
              type="button"
              disabled={isFuture}
              onClick={() => onDateSelect(dayInfo.date)}
              style={{
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: isToday && !isSelected ? '1px dashed var(--gold)' : 'none',
                backgroundColor: isSelected ? 'var(--gold)' : 'transparent',
                color: isSelected ? 'var(--paper-darker)' : isFuture ? 'var(--ink-light)' : 'var(--ink)',
                fontSize: '0.84rem',
                fontFamily: 'inherit',
                cursor: isFuture ? 'not-allowed' : 'pointer',
                fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                opacity: isFuture ? 0.3 : 1,
                position: 'relative',
                minWidth: 0,
                width: '100%',
                transition: 'background-color 0.12s',
              }}
              aria-label={`Select ${dayInfo.date}`}
            >
              {dayInfo.day}
              {isToday && !isSelected && <span style={{ position: 'absolute', bottom: '2px', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--gold)' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const EmptyState = ({ icon, title, message, actionLabel, onAction, children }) => {
  return (
    <div className="paper-texture fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--spacing-xxl)',
      color: 'var(--ink-muted)',
    }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'radial-gradient(circle at 32% 28%, var(--gold-light) 0%, var(--active-bg) 70%)',
        boxShadow: 'inset 0 1px 1px rgba(255, 251, 240, 0.5), 0 4px 14px var(--shadow-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 'var(--spacing-lg)', color: 'var(--gold-dark)',
      }}>
        {icon && (() => {
          const Icon = icon;
          return <Icon size={36} />;
        })()}
      </div>
      <h3 style={{
        fontFamily: 'var(--font-family-heading)',
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--ink)',
        margin: '0 0 var(--spacing-sm)',
      }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 var(--spacing-lg)', maxWidth: '300px', lineHeight: 1.45 }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
          style={{
            padding: 'var(--spacing-sm) var(--spacing-xl)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
};

export const ErrorState = ({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try Again' }) => {
  return (
    <div className="paper-texture fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--spacing-xxl)',
      color: 'var(--error)',
    }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <h3 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.5rem', fontWeight: 600, margin: '0 0 var(--spacing-sm)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 var(--spacing-lg)', maxWidth: '300px', color: 'var(--ink-muted)' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary"
          style={{
            padding: 'var(--spacing-sm) var(--spacing-xl)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
};
import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '../hooks/useEntries';
import { CalendarDay } from '../components/diary/Calendar';
import { EmptyState } from '../components/diary/SearchAndFilter';
import { LoadingState } from '../components/ui/LoadingState';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDate, getMonthYear } from '../utils/helpers';
import { classNames } from '../utils/helpers';

export const Calendar = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayView, setShowDayView] = useState(false);
  const gridRef = useRef(null);

  const { entries, loading } = useEntries({ limit: 100 });

  const entriesByDate = useMemo(() => {
    const map = {};
    for (const entry of entries) {
      const raw = entry.entryDate || entry.createdAt;
      if (!raw) continue;
      const d = new Date(raw);
      if (isNaN(d.getTime())) continue;
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[date]) map[date] = [];
      map[date].push(entry);
    }
    return map;
  }, [entries]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const monthEntryCount = useMemo(
    () =>
      Object.entries(entriesByDate)
        .filter(([date]) => date.startsWith(monthKey))
        .reduce((total, [, list]) => total + list.length, 0),
    [entriesByDate, monthKey],
  );

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + direction);
      return next;
    });
  };

  const jumpToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDayView(true);
  };

  const handleCloseDayView = () => {
    setShowDayView(false);
    setSelectedDate(null);
  };

  const handleEntryClick = (entry) => {
    navigate(`/entries/${entry._id}`);
  };

  // Keyboard navigation — arrows move across days (wrapping into adjacent months), Enter/Space opens the day sheet
  const handleDayKeyDown = (e, dateStr) => {
    if (!dateStr) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDateSelect(dateStr);
      return;
    }

    const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const delta = deltas[e.key];
    if (delta === undefined) return;
    e.preventDefault();

    const d = new Date(`${dateStr}T00:00:00`);
    const next = new Date(d);
    next.setDate(d.getDate() + delta);
    const nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;

    if (next.getMonth() === currentMonth.getMonth() && next.getFullYear() === currentMonth.getFullYear()) {
      const btn = gridRef.current?.querySelector(`[data-date="${nextStr}"]`);
      if (btn) btn.focus();
      return;
    }

    setCurrentMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    requestAnimationFrame(() => {
      const btn = document.querySelector(`[data-date="${nextStr}"]`);
      if (btn) btn.focus();
    });
  };

  // Day matrix — leading blanks for the first week's offset, then the month's days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstWeekday; i++) {
    days.push({ date: null, isCurrentMonth: false, day: null, count: 0, isToday: false, isSelected: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({
      date: dateStr,
      day,
      isCurrentMonth: true,
      count: (entriesByDate[dateStr] || []).length,
      isToday: dateStr === todayStr,
      isSelected: selectedDate === dateStr,
    });
  }

  if (loading) {
    return <LoadingState message="Loading calendar..." />;
  }

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
          Calendar
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
          Browse your memories by date
        </p>
      </header>

      {showDayView && selectedDate && (
        <div className="cal-day-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--overlay)', zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 'var(--spacing-xl)', animation: 'fadeIn 0.2s ease' }}>
          <div
            className="paper-texture cal-day-sheet"
            style={{
              backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
              width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
              animation: 'slideIn 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--paper)', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--ink)' }}>
                {formatDate(selectedDate, 'DISPLAY')}
              </h2>
              <button onClick={handleCloseDayView} style={{ padding: 'var(--spacing-sm)', border: 'none', background: 'transparent', color: 'var(--ink-muted)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} aria-label="Close day view"><X size={24} /></button>
            </div>
            <CalendarDay date={selectedDate} entries={entriesByDate[selectedDate] || []} onEntryClick={handleEntryClick} />
          </div>
        </div>
      )}

      <div
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
        className="paper-texture diary-page"
      >
        {/* Month header — navigation, title, entry tally, today jump */}
        <div
          className="cal-month-header"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            type="button"
            className="cal-nav-btn"
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft size={22} />
          </button>

          <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
            <h2 className="cal-month-title" style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--ink)', lineHeight: 1.2 }}>
              {getMonthYear(currentMonth)}
            </h2>
            <p className="cal-month-meta" style={{ margin: '2px 0 0', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: monthEntryCount ? 'var(--ink-muted)' : 'var(--ink-light)', fontFamily: 'var(--font-family-ui)' }}>
              {monthEntryCount} {monthEntryCount === 1 ? 'entry' : 'entries'} this month
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', flexShrink: 0 }}>
            {!isCurrentMonth && (
              <button type="button" className="cal-today-btn" onClick={jumpToToday}>
                Today
              </button>
            )}
            <button
              type="button"
              className="cal-nav-btn"
              onClick={() => navigateMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--border)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ textAlign: 'center', padding: 'var(--spacing-xs)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-family-ui)' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Day grid — tinted cells for days with entries, today ring, selection */}
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((day, index) => (
            <button
              key={index}
              type="button"
              data-date={day.date || undefined}
              onClick={() => day.date && handleDateSelect(day.date)}
              onKeyDown={(e) => handleDayKeyDown(e, day.date)}
              disabled={!day.isCurrentMonth}
              aria-label={day.date ? formatDate(day.date, 'DISPLAY') : undefined}
              aria-current={day.isToday ? 'date' : undefined}
              style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 'var(--spacing-xs)',
                border: 'none',
                backgroundColor: day.isSelected
                  ? 'var(--accent)'
                  : day.isToday
                    ? 'var(--gold)20'
                    : day.count > 0
                      ? 'var(--active-bg)'
                      : 'transparent',
                color: day.isCurrentMonth ? (day.isSelected ? 'var(--paper)' : 'var(--ink)') : 'var(--ink-light)',
                cursor: day.isCurrentMonth ? 'pointer' : 'default',
                position: 'relative',
                borderRadius: 0,
                transition: 'background-color 0.15s ease, color 0.15s ease',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
              }}
              className={classNames('cal-day-cell', day.isSelected && 'selected', day.isToday && 'today')}
            >
              <span style={{ fontWeight: day.isToday ? 700 : 500 }}>
                {day.day}
              </span>
              {day.isCurrentMonth && day.count > 0 && (
                <span style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: day.isSelected ? 'var(--paper)' : 'var(--accent)' }} />
              )}
            </button>
          ))}
        </div>

        {/* Empty-month guidance */}
        {monthEntryCount === 0 && (
          <p className="cal-empty-hint" style={{ margin: 0, padding: 'var(--spacing-md) var(--spacing-lg)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
            No entries in {getMonthYear(currentMonth)} yet — your pages are waiting.
          </p>
        )}
      </div>

      <style>{`
        .selected { background-color: var(--accent) !important; color: var(--paper) !important; }
        .selected span { font-weight: 700; }
        .today { font-weight: 600; }
      `}</style>
    </div>
  );
};

export default Calendar;

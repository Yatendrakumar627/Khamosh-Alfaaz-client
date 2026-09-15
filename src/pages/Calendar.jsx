import { useState, useEffect } from 'react';
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

  const { entries, loading, refresh } = useEntries({ limit: 100 });

  const entriesByDate = entries.reduce((acc, entry) => {
    const raw = entry.entryDate || entry.createdAt;
    if (raw) {
      const d = new Date(raw);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (date) {
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
      }
    }
    return acc;
  }, {});

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
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
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--paper)', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--ink)' }}>
                {formatDate(selectedDate, 'DISPLAY')}
              </h2>
              <button onClick={handleCloseDayView} style={{ padding: 'var(--spacing-sm)', border: 'none', background: 'transparent', color: 'var(--ink-muted)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <CalendarDay date={selectedDate} entries={entriesByDate[selectedDate] || []} onEntryClick={handleEntryClick} />
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }} className="paper-texture diary-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => navigateMonth(-1)} style={{ padding: 'var(--spacing-sm)', border: 'none', background: 'transparent', color: 'var(--ink)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}><ChevronLeft size={24} /></button>
          <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--ink)' }}>{getMonthYear(currentMonth)}</h2>
          <button onClick={() => navigateMonth(1)} style={{ padding: 'var(--spacing-sm)', border: 'none', background: 'transparent', color: 'var(--ink)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}><ChevronRight size={24} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--border)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ textAlign: 'center', padding: 'var(--spacing-xs)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-light)', textTransform: 'uppercase' }}>{day}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {(() => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const days = [];

            for (let i = 0; i < firstDay; i++) days.push({ date: null, isCurrentMonth: false, day: null });

            for (let day = 1; day <= daysInMonth; day++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              days.push({
                date: dateStr,
                day,
                isCurrentMonth: true,
                entries: entriesByDate[dateStr] || [],
                count: (entriesByDate[dateStr] || []).length,
                isToday: dateStr === todayStr,
                isSelected: selectedDate === dateStr,
              });
            }
            return days;
          })().map((day, index) => (
            <button
              key={index}
              onClick={() => day.date && handleDateSelect(day.date)}
              disabled={!day.isCurrentMonth}
              style={{
                aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                padding: 'var(--spacing-xs)', border: 'none',
                backgroundColor: day.isToday ? 'var(--gold)20' : (day.isSelected ? 'var(--accent)' : 'transparent'),
                color: day.isCurrentMonth ? (day.isSelected ? 'var(--paper)' : 'var(--ink)') : 'var(--ink-light)',
                cursor: day.isCurrentMonth ? 'pointer' : 'default', position: 'relative', borderRadius: 0, transition: 'all 0.15s ease', fontFamily: 'inherit', fontSize: '0.9rem',
              }}
              className={classNames(day.isSelected && 'selected', day.isToday && 'today')}
            >
              <span style={{ fontWeight: day.isToday ? 700 : 500 }}>{day.day}</span>
              {day.isCurrentMonth && day.count > 0 && (
                <span style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: day.isSelected ? 'var(--paper)' : 'var(--accent)' }} />
              )}
            </button>
          ))}
        </div>
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
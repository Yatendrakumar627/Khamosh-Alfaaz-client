import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Pin, Star } from 'lucide-react';
import { formatDate, getMonthYear, generateCalendarDays, getDaysInMonth, getFirstDayOfMonth } from '../../utils/helpers';
import { classNames } from '../../utils/helpers';
import { useState } from 'react';

export const Calendar = ({ selectedDate, onDateSelect, entriesByDate = {}, month: initialMonth }) => {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || new Date());

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const days = generateCalendarDays(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    entriesByDate
  );

  const todayDate = new Date();
  const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  return (
    <div style={{
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }} className="paper-texture">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 14px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: 'var(--active-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CalendarIcon size={15} style={{ color: 'var(--gold)' }} />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '0.92rem',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {getMonthYear(currentMonth)}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <button
            onClick={() => navigateMonth(-1)}
            className="icon-btn"
            style={{ padding: '4px', border: 'none', background: 'transparent', color: 'var(--ink-muted)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="icon-btn"
            style={{ padding: '3px', border: 'none', background: 'transparent', color: 'var(--ink-muted)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--border)' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            textAlign: 'center',
            padding: 'var(--spacing-xs)',
            fontSize: '0.68rem',
            fontWeight: 600,
            fontFamily: 'var(--font-family-heading)',
            color: 'var(--gold-dark)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day.date && onDateSelect(day.date)}
            disabled={!day.isCurrentMonth}
            style={{
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '2px 0 0',
              border: 'none',
              backgroundColor: 'transparent',
              color: day.isCurrentMonth ? 'var(--ink)' : 'var(--ink-light)',
              cursor: day.isCurrentMonth ? 'pointer' : 'default',
              position: 'relative',
              borderRadius: '50%',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
              fontSize: '0.82rem',
            }}
            className={classNames(
              'cal-day',
              day.date === selectedDate && 'selected',
              day.date === today && 'today'
            )}
          >
            <span style={{ fontWeight: day.date === today ? 700 : 500 }}>
              {day.day}
            </span>
            {day.isCurrentMonth && day.count > 0 && (
              <span style={{
                position: 'absolute',
                bottom: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '4px', height: '4px',
                borderRadius: '50%',
                backgroundColor: day.date === selectedDate ? 'var(--background)' : 'var(--gold)',
              }} />
            )}
          </button>
        ))}
      </div>

      <style>{`
        .selected {
          background-color: var(--gold) !important;
          color: var(--background) !important;
          box-shadow: 0 2px 8px rgba(216,168,91,0.4);
        }
        .selected span { font-weight: 700; }
        .today { font-weight: 700; color: var(--gold); }
        .today:not(.selected) { border-radius: 50%; outline: 1px solid rgba(216,168,91,0.45); outline-offset: 2px; }
      `}</style>
    </div>
  );
};

export const CalendarDay = ({ date, entries = [], onEntryClick }) => {
  return (
    <div style={{
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-lg)',
    }} className="paper-texture fade-in">
      <h3 style={{
        fontFamily: 'var(--font-family-heading)',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--ink)',
        margin: '0 0 var(--spacing-lg)',
      }}>
        {formatDate(date, 'DISPLAY')}
        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--ink-muted)', marginLeft: 'var(--spacing-sm)' }}>
          ({entries.length} entr{entries.length === 1 ? 'y' : 'ies'})
        </span>
      </h3>

      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--ink-muted)' }}>
          <CalendarIcon size={32} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>No memories on this day yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {entries.map(entry => (
            <div
              key={entry._id}
              onClick={() => onEntryClick?.(entry)}
              style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--paper-dark)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: onEntryClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                  color: 'var(--accent)', backgroundColor: 'var(--hover-bg, var(--paper-dark))',
                  padding: '2px 8px', borderRadius: 'var(--radius-full)',
                }}>
                  {entry.type}
                </span>
                {entry.isPinned && <Pin size={13} style={{ color: 'var(--accent)' }} aria-label="Pinned" />}
                {entry.isFavorite && <Star size={13} fill="currentColor" style={{ color: 'var(--gold)' }} aria-label="Favorite" />}
              </div>
              {entry.title && (
                <h4 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1rem', fontWeight: 600, margin: '0 0 var(--spacing-xs)', color: 'var(--ink)' }}>
                  {entry.title}
                </h4>
              )}
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
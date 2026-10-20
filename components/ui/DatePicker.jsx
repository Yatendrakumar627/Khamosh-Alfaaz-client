import { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalDateString, getMonthYear, generateCalendarDays, classNames } from '../../utils/helpers';

/**
 * Formats YYYY-MM-DD into DD-MMM-YYYY (e.g. 10-Oct-YYYY)
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day.padStart(2, '0')}-${months[month] || parts[1]}-${year}`;
};

export const DatePicker = ({
  id,
  value,
  onChange,
  maxDate,
  minDate,
  disabled = false,
  className = '',
  placeholder = 'Select date',
  ariaLabel = 'Select date',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);

  const selectedDateStr = value ? String(value).split('T')[0] : '';
  const todayStr = getLocalDateString();

  // Current month being viewed in calendar
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDateStr) {
      const [y, m] = selectedDateStr.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        return new Date(y, m - 1, 1);
      }
    }
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Sync calendar month when popover opens or value changes
  useEffect(() => {
    if (isOpen && selectedDateStr) {
      const [y, m] = selectedDateStr.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setCurrentMonth(new Date(y, m - 1, 1));
      }
    }
  }, [isOpen, selectedDateStr]);

  // Click outside and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Viewport edge containment adjustment
  useEffect(() => {
    if (isOpen && popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();
      const padding = 10;
      if (rect.left < padding) {
        const overflow = padding - rect.left;
        popoverRef.current.style.right = `-${overflow}px`;
      } else if (rect.right > window.innerWidth - padding) {
        const overflow = rect.right - (window.innerWidth - padding);
        popoverRef.current.style.right = `${overflow}px`;
      }
    }
  }, [isOpen, currentMonth]);

  const days = generateCalendarDays(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
  );

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleTodayClick = (e) => {
    e.stopPropagation();
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    if (!maxDate || todayStr <= maxDate) {
      onChange?.(todayStr);
      setIsOpen(false);
    }
  };

  const handleDateSelect = (dateStr) => {
    if (!dateStr || isDateDisabled(dateStr)) return;
    onChange?.(dateStr);
    setIsOpen(false);
  };

  const isDateDisabled = (dateStr) => {
    if (!dateStr) return true;
    if (maxDate && dateStr > maxDate) return true;
    if (minDate && dateStr < minDate) return true;
    return false;
  };

  // Check if next month is completely in the future beyond maxDate
  const isNextMonthDisabled = (() => {
    if (!maxDate) return false;
    const [maxY, maxM] = maxDate.split('-').map(Number);
    const nextY = currentMonth.getMonth() === 11 ? currentMonth.getFullYear() + 1 : currentMonth.getFullYear();
    const nextM = (currentMonth.getMonth() + 1) % 12;
    return nextY > maxY || (nextY === maxY && nextM > maxM - 1);
  })();

  const isPrevMonthDisabled = (() => {
    if (!minDate) return false;
    const [minY, minM] = minDate.split('-').map(Number);
    const prevY = currentMonth.getMonth() === 0 ? currentMonth.getFullYear() - 1 : currentMonth.getFullYear();
    const prevM = (currentMonth.getMonth() + 11) % 12;
    return prevY < minY || (prevY === minY && prevM < minM - 1);
  })();

  const displayDate = selectedDateStr ? formatDisplayDate(selectedDateStr) : placeholder;

  return (
    <div
      ref={containerRef}
      className={classNames('custom-datepicker-container', className)}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={classNames(
          'entry-field custom-datepicker-trigger',
          isOpen && 'is-open',
        )}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          userSelect: 'none',
          gap: '6px',
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span
          className="custom-datepicker-value"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 'inherit',
            fontWeight: selectedDateStr ? 500 : 400,
            color: selectedDateStr ? 'var(--ink)' : 'var(--ink-light)',
          }}
        >
          {displayDate}
        </span>
        <CalendarDays
          size={14}
          className="custom-datepicker-icon"
          style={{
            color: 'var(--gold)',
            flexShrink: 0,
            opacity: 0.85,
          }}
        />
      </button>

      {/* Calendar Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label="Calendar date picker"
          className="paper-texture datepicker-popover custom-datepicker-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 1200,
            width: 'min(290px, calc(100vw - 24px))',
            maxWidth: 'calc(100vw - 24px)',
            borderRadius: '12px',
            backgroundColor: 'var(--paper-dark)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        >
          {/* Header Month / Year & Nav */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              gap: '6px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-family-heading)',
                fontSize: '0.98rem',
                fontWeight: 600,
                color: 'var(--ink)',
                whiteSpace: 'nowrap',
              }}
            >
              {getMonthYear(currentMonth)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isPrevMonthDisabled}
                style={{
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: isPrevMonthDisabled ? 'var(--ink-light)' : 'var(--ink-muted)',
                  opacity: isPrevMonthDisabled ? 0.35 : 1,
                  borderRadius: '6px',
                  cursor: isPrevMonthDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                }}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={handleTodayClick}
                style={{
                  padding: '3px 7px',
                  border: '1px solid var(--border)',
                  background: 'var(--paper)',
                  color: 'var(--gold)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  height: '26px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Today
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isNextMonthDisabled}
                style={{
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: isNextMonthDisabled ? 'var(--ink-light)' : 'var(--ink-muted)',
                  opacity: isNextMonthDisabled ? 0.35 : 1,
                  borderRadius: '6px',
                  cursor: isNextMonthDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                }}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              marginBottom: '6px',
            }}
          >
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: 'var(--ink-light)',
                  padding: '2px 0',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
            }}
          >
            {days.map((dayInfo, i) => {
              if (!dayInfo.date) {
                return <div key={`empty-${i}`} style={{ height: '32px' }} />;
              }

              const isSelected = dayInfo.date === selectedDateStr;
              const isToday = dayInfo.date === todayStr;
              const disabledDay = isDateDisabled(dayInfo.date);

              return (
                <button
                  key={dayInfo.date}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleDateSelect(dayInfo.date)}
                  className={classNames(
                    'custom-datepicker-day-btn',
                    isSelected && 'is-selected',
                    isToday && 'is-today',
                    disabledDay && 'is-disabled',
                  )}
                  style={{
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '7px',
                    border: isToday && !isSelected ? '1px dashed var(--gold)' : 'none',
                    backgroundColor: isSelected ? 'var(--gold)' : 'transparent',
                    color: isSelected ? 'var(--paper-darker)' : disabledDay ? 'var(--ink-light)' : 'var(--ink)',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    cursor: disabledDay ? 'not-allowed' : 'pointer',
                    fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                    opacity: disabledDay ? 0.3 : 1,
                    position: 'relative',
                    minWidth: 0,
                    width: '100%',
                    padding: 0,
                    transition: 'background-color 0.12s, transform 0.12s',
                  }}
                  aria-label={`Select ${dayInfo.date}`}
                  aria-pressed={isSelected}
                  onMouseEnter={(e) => {
                    if (!isSelected && !disabledDay) {
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !disabledDay) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {dayInfo.day}
                  {isToday && !isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--gold)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;

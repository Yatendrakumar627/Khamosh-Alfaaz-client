import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowUpRight } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

// ─── local date helpers ───────────────────────────────────────────────────────

/** Returns a local-midnight Date for today */
const getLocalToday = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};

/** "YYYY-MM-DD" from a local Date */
const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Entry's local midnight Date */
const entryDay = (entry) => {
  const d = new Date(entry.entryDate || entry.createdAt);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/** Robust exact same day last month (capped to max days in previous month) */
const getLastMonthSameDay = (today) => {
  const targetYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const targetMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
  const daysInPrevMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(today.getDate(), daysInPrevMonth);
  return new Date(targetYear, targetMonth, targetDay);
};

/** Robust exact same day last year (handles Feb 29 leap-years) */
const getLastYearSameDay = (today) => {
  const targetYear = today.getFullYear() - 1;
  const targetMonth = today.getMonth();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(today.getDate(), daysInMonth);
  return new Date(targetYear, targetMonth, targetDay);
};

// ─── component ────────────────────────────────────────────────────────────────

export const OnThisDay = ({ entries = [], loading = false }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lastMonth');

  const today = getLocalToday();

  // Last month — exact date 1 month ago
  const lastMonthDate = getLastMonthSameDay(today);
  const lastMonthKey  = toDateKey(lastMonthDate);

  // Last year — exact date 1 year ago
  const lastYearDate = getLastYearSameDay(today);
  const lastYearKey  = toDateKey(lastYearDate);

  const byDate = (key) =>
    [...entries]
      .filter((e) => toDateKey(entryDay(e)) === key)
      .sort((a, b) => new Date(b.entryDate || b.createdAt) - new Date(a.entryDate || a.createdAt));

  const tabs = [
    {
      id: 'lastMonth',
      label: 'Last Month',
      subtitle: formatDate(`${lastMonthKey}T00:00:00`, 'SHORT'),
      data: byDate(lastMonthKey),
      emptyMsg: 'Nothing written a month ago today.',
      emptyHint: 'Keep writing — future you will thank you.',
    },
    {
      id: 'lastYear',
      label: 'Last Year',
      subtitle: formatDate(`${lastYearKey}T00:00:00`, 'SHORT'),
      data: byDate(lastYearKey),
      emptyMsg: 'Nothing written a year ago today.',
      emptyHint: 'This time last year was still waiting for your words.',
    },
  ];

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow:
          '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 6px 20px -4px rgba(0, 0, 0, 0.3)',
      }}
      className="paper-texture"
    >
      {/* ── Header ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 14px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '9px',
            backgroundColor: 'rgba(223, 178, 100, 0.12)',
            border: '1px solid rgba(223, 178, 100, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Clock size={16} style={{ color: 'var(--gold)' }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '0.94rem',
              fontWeight: 600,
              margin: 0,
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}
          >
            On This Day
          </h3>
          <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
            {active.subtitle}
            {active.data.length > 0 && (
              <span style={{ marginLeft: '4px' }}>
                • {active.data.length} {active.data.length === 1 ? 'memory' : 'memories'}
              </span>
            )}
          </p>
        </div>
      </header>

      {/* ── Tab Switcher ── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          padding: '0 10px',
          gap: '4px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.74rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--gold)' : 'var(--ink-muted)',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease',
                flexShrink: 0,
              }}
            >
              {tab.label}
              {tab.data.length > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    borderRadius: '9999px',
                    backgroundColor: isActive
                      ? 'rgba(223, 178, 100, 0.18)'
                      : 'var(--active-bg)',
                    color: isActive ? 'var(--gold)' : 'var(--ink-muted)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                  }}
                >
                  {tab.data.length}
                </span>
              )}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: '10px',
                    right: '10px',
                    height: '2px',
                    borderRadius: '2px 2px 0 0',
                    backgroundColor: 'var(--gold)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              margin: '0 auto',
              border: '2px solid var(--border)',
              borderTopColor: 'var(--gold)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ margin: '10px 0 0', fontSize: '0.80rem', color: 'var(--ink-muted)' }}>
            Finding memories...
          </p>
        </div>
      ) : active.data.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px 18px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(223, 178, 100, 0.08)',
              border: '1px solid rgba(223, 178, 100, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <Clock size={17} style={{ color: 'var(--gold)', opacity: 0.9 }} />
          </div>
          <p
            style={{
              margin: '0 0 4px',
              fontFamily: 'var(--font-family-heading)',
              fontStyle: 'italic',
              fontSize: '0.97rem',
              lineHeight: 1.4,
              color: 'var(--ink)',
              maxWidth: '220px',
            }}
          >
            {active.emptyMsg}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.76rem',
              color: 'var(--ink-muted)',
              lineHeight: 1.45,
              maxWidth: '210px',
            }}
          >
            {active.emptyHint}
          </p>
        </div>
      ) : (
        <div style={{ padding: '10px' }}>
          {active.data.map((entry, index) => (
            <article
              key={entry._id}
              onClick={() => navigate(`/entries/${entry._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/entries/${entry._id}`);
                }
              }}
              style={{
                padding: '11px 12px',
                backgroundColor:
                  index === 0
                    ? 'color-mix(in srgb, var(--gold) 10%, transparent)'
                    : 'var(--paper-dark)',
                border:
                  index === 0
                    ? '1px solid rgba(223, 178, 100, 0.45)'
                    : '1px solid var(--border)',
                borderRadius: '10px',
                marginBottom: index < active.data.length - 1 ? '8px' : 0,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'block',
                textAlign: 'left',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  index === 0 ? 'rgba(223, 178, 100, 0.45)' : 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'var(--gold)',
                      backgroundColor: 'var(--active-bg)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}
                  >
                    {entry.type}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--ink-muted)',
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(entry.entryDate || entry.createdAt, 'SHORT')}
                  </span>
                </div>

                {/* Open Indicator */}
                <span
                  style={{
                    color: 'var(--gold)',
                    opacity: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Click to open entry"
                >
                  <ArrowUpRight size={14} />
                </span>
              </div>

              {entry.title && (
                <h4
                  style={{
                    fontFamily: 'var(--font-family-heading)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    margin: '0 0 4px',
                    color: 'var(--ink)',
                    lineHeight: 1.3,
                  }}
                >
                  {entry.title}
                </h4>
              )}

              <p
                style={{
                  margin: 0,
                  color: 'var(--ink-muted)',
                  lineHeight: 1.45,
                  fontSize: '0.85rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {entry.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
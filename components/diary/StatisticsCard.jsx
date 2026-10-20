import { useState } from 'react';
import {
  BookOpen, Star, Calendar, Flame, Award, Globe, Lock,
  Feather, Sunrise, Sun, Sunset, Moon, Target, Sparkles,
  TrendingUp, CheckCircle2, Clock
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const statIcons = {
  entries: BookOpen,
  words: Feather,
  avgWords: TrendingUp,
  quotes: Star,
  favorites: Star,
  streak: Flame,
  longestStreak: Award,
  monthEntries: Calendar,
  publicEntries: Globe,
  privateEntries: Lock,
  milestone: Sparkles,
};

// ─── Individual Metric Card ──────────────────────────────────────────────────
export const StatisticsCard = ({
  title,
  value,
  subtitle,
  icon = 'entries',
  highlight = false,
  badge,
  color = 'gold',
  onClick,
}) => {
  const Icon = statIcons[icon] || BookOpen;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--paper)',
        border: highlight
          ? '1px solid rgba(223, 178, 100, 0.45)'
          : '1px solid var(--border)',
        borderRadius: '16px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: highlight
          ? '0 4px 20px -2px rgba(223, 178, 100, 0.18)'
          : '0 2px 10px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="paper-texture fade-in"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(223, 178, 100, 0.45)';
        e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = highlight
          ? 'rgba(223, 178, 100, 0.45)'
          : 'var(--border)';
        e.currentTarget.style.boxShadow = highlight
          ? '0 4px 20px -2px rgba(223, 178, 100, 0.18)'
          : '0 2px 10px rgba(0, 0, 0, 0.08)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--ink-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {title}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: 'clamp(1.75rem, 3.2vw, 2.2rem)',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {value}
            </span>
            {badge && (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--gold)',
                backgroundColor: 'rgba(223, 178, 100, 0.14)',
                padding: '2px 7px',
                borderRadius: '9999px',
                border: '1px solid rgba(223, 178, 100, 0.25)',
              }}>
                {badge}
              </span>
            )}
          </div>
        </div>

        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '11px',
          backgroundColor: color === 'gold' ? 'rgba(223, 178, 100, 0.12)' : 'var(--active-bg)',
          border: '1px solid rgba(223, 178, 100, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold)',
          flexShrink: 0,
        }}>
          <Icon size={20} />
        </div>
      </div>

      {subtitle && (
        <p style={{
          margin: 0,
          fontSize: '0.78rem',
          color: 'var(--ink-muted)',
          lineHeight: 1.4,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

// ─── Responsive Grid of Key Stats ─────────────────────────────────────────────
export const StatisticsGrid = ({ stats = [], loading = false }) => {
  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px',
              height: '110px',
            }}
            className="paper-texture"
          >
            <div style={{
              width: '40%',
              height: '12px',
              backgroundColor: 'var(--border)',
              borderRadius: '4px',
              marginBottom: '14px',
            }} />
            <div style={{
              width: '60%',
              height: '24px',
              backgroundColor: 'var(--border)',
              borderRadius: '4px',
            }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '14px',
    }}>
      {stats.map(({ key, ...stat }) => (
        <StatisticsCard key={key} {...stat} />
      ))}
    </div>
  );
};

// ─── Streak Banner with Habit Momentum ────────────────────────────────────────
export const StreakDisplay = ({ currentStreak = 0, longestStreak = 0, wroteToday = false }) => {
  const isStreakActive = currentStreak > 0;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(223, 178, 100, 0.08) 0%, rgba(223, 178, 100, 0.02) 100%)',
        backgroundColor: 'var(--paper)',
        border: '1px solid rgba(223, 178, 100, 0.28)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '18px',
        boxShadow: '0 4px 18px -4px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="paper-texture"
    >
      {/* Decorative ambient flare */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(223, 178, 100, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: isStreakActive
            ? 'linear-gradient(135deg, rgba(223, 178, 100, 0.28) 0%, rgba(223, 178, 100, 0.1) 100%)'
            : 'var(--active-bg)',
          border: '1px solid rgba(223, 178, 100, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold)',
          flexShrink: 0,
        }}>
          <Flame size={28} style={{ filter: isStreakActive ? 'drop-shadow(0 2px 6px rgba(223, 178, 100, 0.4))' : 'none' }} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-muted)',
            }}>
              Current Streak
            </span>
            {wroteToday ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.66rem',
                fontWeight: 600,
                color: 'var(--success)',
                backgroundColor: 'rgba(92, 138, 69, 0.14)',
                padding: '2px 7px',
                borderRadius: '9999px',
                border: '1px solid rgba(92, 138, 69, 0.25)',
              }}>
                <CheckCircle2 size={10} /> Active today
              </span>
            ) : (
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 600,
                color: 'var(--warning)',
                backgroundColor: 'rgba(191, 142, 46, 0.14)',
                padding: '2px 7px',
                borderRadius: '9999px',
                border: '1px solid rgba(191, 142, 46, 0.25)',
              }}>
                Pencil in today
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
            <span style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '2.4rem',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1,
            }}>
              {currentStreak}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', fontWeight: 500 }}>
              {currentStreak === 1 ? 'consecutive day' : 'consecutive days'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Longest Record & Motivation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        paddingLeft: '18px',
        borderLeft: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        <div style={{ textAlign: 'left' }}>
          <p style={{
            margin: 0,
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--ink-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            All-Time Best
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
            <Award size={16} style={{ color: 'var(--gold)' }} />
            <span style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--ink)',
            }}>
              {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <p style={{
          margin: 0,
          fontSize: '0.82rem',
          color: 'var(--ink-muted)',
          maxWidth: '240px',
          lineHeight: 1.45,
          fontStyle: 'italic',
        }}>
          {isStreakActive
            ? wroteToday
              ? 'Flame burning bright. Your thoughts were captured today.'
              : 'One quiet reflection today keeps your chain alive.'
            : 'Begin a new streak today with a single honest reflection.'}
        </p>
      </div>
    </div>
  );
};

// ─── 30-Day Activity Cadence Strip (Heatmap) ──────────────────────────────────
export const ActivityHeatmap = ({ days = [] }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px 22px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      }}
      className="paper-texture"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.02rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--ink)',
          }}>
            30-Day Writing Cadence
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
            Your recent rhythm of quiet contemplation
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--ink-muted)' }}>
          <span>Less</span>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'var(--paper-dark)', border: '1px solid var(--border)' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'rgba(223, 178, 100, 0.35)' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'var(--gold)' }} />
          <span>More</span>
        </div>
      </div>

      {/* Grid of 30 days */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(26px, 1fr))',
          gap: '6px',
        }}
      >
        {days.map((d) => {
          const count = d.count || 0;
          let bg = 'var(--paper-dark)';
          let border = '1px solid var(--border)';

          if (count === 1) {
            bg = 'rgba(223, 178, 100, 0.35)';
            border = '1px solid rgba(223, 178, 100, 0.4)';
          } else if (count >= 2) {
            bg = 'var(--gold)';
            border = '1px solid var(--gold-dark)';
          }

          return (
            <div
              key={d.date}
              onMouseEnter={() => setHoveredDay(d)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                aspectRatio: '1/1',
                borderRadius: '6px',
                backgroundColor: bg,
                border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.62rem',
                fontWeight: 600,
                color: count >= 2 ? '#fff' : 'var(--ink)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {d.dayNumber}
            </div>
          );
        })}
      </div>

      {/* Hover Info Tooltip Bar */}
      <div style={{
        marginTop: '12px',
        paddingTop: '8px',
        borderTop: '1px solid var(--border)',
        minHeight: '22px',
        fontSize: '0.74rem',
        color: 'var(--ink-muted)',
      }}>
        {hoveredDay ? (
          <span>
            <strong style={{ color: 'var(--ink)' }}>{formatDate(`${hoveredDay.date}T00:00:00`, 'SHORT')}:</strong>{' '}
            {hoveredDay.count === 0
              ? 'No entries recorded'
              : `${hoveredDay.count} ${hoveredDay.count === 1 ? 'entry' : 'entries'} penned`}
          </span>
        ) : (
          <span>Hover over any day to see your entries</span>
        )}
      </div>
    </div>
  );
};

// ─── Writing Rhythm: Time of Day & Day of Week ────────────────────────────────
export const WritingRhythm = ({ timeOfDay = {}, dayOfWeek = {}, peakHourLabel = '', peakDayLabel = '' }) => {
  const timeBuckets = [
    { key: 'morning', label: 'Dawn & Morning', time: '5 AM – 12 PM', icon: Sunrise, count: timeOfDay.morning || 0 },
    { key: 'afternoon', label: 'Afternoon', time: '12 PM – 5 PM', icon: Sun, count: timeOfDay.afternoon || 0 },
    { key: 'evening', label: 'Evening Dusk', time: '5 PM – 9 PM', icon: Sunset, count: timeOfDay.evening || 0 },
    { key: 'night', label: 'Night Owl', time: '9 PM – 5 AM', icon: Moon, count: timeOfDay.night || 0 },
  ];

  const totalTimeEntries = timeBuckets.reduce((acc, t) => acc + t.count, 0) || 1;

  const daysList = [
    { label: 'Sun', count: dayOfWeek.Sun || 0 },
    { label: 'Mon', count: dayOfWeek.Mon || 0 },
    { label: 'Tue', count: dayOfWeek.Tue || 0 },
    { label: 'Wed', count: dayOfWeek.Wed || 0 },
    { label: 'Thu', count: dayOfWeek.Thu || 0 },
    { label: 'Fri', count: dayOfWeek.Fri || 0 },
    { label: 'Sat', count: dayOfWeek.Sat || 0 },
  ];

  const maxDayCount = Math.max(...daysList.map((d) => d.count), 1);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
      gap: '16px',
    }}>
      {/* Left: Time of Day */}
      <div
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        className="paper-texture"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              margin: 0,
              color: 'var(--ink)',
            }}>
              Reflection Hours
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600 }}>
              {peakHourLabel}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {timeBuckets.map((bucket) => {
              const Icon = bucket.icon;
              const pct = Math.round((bucket.count / totalTimeEntries) * 100);

              return (
                <div key={bucket.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink)', fontWeight: 500 }}>
                      <Icon size={14} style={{ color: 'var(--gold)' }} />
                      {bucket.label}
                      <span style={{ fontSize: '0.68rem', color: 'var(--ink-muted)' }}>({bucket.time})</span>
                    </span>
                    <span style={{ color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      <strong>{bucket.count}</strong> ({pct}%)
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--paper-dark)',
                    border: '1px solid var(--border)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: 'var(--gold)',
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{
          margin: '14px 0 0',
          paddingTop: '10px',
          borderTop: '1px solid var(--border)',
          fontSize: '0.72rem',
          color: 'var(--ink-muted)',
          lineHeight: 1.4,
          fontStyle: 'italic',
        }}>
          Based on the timestamps of your writing sessions.
        </p>
      </div>

      {/* Right: Days of Week */}
      <div
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        className="paper-texture"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              margin: 0,
              color: 'var(--ink)',
            }}>
              Weekly Cadence
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600 }}>
              {peakDayLabel}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '8px',
            height: '110px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border)',
          }}>
            {daysList.map((d) => {
              const heightPct = Math.round((d.count / maxDayCount) * 100);
              const isPeak = d.count === maxDayCount && d.count > 0;

              return (
                <div
                  key={d.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 600,
                    color: isPeak ? 'var(--gold)' : 'var(--ink-muted)',
                  }}>
                    {d.count}
                  </span>

                  <div
                    style={{
                      width: '100%',
                      maxWidth: '28px',
                      height: `${Math.max(heightPct, 6)}%`,
                      backgroundColor: isPeak ? 'var(--gold)' : 'rgba(223, 178, 100, 0.25)',
                      borderRadius: '5px 5px 2px 2px',
                      transition: 'height 0.4s ease',
                      border: isPeak ? '1px solid var(--gold-dark)' : '1px solid transparent',
                    }}
                  />

                  <span style={{
                    fontSize: '0.70rem',
                    fontWeight: isPeak ? 700 : 500,
                    color: isPeak ? 'var(--ink)' : 'var(--ink-muted)',
                    marginTop: '2px',
                  }}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p style={{
          margin: '14px 0 0',
          fontSize: '0.72rem',
          color: 'var(--ink-muted)',
          lineHeight: 1.4,
          fontStyle: 'italic',
        }}>
          Which days invite your deepest contemplation.
        </p>
      </div>
    </div>
  );
};

// ─── Category Distribution ───────────────────────────────────────────────────
export const CategoryBreakdown = ({ categories = [], totalEntries = 0 }) => (
  <div
    style={{
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    }}
    className="paper-texture"
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div>
        <h3 style={{
          fontFamily: 'var(--font-family-heading)',
          fontSize: '1.02rem',
          fontWeight: 600,
          margin: 0,
          color: 'var(--ink)',
        }}>
          Expression Spectrum
        </h3>
        <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
          Distribution across categories and writing styles
        </p>
      </div>
      <span style={{
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--gold)',
        backgroundColor: 'rgba(223, 178, 100, 0.12)',
        padding: '3px 8px',
        borderRadius: '9999px',
      }}>
        {categories.length} Types
      </span>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {categories.map((cat) => {
        const pct = cat.percentage || (totalEntries ? ((cat.count / totalEntries) * 100).toFixed(1) : 0);

        return (
          <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--ink)' }}>
                {cat.name}
              </span>
              <span style={{ color: 'var(--ink-muted)', fontVariantNumeric: 'tabular-nums', fontSize: '0.76rem' }}>
                <strong>{cat.count}</strong> ({pct}%)
              </span>
            </div>

            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--paper-dark)',
              border: '1px solid var(--border)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: 'var(--gold)',
                borderRadius: '9999px',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Milestones Progress Bar ──────────────────────────────────────────────────
export const MilestoneTracker = ({ totalEntries = 0, totalWords = 0, streak = 0 }) => {
  // Entry targets: 10, 50, 100, 250, 500, 1000
  const entryMilestones = [10, 50, 100, 250, 500, 1000];
  const nextEntryTarget = entryMilestones.find((m) => m > totalEntries) || 1000;
  const prevEntryTarget = [...entryMilestones].reverse().find((m) => m <= totalEntries) || 0;
  const entryProgress = Math.min(
    100,
    Math.round(((totalEntries - prevEntryTarget) / (nextEntryTarget - prevEntryTarget)) * 100)
  );

  // Word targets: 1000, 5000, 10000, 25000, 50000, 100000
  const wordMilestones = [1000, 5000, 10000, 25000, 50000, 100000];
  const nextWordTarget = wordMilestones.find((m) => m > totalWords) || 100000;
  const prevWordTarget = [...wordMilestones].reverse().find((m) => m <= totalWords) || 0;
  const wordProgress = Math.min(
    100,
    Math.round(((totalWords - prevWordTarget) / (nextWordTarget - prevWordTarget)) * 100)
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      }}
      className="paper-texture"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.02rem',
            fontWeight: 600,
            margin: 0,
            color: 'var(--ink)',
          }}>
            Writer&apos;s Milestones
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
            Steps on your authorial journey
          </p>
        </div>
        <Sparkles size={18} style={{ color: 'var(--gold)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Entry Milestone */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>
              Next Goal: {nextEntryTarget} Entries
            </span>
            <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
              {totalEntries} / {nextEntryTarget} ({entryProgress}%)
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '7px',
            backgroundColor: 'var(--paper-dark)',
            border: '1px solid var(--border)',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${entryProgress}%`,
              height: '100%',
              backgroundColor: 'var(--gold)',
              borderRadius: '9999px',
            }} />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.70rem', color: 'var(--ink-muted)' }}>
            {nextEntryTarget - totalEntries} more {nextEntryTarget - totalEntries === 1 ? 'entry' : 'entries'} to unlock this badge.
          </p>
        </div>

        {/* Word Count Milestone */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>
              Next Goal: {nextWordTarget.toLocaleString()} Words
            </span>
            <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
              {totalWords.toLocaleString()} / {nextWordTarget.toLocaleString()} ({wordProgress}%)
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '7px',
            backgroundColor: 'var(--paper-dark)',
            border: '1px solid var(--border)',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${wordProgress}%`,
              height: '100%',
              backgroundColor: 'var(--brown)',
              borderRadius: '9999px',
            }} />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.70rem', color: 'var(--ink-muted)' }}>
            {(nextWordTarget - totalWords).toLocaleString()} more words to reach your next writing tier.
          </p>
        </div>
      </div>
    </div>
  );
};
import { Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { FileText, ArrowRight, Feather, TrendingUp } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useEntries } from '../hooks/useEntries';
import { useDateFilter } from '../context/DateFilterContext';
import { WriteCard } from '../components/diary/WriteCard';
import { DashboardEntryCard } from '../components/diary/DashboardEntryCard';
import { LoadingState } from '../components/ui/LoadingState';
import { getGreeting, getLocalDateString } from '../utils/helpers';

const OrnamentDivider = () => (
  <span
    aria-hidden="true"
    className="ornament-divider"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      color: 'var(--gold)',
      opacity: 0.85,
    }}
  >
    <span style={{ height: '1px', width: '18px', background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
    <span style={{ width: '5px', height: '5px', transform: 'rotate(45deg)', background: 'var(--gold)', borderRadius: '1px' }} />
    <span style={{ height: '1px', width: '18px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
  </span>
);

export const Dashboard = () => {
  const { name } = useSession();
  const { date } = useDateFilter();
  const { entries, loading, refresh, setFilters } = useEntries({ limit: 5, sort: 'newest', date });

  useEffect(() => {
    setFilters({ date });
  }, [date, setFilters]);

  const displayName = name || 'Anonymous Writer';

  const stats = useMemo(() => {
    const today = getLocalDateString();
    const todayEntries = entries.filter(e => (e.entryDate || '').slice(0, 10) === today);
    const words = entries.reduce((acc, e) => acc + (e.content ? e.content.trim().split(/\s+/).filter(Boolean).length : 0), 0);
    return { todayCount: todayEntries.length, words };
  }, [entries]);

  return (
    <div
      className="dash-root"
      style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'fadeIn 0.4s var(--ease-out)' }}
    >
      {/* ── Compact welcome banner ── */}
      <header className="dash-welcome" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Left: greeting pill + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '1 1 auto' }}>
          {/* Feather avatar */}
          <div
            className="dash-avatar"
            style={{
              width: '38px', height: '38px', flexShrink: 0,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--gold-muted) 0%, var(--gold) 60%, var(--gold-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(122,92,52,0.22)',
            }}
          >
            <Feather size={17} style={{ color: 'var(--paper)' }} />
          </div>

          {/* Name + greeting */}
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--gold)',
              marginBottom: '1px',
            }}>
              {getGreeting()}
            </div>
            <h1
              className="dash-greeting"
              style={{
                fontFamily: 'var(--font-family-heading)',
                fontSize: 'clamp(1.25rem, 2.2vw, 1.6rem)',
                fontWeight: 600,
                color: 'var(--ink)',
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </h1>
          </div>
        </div>

        {/* Right: stat chips */}
        <div className="dash-stat-chips" style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          {[
            { Icon: FileText, value: stats.todayCount, label: 'today' },
            { Icon: TrendingUp, value: stats.words,    label: 'words' },
          ].map(({ Icon, value, label }) => (
            <div
              key={label}
              className="dash-stat-chip"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                fontSize: '0.78rem', color: 'var(--ink-muted)',
                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Icon size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ── Write card ── */}
      <WriteCard onSaved={refresh} />

      {/* ── Recent entries ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <header className="dash-recent-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '2px' }}>
          <h2 style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.12rem', fontWeight: 600,
            color: 'var(--ink)', margin: 0,
          }}>
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '8px',
              backgroundColor: 'var(--active-bg)',
            }}>
              <FileText size={15} style={{ color: 'var(--gold)' }} />
            </span>
            Recent Entries
            <OrnamentDivider />
          </h2>
          <Link
            to="/entries"
            className="view-all-link"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '0.82rem', fontWeight: 500, color: 'var(--gold)',
              textDecoration: 'none', padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--active-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            View All
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </header>

        {loading && entries.length === 0 ? (
          <LoadingState message="Finding your recent thoughts..." centered={false} />
        ) : entries.length === 0 ? (
          <div
            className="paper-texture"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: 'var(--paper)', border: '1px solid var(--border)',
              borderRadius: '12px', position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: 'var(--active-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <Feather size={22} style={{ color: 'var(--gold)' }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-family-heading)', fontStyle: 'italic',
              fontSize: '1.05rem', color: 'var(--ink)', margin: '0 0 6px',
            }}>
              Your pages are still waiting for their first story.
            </p>
            <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--ink-muted)', maxWidth: '300px', lineHeight: 1.5 }}>
              Start writing to fill these pages with your thoughts, memories, and reflections.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {entries.map((entry, index) => (
              <div
                key={entry._id}
                style={{
                  animation: `dashCardIn 0.35s var(--ease-out) ${index * 0.06}s both`,
                  position: 'relative',
                }}
              >
                <DashboardEntryCard
                  entry={entry}
                  onDelete={() => refresh()}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

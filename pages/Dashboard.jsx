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
      {/* ── Editorial welcome banner ── */}
      <header
        className="dash-welcome"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          padding: '6px 2px 2px',
        }}
      >
        <div className="dash-welcome-user" style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div
            className="dash-avatar"
            style={{
              width: '42px',
              height: '42px',
              flexShrink: 0,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(223, 178, 100, 0.22) 0%, rgba(223, 178, 100, 0.06) 100%)',
              border: '1px solid rgba(223, 178, 100, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Feather size={19} style={{ color: 'var(--gold)' }} />
          </div>

          <div className="dash-greeting-wrap" style={{ minWidth: 0 }}>
            <div
              className="dash-greeting-time"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '2px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--gold)' }} />
              {getGreeting()}
            </div>
            <h1
              className="dash-greeting"
              style={{
                fontFamily: 'var(--font-family-heading)',
                fontSize: 'clamp(1.35rem, 2.4vw, 1.8rem)',
                fontWeight: 600,
                color: 'var(--ink)',
                margin: 0,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              {displayName}
            </h1>
          </div>
        </div>

        {/* Right: stat chips */}
        <div className="dash-stat-chips" style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { Icon: FileText, value: stats.todayCount, label: stats.todayCount === 1 ? 'entry today' : 'entries today' },
            { Icon: TrendingUp, value: stats.words.toLocaleString(), label: 'total words' },
          ].map(({ Icon, value, label }) => (
            <div
              key={label}
              className="dash-stat-chip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                fontSize: '0.8rem',
                color: 'var(--ink-muted)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(223, 178, 100, 0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
              }}
            >
              <Icon size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
              <span style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>{label}</span>
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
              <DashboardEntryCard
                key={entry._id}
                entry={entry}
                index={index}
                onDelete={() => refresh()}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

import { Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { FileText, ArrowRight, Feather, Sparkles, TrendingUp } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useEntries } from '../hooks/useEntries';
import { useDateFilter } from '../context/DateFilterContext';
import { WriteCard } from '../components/diary/WriteCard';
import { DashboardEntryCard } from '../components/diary/DashboardEntryCard';
import { LoadingState } from '../components/ui/LoadingState';
import { getGreeting, getLocalDateString } from '../utils/helpers';

const GoldRule = () => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      height: '1px',
      width: '56px',
      background: 'linear-gradient(90deg, var(--gold), transparent)',
      borderRadius: '1px',
      marginTop: '10px',
    }}
  />
);

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

const StatChip = ({ icon: Icon, label, value }) => (
  <div
    className="dash-stat-chip"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '7px 14px',
      borderRadius: 'var(--radius-full)',
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--border)',
      fontSize: '0.8rem',
      color: 'var(--ink-muted)',
      transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--gold)';
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <Icon size={13} style={{ color: 'var(--gold)' }} />
    <span style={{ fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    <span style={{ letterSpacing: '0.02em' }}>{label}</span>
  </div>
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
      style={{ display: 'flex', flexDirection: 'column', gap: '22px', height: '100%', animation: 'fadeIn 0.4s var(--ease-out)' }}
    >
      {/* Welcome header */}
      <header
        className="dash-welcome"
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}
      >
        <div className="dash-welcome-main" style={{ maxWidth: '560px', minWidth: 0 }}>
          <div className="dash-greeting-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginBottom: '8px', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(185,146,74,0.1)', border: '1px solid rgba(185,146,74,0.25)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            <Feather size={12} />
            {getGreeting()}
          </div>
          <h1
            className="dash-greeting"
            style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: 'clamp(1.9rem, 3vw, 2.35rem)',
              fontWeight: 500,
              color: 'var(--ink)',
              margin: '0 0 6px',
              lineHeight: 1.18,
              letterSpacing: '-0.015em',
            }}
          >
            {displayName}
          </h1>
          <GoldRule />
          <p className="dash-subtitle" style={{ margin: '10px 0 0', fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.5, maxWidth: '440px' }}>
            A new day, a new page. What's on your mind today?
          </p>

          <div className="dash-stat-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
            <StatChip icon={FileText} label="today" value={stats.todayCount} />
            <StatChip icon={TrendingUp} label="words" value={stats.words} />
          </div>
        </div>

        <div className="dash-quote" style={{ textAlign: 'right', paddingBottom: '4px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-26px', right: '0', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', opacity: 0.7 }}>
            <Sparkles size={13} />
            <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Daily reflection</span>
          </div>
          <p style={{
            margin: '0',
            fontFamily: 'var(--font-family-heading)',
            fontStyle: 'italic',
            fontSize: '0.95rem',
            lineHeight: 1.45,
            color: 'var(--ink)',
            maxWidth: '260px',
          }}>
            A small step today
            <br />
            can lead to a big change tomorrow.
          </p>
          <div style={{
            height: '1px',
            width: '72px',
            background: 'linear-gradient(90deg, var(--gold), transparent)',
            marginTop: '12px',
            marginLeft: 'auto',
          }} />
        </div>
      </header>

      {/* Primary write card */}
      <WriteCard onSaved={refresh} />

      {/* Recent entries */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <header className="dash-recent-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '4px' }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.18rem',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: 0,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--active-bg)' }}>
              <FileText size={16} style={{ color: 'var(--gold)' }} />
            </span>
            Recent Entries
            <OrnamentDivider />
          </h2>
          <Link
            to="/entries"
            className="view-all-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              fontWeight: 500,
              color: 'var(--gold)',
              textDecoration: 'none',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              transition: 'background-color 0.2s ease, color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--active-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            View All
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </header>

        {loading && entries.length === 0 ? (
          <LoadingState message="Finding your recent thoughts..." centered={false} />
        ) : entries.length === 0 ? (
          <div
            className="paper-texture"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '44px 20px',
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--active-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Feather size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <p style={{
              fontFamily: 'var(--font-family-heading)',
              fontStyle: 'italic',
              fontSize: '1.08rem',
              color: 'var(--ink)',
              margin: '0 0 6px',
            }}>
              Your pages are still waiting for their first story.
            </p>
            <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--ink-muted)', maxWidth: '320px', lineHeight: 1.5 }}>
              Start writing to fill these pages with your thoughts, memories, and reflections.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {entries.map((entry, index) => (
              <div key={entry._id} style={{ animation: `fadeIn 0.35s var(--ease-out) ${index * 0.06}s both` }}>
                <DashboardEntryCard
                  key={entry._id}
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

import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useEntries } from '../hooks/useEntries';
import { useDateFilter } from '../context/DateFilterContext';
import { WriteCard } from '../components/diary/WriteCard';
import { DashboardEntryCard } from '../components/diary/DashboardEntryCard';
import { LoadingState } from '../components/ui/LoadingState';
import { getGreeting } from '../utils/helpers';

export const Dashboard = () => {
  const { name } = useSession();
  const { date } = useDateFilter();
  const { entries, loading, refresh, setFilters } = useEntries({ limit: 5, sort: 'newest', date });

  useEffect(() => {
    setFilters({ date });
  }, [date, setFilters]);

  const displayName = name || 'Anonymous Writer';

  return (
    <div className="dash-root" style={{ display: 'flex', flexDirection: 'column', gap: '22px', height: '100%' }}>
      {/* Welcome header */}
      <header className="dash-welcome" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        <div className="dash-welcome-main" style={{ maxWidth: '520px', minWidth: 0 }}>
          <h1 className="dash-greeting" style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'clamp(1.9rem, 3vw, 2.25rem)',
            fontWeight: 500,
            color: 'var(--ink)',
            margin: '0 0 4px',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            {getGreeting()}, {displayName}
          </h1>
          <p className="dash-subtitle" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            A new day, a new page. What's on your mind today?
          </p>
        </div>

        <div className="dash-quote" style={{ textAlign: 'right', paddingBottom: '4px' }}>
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-family-heading)',
            fontStyle: 'italic',
            fontSize: '0.92rem',
            lineHeight: 1.5,
            color: 'var(--ink)',
            maxWidth: '240px',
          }}>
            A small step today
            <br />
            can lead to a big change tomorrow.
          </p>
          <div style={{
            height: '1px',
            width: '60px',
            background: 'linear-gradient(90deg, var(--gold), transparent)',
            marginTop: '8px',
            marginLeft: 'auto',
          }} />
        </div>
      </header>

      {/* Primary write card */}
      <WriteCard onSaved={refresh} />

      {/* Recent entries */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.15rem',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: 0,
          }}>
            <FileText size={18} style={{ color: 'var(--gold)' }} />
            Recent Entries
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
            }}
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
              padding: '32px 20px',
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-family-heading)',
              fontStyle: 'italic',
              fontSize: '1.05rem',
              color: 'var(--ink)',
              margin: '0 0 6px',
            }}>
              Your pages are still waiting for their first story.
            </p>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
              Start writing to fill these pages with your thoughts, memories, and reflections.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {entries.map(entry => (
              <DashboardEntryCard
                key={entry._id}
                entry={entry}
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
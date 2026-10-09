import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { ENTRY_TYPES } from '../constants';
import { usePublicCategories } from '../hooks/usePublicEntries';
import { LoadingState } from '../components/ui/LoadingState';

export const PublicCategories = () => {
  const { categories, loading } = usePublicCategories();

  const byType = Object.fromEntries(categories.map(c => [c.type, c.count]));
  const ordered = ENTRY_TYPES.filter(t => byType[t.value] > 0).map(t => ({ ...t, count: byType[t.value] }));
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="visitor-categories" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <header>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-family-heading)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px' }}>
          <Tag size={22} style={{ color: 'var(--gold)' }} />
          Browse by category
        </h1>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          Public entries, grouped by the kind of words they hold. {total > 0 && `${total} shared in total.`}
        </p>
      </header>

      {loading && categories.length === 0 ? (
        <LoadingState message="Counting the quiet words..." centered={false} />
      ) : ordered.length === 0 ? (
        <div className="paper-texture" style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '10px' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--ink)' }}>
            No public entries yet.
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
            Categories fill up as writers choose to share their words.
          </p>
        </div>
      ) : (
        <div className="public-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {ordered.map(cat => (
            <Link
              key={cat.value}
              to={`/explore?type=${cat.value}`}
              className="paper-texture"
              style={{
                display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px 22px', textDecoration: 'none',
                backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  {cat.label}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--ink-light)' }}>
                  {cat.count} {cat.count === 1 ? 'entry' : 'entries'}
                </span>
              </span>
              <span style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.08rem', color: 'var(--ink)' }}>
                Explore {cat.label.toLowerCase()} →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicCategories;
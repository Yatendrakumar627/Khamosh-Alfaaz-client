import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Search, Tag } from 'lucide-react';
import { ENTRY_TYPES } from '../constants';
import { usePublicEntries } from '../hooks/usePublicEntries';
import { PublicEntryCard } from '../components/visitor/PublicEntryCard';
import { LoadingState } from '../components/ui/LoadingState';
import { debounce } from '../utils/helpers';

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialType = searchParams.get('type') || '';

  const [localSearch, setLocalSearch] = useState(initialSearch);
  const { entries, loading, pagination, params, setFilters, setPage, fetchEntries } = usePublicEntries({
    limit: 12,
    sort: 'newest',
    search: initialSearch || undefined,
    type: initialType || undefined,
  });

  useEffect(() => {
    const q = searchParams.get('search') || undefined;
    const type = searchParams.get('type') || undefined;
    setLocalSearch(q || '');
    setFilters({ search: q, type });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearchChange = debounce((value) => {
    const next = value.trim() || undefined;
    const query = new URLSearchParams(searchParams);
    if (next) query.set('search', next); else query.delete('search');
    query.delete('page');
    setSearchParams(query, { replace: true });
  }, 350);

  const handleType = (value) => {
    const query = new URLSearchParams(searchParams);
    if (value && value !== params.type) {
      query.set('type', value);
    } else if (value === params.type) {
      query.delete('type');
    }
    query.delete('page');
    setSearchParams(query, { replace: true });
  };

  const loadMore = () => {
    fetchEntries({ ...params, page: pagination.page + 1, _t: Date.now() }, true);
    setPage(pagination.page + 1);
  };

  return (
    <div className="visitor-explore" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <header>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-family-heading)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px' }}>
          <Compass size={22} style={{ color: 'var(--gold)' }} />
          Explore the public diary
        </h1>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
          Quiet thoughts, anonymous strangers. Every entry here was shared openly by its writer.
        </p>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="visitor-search" style={{ position: 'relative', maxWidth: '640px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)', pointerEvents: 'none' }} />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => { setLocalSearch(e.target.value); handleSearchChange(e.target.value); }}
          placeholder="Search words, feelings, or tags..."
          aria-label="Search public entries"
          style={{
            width: '100%', height: '48px', padding: '0 16px 0 44px',
            backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '10px',
            color: 'var(--ink)', fontSize: '0.92rem', fontFamily: 'var(--font-family-body)', outline: 'none',
          }}
        />
      </form>

      <div className="public-type-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          onClick={() => handleType('')}
          style={{
            padding: '7px 14px', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer',
            backgroundColor: !params.type ? 'rgba(216,168,91,0.16)' : 'var(--input-bg)',
            color: !params.type ? 'var(--gold)' : 'var(--ink-muted)',
            fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font-family-body)',
          }}
        >
          All
        </button>
        {ENTRY_TYPES.map(t => {
          const active = params.type === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => handleType(t.value)}
              style={{
                padding: '7px 14px', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer',
                backgroundColor: active ? 'rgba(216,168,91,0.16)' : 'var(--input-bg)',
                color: active ? 'var(--gold)' : 'var(--ink-muted)',
                fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font-family-body)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && entries.length === 0 ? (
        <LoadingState message="Searching the quiet pages..." centered={false} />
      ) : entries.length === 0 ? (
        <div className="paper-texture" style={{ padding: '34px 20px', textAlign: 'center', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '10px' }}>
          <Tag size={22} style={{ color: 'var(--ink-light)', marginBottom: '8px' }} />
          <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--ink)' }}>
            Nothing found — yet.
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
            Try a different word, or come back another day.
          </p>
        </div>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ink-light)' }}>
            {pagination.total} public {pagination.total === 1 ? 'entry' : 'entries'}
          </p>
          <div className="public-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {entries.map(entry => (
              <PublicEntryCard key={entry._id} entry={entry} />
            ))}
          </div>
          {pagination.page < pagination.totalPages && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                style={{
                  padding: '11px 26px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  backgroundColor: 'var(--gold)', color: 'var(--paper-dark)', fontWeight: 600, fontSize: '0.9rem',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Loading...' : 'Read more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Explore;
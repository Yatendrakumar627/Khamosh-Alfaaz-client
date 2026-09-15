import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Search, ArrowRight } from 'lucide-react';
import { usePublicEntries } from '../hooks/usePublicEntries';
import { PublicEntryCard } from '../components/visitor/PublicEntryCard';
import { LoadingState } from '../components/ui/LoadingState';

export const VisitorHome = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const { entries, loading } = usePublicEntries({ limit: 6, sort: 'newest' });

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      navigate(`/explore?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="visitor-home" style={{ display: 'flex', flexDirection: 'column', gap: '34px' }}>
      <section className="visitor-hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 0 6px' }}>
        <div className="welcome-emblem" style={{
          width: '80px', height: '80px', borderRadius: '50%',
          border: '2px solid var(--gold)', backgroundColor: 'var(--paper)',
          color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 22px', boxShadow: 'inset 0 1px 1px rgba(255, 251, 240, 0.6), 0 2px 10px var(--shadow-sm)',
        }}>
          <Feather size={34} style={{ color: 'var(--gold)' }} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-family-heading)', fontWeight: 600, color: 'var(--ink)',
          fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', margin: '0 0 10px', letterSpacing: '-0.01em',
        }}>
          Khamosh Alfaaz
        </h1>

        <div className="gold-rule" style={{ margin: '0 auto 20px', maxWidth: '200px' }}>
          <span className="diamond" />
        </div>

        <p style={{
          fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
          color: 'var(--ink-muted)', margin: '0 0 14px',
        }}>
          Jo keh nahi paaye, likh do.
        </p>

        <p style={{ margin: '0 auto', fontSize: '0.98rem', color: 'var(--ink-muted)', lineHeight: 1.8, maxWidth: '560px' }}>
          This is a quiet corner of the internet where words that were never spoken
          are finally written down. Strangers leave their thoughts — openly and honestly —
          and you can read them, share nothing of yourself, and leave whenever you like.
        </p>
      </section>

      <form onSubmit={handleSearch} className="visitor-search" style={{ maxWidth: '560px', width: '100%', margin: '0 auto', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)', pointerEvents: 'none' }} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search the public diary — a word, a feeling, a memory..."
          aria-label="Search public entries"
          style={{
            width: '100%', height: '50px', padding: '0 92px 0 46px',
            backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px',
            color: 'var(--ink)', fontSize: '0.95rem', fontFamily: 'var(--font-family-body)', outline: 'none',
            boxShadow: '0 2px 14px var(--shadow-sm)',
          }}
        />
        <button
          type="submit"
          style={{
            position: 'absolute', right: '6px', top: '6px', bottom: '6px',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '0 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            backgroundColor: 'var(--gold)', color: 'var(--paper-dark)', fontWeight: 600, fontSize: '0.85rem',
          }}
        >
          Explore
          <ArrowRight size={15} />
        </button>
      </form>

      <section className="visitor-latest" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
            <Feather size={18} style={{ color: 'var(--gold)' }} />
            From the quiet pages
          </h2>
          <Link to="/explore" className="view-all-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 500, color: 'var(--gold)', textDecoration: 'none' }}>
            Explore all
            <ArrowRight size={15} />
          </Link>
        </header>

        {loading && entries.length === 0 ? (
          <LoadingState message="Opening the quiet pages..." centered={false} />
        ) : entries.length === 0 ? (
          <div className="paper-texture" style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '10px' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--ink)' }}>
              No one has left a public word yet.
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
              Words only appear here when a writer chooses to share them.
            </p>
          </div>
        ) : (
          <div className="public-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {entries.map(entry => (
              <PublicEntryCard key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </section>

      <section className="visitor-cta-banner" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px',
        padding: '36px 24px', borderRadius: '14px',
        backgroundColor: 'var(--paper)', border: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--sidebar-footer-veil), radial-gradient(ellipse at 50% 0%, var(--gold-muted) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--ink)' }}>
            Maybe there is a story inside you
            <br />
            that has been waiting to be written.
          </p>
          <Link
            to="/login"
            className="visitor-cta"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '18px',
              padding: '13px 30px', borderRadius: '10px', textDecoration: 'none',
              backgroundColor: 'var(--gold)', color: 'var(--paper-dark)', fontWeight: 600, fontSize: '1rem',
              boxShadow: '0 4px 18px rgba(216,168,91,0.35)',
            }}
          >
            Start Writing →
          </Link>
          <p style={{ margin: '12px 0 0', fontSize: '0.78rem', color: 'var(--ink-light)' }}>
            Free · anonymous · protected by a private username and PIN
          </p>
        </div>
      </section>
    </div>
  );
};

export default VisitorHome;
import { Quote as QuoteIcon } from 'lucide-react';
import { QUOTES } from '../constants';
import { usePublicQuotes } from '../hooks/usePublicEntries';
import { PublicEntryCard } from '../components/visitor/PublicEntryCard';
import { LoadingState } from '../components/ui/LoadingState';
import { useSEO } from '../utils/useSEO';

const DISPLAY_QUOTES = QUOTES.slice(0, 6);

export const PublicQuotes = () => {
  useSEO({
    title: 'Public Quotes & Whispers — Khamosh Alfaaz',
    description: 'Read words worth keeping — reflections, thoughts, and quiet quotes shared openly by anonymous writers.',
    canonicalUrl: 'https://khamosh-alfaaz-client.vercel.app/explore/quotes',
  });
  const { quotes, loading } = usePublicQuotes(30);

  return (
    <div className="visitor-quotes" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-family-heading)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px' }}>
          <QuoteIcon size={22} style={{ color: 'var(--gold)' }} />
          Words worth keeping
        </h1>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          A little light for a quiet day — along with quotes shared openly by other writers.
        </p>
      </header>

      <section className="visitor-quote-grid" style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {DISPLAY_QUOTES.map(q => (
          <blockquote
            key={q.id}
            className="paper-texture"
            style={{
              margin: 0, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '12px',
              backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px',
              position: 'relative',
            }}
          >
            <QuoteIcon size={18} style={{ color: 'var(--gold)', opacity: 0.7 }} />
            <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.5, color: 'var(--ink)' }}>
              {q.text}
            </p>
            <footer style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ height: '1px', width: '30px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
              <cite style={{ fontStyle: 'normal', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                — {q.author}, "Khamosh Alfaaz"
              </cite>
            </footer>
          </blockquote>
        ))}
      </section>

      <section className="visitor-latest" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <header>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-family-heading)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
            <QuoteIcon size={17} style={{ color: 'var(--gold)' }} />
            Shared by writers
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
            Quote-type entries other writers chose to publish openly.
          </p>
        </header>

        {loading && quotes.length === 0 ? (
          <LoadingState message="Gathering shared words..." centered={false} />
        ) : quotes.length === 0 ? (
          <div className="paper-texture" style={{ padding: '28px 20px', textAlign: 'center', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '10px' }}>
            <p style={{ margin: 0, fontStyle: 'italic', fontFamily: 'var(--font-family-heading)', fontSize: '1.05rem', color: 'var(--ink)' }}>
              No shared quotes yet.
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
              When writers share quote entries, they will appear here.
            </p>
          </div>
        ) : (
          <div className="public-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {quotes.map(entry => (
              <PublicEntryCard key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PublicQuotes;
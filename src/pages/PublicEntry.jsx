import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Feather } from 'lucide-react';
import { usePublicEntry } from '../hooks/usePublicEntries';
import { LoadingState } from '../components/ui/LoadingState';
import { formatDate, getEntryTypeLabel } from '../utils/helpers';

const toParagraphs = (content) =>
  String(content || '').split(/\r?\n+/).map((p) => p.trim()).filter(Boolean);

export const PublicEntry = () => {
  const { id } = useParams();
  const { entry, loading, error } = usePublicEntry(id);

  if (loading && !entry) {
    return <LoadingState message="Opening this page..." centered={false} />;
  }

  if (error || !entry) {
    return (
      <div className="paper-texture" style={{ padding: '34px 22px', textAlign: 'center', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '10px' }}>
        <p style={{ margin: '0 0 10px', fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--ink)' }}>
          This page has gone quiet.
        </p>
        <p style={{ margin: '0 0 18px', fontSize: '0.86rem', color: 'var(--ink-muted)' }}>
          It may have been removed, or it was never public.
        </p>
        <Link to="/explore" style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none' }}>
          ← Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', fontWeight: 500, fontSize: '0.86rem', textDecoration: 'none', marginBottom: '18px' }}>
        <ArrowLeft size={15} />
        Back to Explore
      </Link>

      <article className="paper-texture" style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '14px', padding: '34px 30px' }}>
        <header style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              <Feather size={13} />
              {getEntryTypeLabel(entry.type)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              {formatDate(entry.entryDate, 'DISPLAY')}
            </span>
          </div>

          {entry.title && (
            <h1 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>
              {entry.title}
            </h1>
          )}
        </header>

        <div className="public-entry-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {toParagraphs(entry.content).map((paragraph, i) => (
            <p
              key={i}
              style={{
                margin: 0, fontSize: '1rem', lineHeight: 1.55, color: 'var(--ink)',
                fontStyle: entry.type === 'quote' ? 'italic' : 'normal',
                fontFamily: entry.type === 'quote' ? 'var(--font-family-heading)' : 'var(--font-family-body)',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {entry.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '26px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
            {entry.tags.map(tag => (
              <span key={tag} style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--ink-muted)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '0.98rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            A stranger left these words here. When you are ready,
            <br />
            you can begin your own quiet page.
          </p>
          <Link to="/login" className="visitor-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '9px', textDecoration: 'none', backgroundColor: 'var(--gold)', color: 'var(--paper-dark)', fontWeight: 600, fontSize: '0.9rem' }}>
            Start Writing →
          </Link>
        </div>
      </article>
    </div>
  );
};

export default PublicEntry;
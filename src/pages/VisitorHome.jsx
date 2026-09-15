import { Link } from 'react-router-dom';
import { BookOpen, Eye, Feather, LockKeyhole, ArrowRight } from 'lucide-react';
import favicon from '../assets/favicon.png';
import { usePublicEntries } from '../hooks/usePublicEntries';
import { PublicEntryCard } from '../components/visitor/PublicEntryCard';
import { LoadingState } from '../components/ui/LoadingState';

const VALUES = [
  {
    icon: Eye,
    title: 'Read, freely',
    text: 'Wander the public pages without an account — just sit down and read.',
  },
  {
    icon: LockKeyhole,
    title: 'Stay private',
    text: 'Your own diary is guarded only by a private username and a numeric PIN.',
  },
  {
    icon: Feather,
    title: 'Write in silence',
    text: 'The words you never said finally find a quiet page to rest on.',
  },
];

export const VisitorHome = () => {
  const { entries, loading } = usePublicEntries({ limit: 6, sort: 'newest' });

  return (
    <div className="visitor-home" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ============ HERO — a diary page ============ */}
      <section
        className="paper-texture diary-page visitor-hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px',
          padding: '52px 28px 44px',
          borderRadius: '18px',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse at 50% -10%, var(--gold-muted) 0%, transparent 55%), linear-gradient(180deg, color-mix(in srgb, var(--paper) 96%, var(--gold)) 0%, var(--paper) 100%)',
            opacity: 0.35,
          }}
        />

        <img
          src={favicon}
          alt="Khamosh Alfaaz emblem"
          style={{ position: 'relative', width: 48, height: 48, borderRadius: 8, flexShrink: 0 }}
        />

        <h1 style={{
          position: 'relative',
          fontFamily: 'var(--font-family-heading)',
          fontWeight: 600,
          color: 'var(--ink)',
          fontSize: 'clamp(2.4rem, 6vw, 3.4rem)',
          margin: '4px 0 0',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
        }}>
          Khamosh Alfaaz
        </h1>

        <div className="gold-rule" style={{ position: 'relative', margin: '4px auto 6px', maxWidth: '220px' }}>
          <span className="diamond" />
        </div>

        <p style={{
          position: 'relative',
          fontFamily: 'var(--font-family-heading)',
          fontStyle: 'italic',
          fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)',
          color: 'var(--ink-muted)',
          margin: 0,
        }}>
          Jo keh nahi paaye, likh do.
        </p>

        <p style={{
          position: 'relative',
          margin: '0 auto',
          fontSize: '0.98rem',
          color: 'var(--ink-muted)',
          lineHeight: 1.85,
          maxWidth: '620px',
        }}>
          This is a quiet corner of the internet where words that were never spoken
          are finally written down. Strangers leave their thoughts — openly and honestly —
          and you can read them, share nothing of yourself, and leave whenever you like.
        </p>
      </section>

      {/* ============ VALUE CARDS — fill the width ============ */}
      <div
        className="visitor-values"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '16px',
          alignItems: 'stretch',
        }}
      >
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="paper-texture"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '24px 22px',
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              boxShadow: '0 2px 12px var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(216,168,91,0.14)',
                border: '1px solid color-mix(in srgb, var(--gold) 30%, var(--border))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
                flexShrink: 0,
              }}
            >
              <Icon size={21} />
            </div>
            <h3 style={{
              margin: 0,
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--ink)',
            }}>
              {title}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* ============ LATEST ENTRIES ============ */}
      <section className="visitor-latest" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(216,168,91,0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
                flexShrink: 0,
              }}
            >
              <BookOpen size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--ink)' }}>
                From the quiet pages
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--ink-light)' }}>
                The most recent words strangers chose to share.
              </p>
            </div>
          </div>
        </header>

        {loading && entries.length === 0 ? (
          <LoadingState message="Opening the quiet pages..." centered={false} />
        ) : entries.length === 0 ? (
          <div className="paper-texture" style={{ padding: '34px 20px', textAlign: 'center', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--ink)' }}>
              No one has left a public word yet.
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              Words only appear here when a writer chooses to share them.
            </p>
          </div>
        ) : (
          <div
            className="public-grid"
            style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', alignItems: 'stretch' }}
          >
            {entries.map(entry => (
              <PublicEntryCard key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </section>

      {/* ============ CTA BANNER ============ */}
      <section
        className="visitor-cta-banner"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px',
          padding: '40px 24px',
          borderRadius: '18px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px var(--shadow-md)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'var(--sidebar-footer-veil), radial-gradient(ellipse at 50% 0%, var(--gold-muted) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', maxWidth: '620px' }}>
          <div className="gold-rule" style={{ margin: '0 auto 18px', maxWidth: '140px' }}>
            <span className="diamond" />
          </div>
          <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: 'clamp(1.25rem, 3vw, 1.55rem)', lineHeight: 1.6, color: 'var(--ink)' }}>
            Maybe there is a story inside you
            <br />
            that has been waiting to be written.
          </p>
          <Link
            to="/login"
            className="visitor-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '22px',
              padding: '14px 34px',
              borderRadius: '12px',
              textDecoration: 'none',
              backgroundColor: 'var(--gold)',
              color: 'var(--paper-dark)',
              fontWeight: 600,
              fontSize: '1.02rem',
              boxShadow: '0 6px 22px rgba(216,168,91,0.4)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
          >
            Start Writing
            <ArrowRight size={17} />
          </Link>
          <p style={{ margin: '16px 0 0', fontSize: '0.8rem', color: 'var(--ink-light)' }}>
            Free · anonymous · protected by a private username and PIN
          </p>
        </div>
      </section>
    </div>
  );
};

export default VisitorHome;
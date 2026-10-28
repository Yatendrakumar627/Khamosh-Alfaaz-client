import { Link } from 'react-router-dom';
import { Compass, Feather, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export const NotFound = () => {
  useEffect(() => {
    document.title = 'Whisper Lost in Silence (404) — Khamosh Alfaaz';
  }, []);

  return (
    <div
      className="not-found-page"
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        margin: '0 auto',
        maxWidth: '600px',
      }}
    >
      <div
        className="paper-texture"
        style={{
          width: '100%',
          padding: 'clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--paper)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(223, 178, 100, 0.12)',
            border: '1px solid rgba(223, 178, 100, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold)',
          }}
        >
          <Compass size={28} />
        </div>

        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}
        >
          Error 404 • Page Not Found
        </span>

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'clamp(1.7rem, 4vw, 2.2rem)',
            color: 'var(--ink)',
            lineHeight: 1.3,
            fontWeight: 600,
          }}
        >
          This whisper has drifted into silence
        </h1>

        <div className="gold-rule" style={{ maxWidth: '140px', margin: '4px auto' }}>
          <span className="diamond" />
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '0.94rem',
            color: 'var(--ink-muted)',
            lineHeight: 1.6,
            maxWidth: '440px',
          }}
        >
          The page or memory you are looking for may have been removed, made private, or never spoken aloud.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 22px',
              borderRadius: '10px',
              backgroundColor: 'var(--gold)',
              color: '#1a140d',
              fontWeight: 600,
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(223, 178, 100, 0.28)',
              transition: 'transform 0.15s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Sanctuary</span>
          </Link>

          <Link
            to="/explore/quotes"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 20px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              fontWeight: 500,
              fontSize: '0.88rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Feather size={15} />
            <span>Read Quotes</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


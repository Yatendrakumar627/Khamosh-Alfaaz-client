import { Link } from 'react-router-dom';
import { Feather, Shield, Heart, ArrowUp, Lock, Sparkles, BookOpen } from 'lucide-react';
import favicon from '../../assets/favicon.png';

export const VisitorFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        backgroundColor: 'color-mix(in srgb, var(--paper) 70%, var(--background))',
        padding: 'clamp(36px, 6vw, 64px) 20px 36px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(28px, 4vw, 44px)',
        }}
      >
        {/* ── Pre-Footer: Sanctuary Invitation Callout ── */}
        <div
          className="paper-texture"
          style={{
            padding: 'clamp(20px, 3.5vw, 32px)',
            borderRadius: '16px',
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--gold)' }} />
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                }}
              >
                Safe Haven for Thoughts
              </span>
            </div>
            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--font-family-heading)',
                fontSize: 'clamp(1.2rem, 2.5vw, 1.55rem)',
                color: 'var(--ink)',
                lineHeight: 1.3,
                fontWeight: 600,
              }}
            >
              Have words you could never say to anyone?
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.86rem',
                color: 'var(--ink-muted)',
                lineHeight: 1.55,
              }}
            >
              Leave them here in silence. Start your own secret sanctuary — encrypted,
              peaceful, and completely anonymous.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                backgroundColor: 'var(--gold)',
                color: '#1a140d',
                fontWeight: 600,
                fontSize: '0.86rem',
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(223, 178, 100, 0.28)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Feather size={14} />
              <span>Begin Your Diary</span>
            </Link>

            <Link
              to="/explore"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--ink)',
                fontWeight: 500,
                fontSize: '0.86rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.color = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--ink)';
              }}
            >
              <BookOpen size={14} />
              <span>Read Whispers</span>
            </Link>
          </div>
        </div>

        {/* ── Main Footer Columns Grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'clamp(24px, 3.5vw, 36px)',
          }}
        >
          {/* Column 1: Brand & Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={favicon}
                alt=""
                style={{ width: '24px', height: '24px', borderRadius: '6px' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-family-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  letterSpacing: '0.01em',
                }}
              >
                Khamosh Alfaaz
              </span>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '0.84rem',
                color: 'var(--ink-muted)',
                lineHeight: 1.6,
              }}
            >
              A quiet digital sanctuary for unspoken feelings, anonymous memoirs,
              and reflections left to breathe in silence.
            </p>

            {/* Privacy Badges Strip */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  color: 'var(--gold)',
                  fontWeight: 500,
                }}
              >
                <Shield size={13} />
                <span>100% Anonymous • No Email Required</span>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  color: 'var(--ink-light)',
                }}
              >
                <Lock size={13} />
                <span>Zero Trackers • Client Encrypted</span>
              </div>
            </div>
          </div>

          {/* Column 2: Discover & Read */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}
            >
              Discover
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <Link
                  to="/explore"
                  style={{
                    color: 'var(--ink-muted)',
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
                >
                  Public Whispers
                </Link>
              </li>
              <li>
                <Link
                  to="/explore/quotes"
                  style={{
                    color: 'var(--ink-muted)',
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
                >
                  Soul Quotes
                </Link>
              </li>
              <li>
                <Link
                  to="/explore/categories"
                  style={{
                    color: 'var(--ink-muted)',
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
                >
                  Explore Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  style={{
                    color: 'var(--ink-muted)',
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
                >
                  Sanctuary Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Sanctuary & About */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}
            >
              Sanctuary
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>
                <Link
                  to="/about"
                  style={{
                    color: 'var(--ink-muted)',
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
                >
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  style={{
                    color: 'var(--ink-muted)',
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
                >
                  Start Private Journal
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  style={{
                    color: 'var(--ink-muted)',
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
                >
                  Secret Key Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quiet Space Promise & Back to Top */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}
            >
              A Calm Promise
            </h4>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-family-heading)',
                fontStyle: 'italic',
                fontSize: '0.94rem',
                color: 'var(--ink-muted)',
                lineHeight: 1.55,
              }}
            >
              "No social feeds. No likes. No follower counts. Just human thoughts
              resting in quiet dignity."
            </p>

            <button
              type="button"
              onClick={scrollToTop}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '4px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                color: 'var(--ink-muted)',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.color = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--ink-muted)';
              }}
            >
              <ArrowUp size={13} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        {/* ── Bottom Strip: Filigree Divider & Copyright ── */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.80rem',
              color: 'var(--ink-light)',
            }}
          >
            © {new Date().getFullYear()} Khamosh Alfaaz • A calm corner on the internet.
          </p>

          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-family-heading)',
              fontStyle: 'italic',
              fontSize: '0.88rem',
              color: 'var(--ink-muted)',
            }}
          >
            Anyone can come here and quietly read what others couldn't say.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default VisitorFooter;

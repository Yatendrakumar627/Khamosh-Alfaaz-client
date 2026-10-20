import { Link } from 'react-router-dom';
import {
  BookOpen, Eye, Feather, LockKeyhole, ArrowRight,
  Sparkles, ShieldCheck, Quote, Clock, Compass
} from 'lucide-react';
import favicon from '../assets/favicon.png';
import { usePublicEntries } from '../hooks/usePublicEntries';
import { PublicEntryCard } from '../components/visitor/PublicEntryCard';
import { LoadingState } from '../components/ui/LoadingState';

const VALUES = [
  {
    icon: Eye,
    title: 'Read, freely',
    text: 'Wander the public pages without an account or paywalls — just sit down and read what strangers chose to whisper.',
    badge: 'Open to All',
  },
  {
    icon: LockKeyhole,
    title: 'Stay 100% private',
    text: 'Guarded only by your private username and a 4-digit numeric PIN. No email, no phone, no tracking, zero spam.',
    badge: 'Zero Knowledge',
  },
  {
    icon: Feather,
    title: 'Write in silence',
    text: 'The words you never said finally find a quiet page to rest on. Keep them locked, or release them anonymously to heal others.',
    badge: 'No Judgment',
  },
];

export const VisitorHome = () => {
  const { entries, loading } = usePublicEntries({ limit: 6, sort: 'newest' });

  return (
    <div className="visitor-home" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* ── 1. HERO — The Sanctuary Invitation ── */}
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
          padding: 'clamp(40px, 6vw, 64px) 24px clamp(36px, 5vw, 52px)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Subtle radial ambient warmth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse at 50% -10%, rgba(223, 178, 100, 0.18) 0%, transparent 65%), linear-gradient(180deg, color-mix(in srgb, var(--paper) 95%, var(--gold)) 0%, var(--paper) 100%)',
            opacity: 0.45,
          }}
        />

        {/* Top Floating Badge */}
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 14px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(223, 178, 100, 0.1)',
            border: '1px solid rgba(223, 178, 100, 0.25)',
            color: 'var(--gold)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          <Sparkles size={13} />
          <span>An Anonymous Sanctuary for Unspoken Words</span>
        </div>

        {/* Logo Emblem */}
        <div style={{ position: 'relative', marginTop: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={favicon}
            alt="Khamosh Alfaaz emblem"
            style={{
              width: 64,
              height: 64,
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 16px rgba(223, 178, 100, 0.45)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2))',
              display: 'block',
            }}
          />
        </div>

        {/* Brand Heading */}
        <h1
          style={{
            position: 'relative',
            fontFamily: 'var(--font-family-heading)',
            fontWeight: 600,
            color: 'var(--ink)',
            fontSize: 'clamp(2.4rem, 6.5vw, 3.8rem)',
            margin: '2px 0 0',
            letterSpacing: '-0.015em',
            lineHeight: 1.15,
          }}
        >
          Khamosh Alfaaz
        </h1>

        {/* Golden Diamond Divider */}
        <div className="gold-rule" style={{ position: 'relative', margin: '2px auto 4px', maxWidth: '180px' }}>
          <span className="diamond" />
        </div>

        {/* Subtitle / Poetic Hook */}
        <p
          style={{
            position: 'relative',
            fontFamily: 'var(--font-family-heading)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.2rem, 2.8vw, 1.5rem)',
            color: 'var(--gold)',
            margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          Jo keh nahi paaye, likh do.
        </p>

        {/* Main Philosophy Copy */}
        <p
          style={{
            position: 'relative',
            margin: '4px auto 8px',
            fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
            color: 'var(--ink-muted)',
            lineHeight: 1.6,
            maxWidth: '640px',
          }}
        >
          This is a quiet corner of the internet where words that were never spoken
          finally find a sanctuary. Strangers write their deepest reflections — openly,
          honestly, and completely anonymously. You can read them, write your own private memories,
          and leave whenever you like.
        </p>

        {/* ── Primary & Secondary Hero Action Buttons ── */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '8px',
            width: '100%',
          }}
        >
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              padding: '12px 28px',
              borderRadius: '12px',
              backgroundColor: 'var(--gold)',
              color: '#1a140d',
              fontWeight: 600,
              fontSize: '0.96rem',
              textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(223, 178, 100, 0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(223, 178, 100, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(223, 178, 100, 0.35)';
            }}
          >
            <Feather size={17} />
            <span>Start Writing in Silence</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '12px',
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              fontWeight: 500,
              fontSize: '0.94rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
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
            <BookOpen size={16} />
            <span>Read Public Musings</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginTop: '12px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(223, 178, 100, 0.12)',
            fontSize: '0.78rem',
            color: 'var(--ink-light)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <LockKeyhole size={13} style={{ color: 'var(--gold)' }} />
            100% Private Diary
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={13} style={{ color: 'var(--gold)' }} />
            No Email or Phone
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} style={{ color: 'var(--gold)' }} />
            Instant 10-Second Entry
          </span>
        </div>
      </section>

      {/* ── 2. DISCOVERY PORTALS: Explore Khamosh Alfaaz ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '0 4px' }}>
          <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', fontWeight: 600 }}>
            EXPLORE THE SANCTUARY
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
            Open reading without an account
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          {[
            {
              to: '/explore',
              icon: BookOpen,
              title: 'Public Pages',
              desc: 'Unfiltered anonymous reflections left by strangers.',
            },
            {
              to: '/explore/quotes',
              icon: Quote,
              title: 'Soul Quotes',
              desc: 'Short, poignant lines that stay with you.',
            },
            {
              to: '/explore/categories',
              icon: Compass,
              title: 'Categories',
              desc: 'Musings sorted by emotion, healing, and memory.',
            },
            {
              to: '/about',
              icon: Feather,
              title: 'Our Story',
              desc: 'The quiet philosophy behind Khamosh Alfaaz.',
            },
          ].map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.title}
                to={portal.to}
                className="paper-texture"
                style={{
                  textDecoration: 'none',
                  padding: '18px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--paper)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 10px var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(223, 178, 100, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold)',
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--ink-muted)' }} />
                </div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: 'var(--ink)' }}>
                  {portal.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.80rem', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
                  {portal.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 3. FEATURED SOUL QUOTE ── */}
      <section
        className="paper-texture"
        style={{
          padding: '24px 26px',
          borderRadius: '16px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '640px' }}>
          <Quote size={28} style={{ color: 'var(--gold)', flexShrink: 0, opacity: 0.8, marginTop: '2px' }} />
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-family-heading)',
                fontStyle: 'italic',
                fontSize: 'clamp(1rem, 2.2vw, 1.18rem)',
                lineHeight: 1.5,
                color: 'var(--ink)',
              }}
            >
              "There is no greater agony than bearing an untold story inside you."
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600 }}>
              — Maya Angelou
            </p>
          </div>
        </div>

        <Link
          to="/explore/quotes"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            color: 'var(--ink-muted)',
            textDecoration: 'none',
            padding: '7px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--paper-dark)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
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
          <span>Explore Public Quotes</span>
          <ArrowRight size={13} />
        </Link>
      </section>

      {/* ── 4. THE 3 SANCTUARY PILLARS ── */}
      <div
        className="visitor-values"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '18px',
          alignItems: 'stretch',
        }}
      >
        {VALUES.map(({ icon: Icon, title, text, badge }) => (
          <div
            key={title}
            className="paper-texture"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '26px 24px',
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: '0 2px 14px var(--shadow-sm)',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = 'rgba(223, 178, 100, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(223, 178, 100, 0.14)',
                  border: '1px solid rgba(223, 178, 100, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold)',
                  flexShrink: 0,
                }}
              >
                <Icon size={21} />
              </div>

              <span
                style={{
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--gold)',
                  backgroundColor: 'rgba(223, 178, 100, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                }}
              >
                {badge}
              </span>
            </div>

            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--font-family-heading)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {title}
            </h3>

            <p style={{ margin: 0, fontSize: '0.90rem', color: 'var(--ink-muted)', lineHeight: 1.55 }}>
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* ── 5. LATEST PUBLIC ENTRIES WITH DYNAMIC CATEGORY FILTER TABS ── */}
      <section className="visitor-latest" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(223, 178, 100, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
                flexShrink: 0,
              }}
            >
              <BookOpen size={19} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-family-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                }}
              >
                From the quiet pages
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.80rem', color: 'var(--ink-light)' }}>
                Real thoughts released anonymously by writers into the world.
              </p>
            </div>
          </div>
        </header>

        {loading && entries.length === 0 ? (
          <LoadingState message="Opening the quiet pages..." centered={false} />
        ) : entries.length === 0 ? (
          <div
            className="paper-texture"
            style={{
              padding: '38px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
            }}
          >
            <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--ink)' }}>
              No one has left a public word yet.
            </p>
            <p style={{ margin: '8px 0 16px', fontSize: '0.86rem', color: 'var(--ink-muted)' }}>
              Be the first writer to leave your anonymous mark.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--gold)',
                color: '#1a140d',
                fontWeight: 600,
                fontSize: '0.84rem',
                textDecoration: 'none',
              }}
            >
              Write First Reflection
            </Link>
          </div>
        ) : (
          <div
            className="public-grid"
            style={{
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              alignItems: 'stretch',
            }}
          >
            {entries.map((entry) => (
              <PublicEntryCard key={entry._id} entry={entry} />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '6px' }}>
          <Link
            to="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--gold)',
              textDecoration: 'none',
              padding: '8px 18px',
              borderRadius: '9999px',
              border: '1px solid rgba(223, 178, 100, 0.3)',
              backgroundColor: 'rgba(223, 178, 100, 0.08)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(223, 178, 100, 0.18)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(223, 178, 100, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>Wander all public memories in Explore</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── 6. COMPARISON: THE SANCTUARY PHILOSOPHY ── */}
      <section
        className="paper-texture"
        style={{
          padding: 'clamp(24px, 4vw, 36px)',
          borderRadius: '18px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Loud Social Networks
          </span>
          <h4 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: '1.2rem', color: 'var(--ink-muted)' }}>
            Performance & Validation
          </h4>
          <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '0.88rem', color: 'var(--ink-light)', lineHeight: 1.7 }}>
            <li>Obsessive likes, view counts, and follower graphs</li>
            <li>Constant pressure to present an edited, cheerful life</li>
            <li>Public scrutiny and fear of judgment from acquaintances</li>
            <li>Distracting notification pings pulling your focus away</li>
          </ul>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingLeft: 'clamp(0px, 2vw, 24px)',
            borderLeft: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Khamosh Alfaaz
          </span>
          <h4 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', color: 'var(--ink)' }}>
            Deep Silence & Self-Truth
          </h4>
          <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.7 }}>
            <li><strong>Zero algorithms</strong> — no likes, no comments, no popularity ranking</li>
            <li><strong>Complete anonymity</strong> — no email or phone attached to your thoughts</li>
            <li><strong>Private by default</strong> — only what you choose to release is ever seen</li>
            <li><strong>Timeless parchment space</strong> — write for clarity, peace, and yourself</li>
          </ul>
        </div>
      </section>

      {/* ── 7. HOW IT WORKS IN 3 STEPS ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontSize: '1.35rem', color: 'var(--ink)', fontWeight: 600 }}>
          Begin your sanctuary in seconds
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          {[
            {
              num: '01',
              title: 'Pick Name & PIN',
              desc: 'No verification link, no password reset emails. Just a secret username & 4-digit PIN.',
            },
            {
              num: '02',
              title: 'Pour Out Words',
              desc: 'Write joys, regrets, poems, or prayers on a calming vintage parchment editor.',
            },
            {
              num: '03',
              title: 'Keep or Whisper',
              desc: 'Keep every thought locked to you forever, or selectively gift it to the Explore feed.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="paper-texture"
              style={{
                padding: '20px',
                borderRadius: '14px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-family-heading)', color: 'var(--gold)', fontWeight: 700 }}>
                {step.num}
              </span>
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink)' }}>
                {step.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. FINAL CTA BANNER ── */}
      <section
        className="visitor-cta-banner"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px',
          padding: 'clamp(36px, 6vw, 56px) 24px',
          borderRadius: '20px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(223, 178, 100, 0.15) 0%, transparent 70%)',
          }}
        />
        <div style={{ position: 'relative', maxWidth: '620px' }}>
          <div className="gold-rule" style={{ margin: '0 auto 16px', maxWidth: '140px' }}>
            <span className="diamond" />
          </div>

          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-family-heading)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.3rem, 3.2vw, 1.7rem)',
              lineHeight: 1.4,
              color: 'var(--ink)',
            }}
          >
            Maybe there is a story inside you
            <br />
            that has been waiting to be written.
          </p>

          <p style={{ margin: '10px 0 0', fontSize: '0.90rem', color: 'var(--ink-muted)' }}>
            Give your unspoken thoughts a home today.
          </p>

          <Link
            to="/login"
            className="visitor-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '22px',
              padding: '14px 36px',
              borderRadius: '12px',
              textDecoration: 'none',
              backgroundColor: 'var(--gold)',
              color: '#1a140d',
              fontWeight: 600,
              fontSize: '1.02rem',
              boxShadow: '0 6px 24px rgba(223, 178, 100, 0.38)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(223, 178, 100, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(223, 178, 100, 0.38)';
            }}
          >
            <span>Start Writing Now</span>
            <ArrowRight size={17} />
          </Link>

          <p style={{ margin: '16px 0 0', fontSize: '0.80rem', color: 'var(--ink-light)' }}>
            Free · 100% anonymous · protected by a private username and PIN
          </p>
        </div>
      </section>
    </div>
  );
};

export default VisitorHome;
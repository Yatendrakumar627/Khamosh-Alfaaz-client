import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Flame, Copy, Check, Share2, BookOpen
} from 'lucide-react';
import { usePublicEntry } from '../hooks/usePublicEntries';
import { LoadingState } from '../components/ui/LoadingState';
import { formatDate, getEntryTypeLabel } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import { useSEO } from '../utils/useSEO';

const toParagraphs = (content) =>
  String(content || '').split(/\r?\n+/).map((p) => p.trim()).filter(Boolean);

export const PublicEntry = () => {
  const { id } = useParams();
  const toast = useToast();
  const { entry, loading, error } = usePublicEntry(id);

  useSEO({
    title: entry?.title ? `${entry.title} — Khamosh Alfaaz` : 'Public Whisper — Khamosh Alfaaz',
    description: entry?.content
      ? (entry.content.length > 150 ? entry.content.slice(0, 147) + '...' : entry.content)
      : 'Read an anonymous thought or memoir shared on Khamosh Alfaaz.',
    canonicalUrl: id ? `https://khamosh-alfaaz-client.vercel.app/explore/${id}` : undefined,
    ogType: 'article',
  });

  const [copied, setCopied] = useState(false);
  const [candleLit, setCandleLit] = useState(false);

  useEffect(() => {
    if (!id) return;
    try {
      const stored = localStorage.getItem(`khamosh_candle_${id}`);
      setCandleLit(stored === 'true');
    } catch {
      // LocalStorage unavailable
    }
  }, [id]);

  const handleToggleCandle = () => {
    const nextState = !candleLit;
    setCandleLit(nextState);
    try {
      if (nextState) {
        localStorage.setItem(`khamosh_candle_${id}`, 'true');
        toast?.success?.('You lit a silent candle for these words 🕯️');
      } else {
        localStorage.removeItem(`khamosh_candle_${id}`);
      }
    } catch {
      // Ignore
    }
  };

  const handleCopy = async () => {
    if (!entry?.content) return;
    try {
      const textToCopy = `${entry.title ? entry.title + '\n\n' : ''}${entry.content}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast?.success?.('Words copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast?.error?.('Failed to copy');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: entry.title || 'A Whisper on Khamosh Alfaaz',
          text: entry.content ? entry.content.slice(0, 140) + '...' : '',
          url: window.location.href,
        });
      } catch {
        // Dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast?.success?.('Link copied to clipboard');
      } catch {
        toast?.error?.('Could not copy link');
      }
    }
  };

  if (loading && !entry) {
    return (
      <div style={{ padding: '80px 20px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <LoadingState message="Opening this quiet page..." centered={false} />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div
        className="paper-texture"
        style={{
          maxWidth: '540px',
          margin: '40px auto',
          padding: '40px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
        }}
      >
        <BookOpen size={28} style={{ color: 'var(--gold)', margin: '0 auto 14px', display: 'block' }} />
        <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-family-heading)', color: 'var(--ink)', fontSize: '1.4rem' }}>
          This page has gone quiet
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
          It may have been removed or returned to the writer's private sanctuary.
        </p>
        <Link
          to="/explore"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            borderRadius: '8px',
            backgroundColor: 'var(--gold)',
            color: '#1a140d',
            fontWeight: 600,
            fontSize: '0.86rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Explore</span>
        </Link>
      </div>
    );
  }

  const rawDate = entry.entryDate || entry.createdAt;
  const paragraphs = toParagraphs(entry.content);
  const isQuote = entry.type === 'quote';

  return (
    <div
      className="public-entry-page"
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '32px',
        animation: 'fadeIn 0.25s var(--ease-out)',
      }}
    >
      {/* ── Quiet Top Back Navigation ── */}
      <div>
        <Link
          to="/explore"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--ink-muted)',
            fontSize: '0.84rem',
            textDecoration: 'none',
            padding: '6px 0',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
        >
          <ArrowLeft size={15} />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* ── Main Emotional Reading Sheet ── */}
      <article
        className="paper-texture"
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: 'clamp(24px, 5vw, 42px)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Simple, Understated Metadata */}
        <header style={{ marginBottom: '22px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: 'var(--gold)',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            <span>{getEntryTypeLabel(entry.type)}</span>
            <span>•</span>
            <span style={{ color: 'var(--ink-muted)' }}>{formatDate(rawDate, 'DISPLAY')}</span>
          </div>

          {/* Title */}
          {entry.title ? (
            <h1
              style={{
                margin: '0 0 14px',
                fontFamily: 'var(--font-family-heading)',
                fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
                fontWeight: 600,
                color: 'var(--ink)',
                lineHeight: 1.25,
              }}
            >
              {entry.title}
            </h1>
          ) : null}

          {/* Delicate Divider Line */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, var(--border), transparent)',
              width: '100%',
            }}
          />
        </header>

        {/* Prose Body (Clean, Natural, Emotion-First) */}
        {isQuote ? (
          <div
            style={{
              padding: '20px 0',
              textAlign: 'center',
              fontFamily: 'var(--font-family-heading)',
              fontStyle: 'italic',
              fontSize: '1.18rem',
              lineHeight: 1.7,
              color: 'var(--ink)',
            }}
          >
            {paragraphs.map((p, i) => (
              <p key={i} style={{ margin: '0 0 14px 0' }}>
                “{p}”
              </p>
            ))}
          </div>
        ) : (
          <div
            className="public-entry-body"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              fontSize: '0.98rem',
              lineHeight: 1.68,
              color: 'var(--ink)',
              textAlign: 'justify',
              textJustify: 'inter-word',
              hyphens: 'auto',
              fontFamily: 'var(--font-family-body)',
              letterSpacing: '0.005em',
            }}
          >
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Tags (if any) */}
        {entry.tags && entry.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '28px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
            }}
          >
            {entry.tags.map((tag) => (
              <Link
                key={tag}
                to={`/explore?search=%23${encodeURIComponent(tag)}`}
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--gold)',
                  textDecoration: 'none',
                  opacity: 0.85,
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* ── Quiet Emotional Touchpoint at the End ── */}
        <div
          style={{
            marginTop: '32px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Silent Candle */}
          <button
            type="button"
            onClick={handleToggleCandle}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              border: `1px solid ${candleLit ? 'var(--gold)' : 'var(--border)'}`,
              backgroundColor: candleLit ? 'rgba(223, 178, 100, 0.14)' : 'transparent',
              color: candleLit ? 'var(--gold)' : 'var(--ink-muted)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Flame
              size={14}
              className={candleLit ? 'candle-active' : ''}
              style={{ color: candleLit ? 'var(--gold)' : 'var(--ink-muted)' }}
            />
            <span>{candleLit ? 'Candle is lit 🕯️' : 'Light a silent candle'}</span>
          </button>

          {/* Simple Copy & Share Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy words"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                padding: '4px',
                color: copied ? 'var(--gold)' : 'var(--ink-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              title="Share"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                padding: '4px',
                color: 'var(--ink-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </article>

      {/* ── Earlier / Next Whisper Links ── */}
      {(entry.prevEntry || entry.nextEntry) && (
        <nav
          aria-label="Previous and next entries"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '4px 2px',
          }}
        >
          {entry.prevEntry ? (
            <Link
              to={`/explore/${entry.prevEntry._id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--ink-muted)',
                fontSize: '0.82rem',
                textDecoration: 'none',
                maxWidth: '48%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <ArrowLeft size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.prevEntry.title || 'Earlier Whisper'}
              </span>
            </Link>
          ) : <div />}

          {entry.nextEntry && (
            <Link
              to={`/explore/${entry.nextEntry._id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--ink-muted)',
                fontSize: '0.82rem',
                textDecoration: 'none',
                maxWidth: '48%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'right',
                justifyContent: 'flex-end',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.nextEntry.title || 'Next Whisper'}
              </span>
              <ArrowRight size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
};

export default PublicEntry;
import { Star, Copy, Plus, BookOpen, Bookmark, Quote as QuoteIcon, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { classNames } from '../../utils/helpers';
import { useState } from 'react';

export const QuoteCard = ({ quote, onSaveAsEntry, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy:', e);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-xl)',
      position: 'relative',
      animationDelay: `${(index || 0) * 100}ms`,
    }} className="paper-texture diary-page fade-in">
      <div style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button
          onClick={handleCopy}
          className="icon-btn"
          style={{ padding: 'var(--spacing-xs)', border: 'none', background: 'transparent', color: 'var(--ink-muted)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          aria-label={copied ? 'Copied!' : 'Copy quote'}
        >
          {copied ? <Check size={18} style={{ color: 'var(--success)' }} /> : <Copy size={18} />}
        </button>
        <button
          onClick={() => onSaveAsEntry?.(quote)}
          className="icon-btn"
          style={{ padding: 'var(--spacing-xs)', border: 'none', background: 'transparent', color: 'var(--ink-muted)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          aria-label="Save as entry"
        >
          <Plus size={18} />
        </button>
      </div>

      <blockquote style={{ margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
        <p style={{
          fontFamily: 'var(--font-family-heading)',
          fontSize: '1.25rem',
          fontWeight: 500,
          color: 'var(--ink)',
          margin: '0 0 var(--spacing-md)',
          lineHeight: 1.5,
        }}>
          "{quote.text}"
        </p>
        <footer style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
          <span>—</span>
          <cite style={{ fontStyle: 'normal', fontWeight: 500, color: 'var(--ink)' }}>{quote.author}</cite>
        </footer>
      </blockquote>

      {onSaveAsEntry && (
        <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)' }}>
          <Button variant="subtle" size="sm" fullWidth onClick={() => onSaveAsEntry(quote)} leftIcon={<BookOpen size={16} />}>
            Save as Entry
          </Button>
        </div>
      )}
    </div>
  );
};

export const QuoteCarousel = ({ quotes, onSaveAsEntry, autoRotate = false, interval = 10000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Could add auto-rotate logic here if needed

  return (
    <div>
      {quotes.map((quote, index) => (
        <QuoteCard
          key={quote.id || index}
          quote={quote}
          onSaveAsEntry={onSaveAsEntry}
          index={index}
        />
      ))}
    </div>
  );
};

export const DailyQuote = ({ quote, onSaveAsEntry }) => (
  <div style={{
    backgroundColor: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
  }} className="paper-texture diary-page">
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '11px 14px',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        backgroundColor: 'var(--active-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <QuoteIcon size={15} style={{ color: 'var(--gold)' }} />
      </div>
      <h3 style={{
        fontFamily: 'var(--font-family-heading)',
        fontSize: '0.92rem',
        fontWeight: 600,
        margin: 0,
        color: 'var(--ink)',
        lineHeight: 1.2,
      }}>
        Today's Quote
      </h3>
    </header>

    <div style={{ padding: '14px 14px 12px' }}>
      <blockquote style={{ margin: 0, fontStyle: 'italic', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-family-heading)',
          fontSize: '1.05rem',
          fontWeight: 500,
          color: 'var(--ink)',
          margin: '0 0 10px',
          lineHeight: 1.5,
        }}>
          "{quote.text}"
        </p>
        <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
          <span>—</span>
          <cite style={{ fontStyle: 'normal', fontWeight: 500, color: 'var(--gold)' }}>{quote.author}</cite>
        </footer>
      </blockquote>

      {onSaveAsEntry && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            onClick={() => onSaveAsEntry(quote)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '30px',
              padding: '0 10px',
              border: '1px solid rgba(216,168,91,0.35)',
              background: 'transparent',
              color: 'var(--gold)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 500,
              fontFamily: 'var(--font-family-body)',
              transition: 'background-color 0.2s ease',
            }}
          >
            <Bookmark size={14} />
            Save as Entry
          </button>
        </div>
      )}
    </div>
  </div>
);
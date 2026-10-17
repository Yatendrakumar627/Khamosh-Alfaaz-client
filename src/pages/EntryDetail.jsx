import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEntry } from '../hooks/useEntries';
import { useExport } from '../hooks/useExport';
import { entriesApi } from '../services/api';
import { formatDate, getEntryTypeLabel, countWords } from '../utils/helpers';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { EntryEditor } from '../components/diary/EntryEditor';
import { useToast } from '../context/ToastContext';
import {
  Edit3, Trash2, Star, Pin, ArrowLeft, ArrowRight,
  Calendar, BookOpen, Globe, Lock, Download, ChevronDown,
  Copy, Check, Clock, Feather, Compass
} from 'lucide-react';

export const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { entry, loading, error, refresh } = useEntry(id);
  const { exportEntry, exporting } = useExport();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSizeLarge, setFontSizeLarge] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }
  }, [showExportMenu]);

  // Keyboard shortcut: Escape goes back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !showEdit && !showDeleteConfirm) {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, showEdit, showDeleteConfirm]);

  const handleFavorite = async () => {
    try {
      await entriesApi.toggleFavorite(id, !entry.isFavorite);
      toast?.success?.(entry.isFavorite ? 'Removed from favorites.' : 'Saved to favorites.');
      refresh();
    } catch (err) {
      toast?.error?.('Failed to update favorite status');
    }
  };

  const handlePin = async () => {
    try {
      await entriesApi.togglePin(id, !entry.isPinned);
      toast?.success?.(entry.isPinned ? 'Entry unpinned.' : 'Entry pinned to top.');
      refresh();
    } catch (err) {
      toast?.error?.('Failed to toggle pin');
    }
  };

  const handleVisibility = async () => {
    const next = entry.visibility === 'public' ? 'private' : 'public';
    if (
      next === 'public' &&
      !window.confirm('Make this entry PUBLIC? Anyone visiting Explore can read it anonymously. Your username is never shown.')
    ) {
      return;
    }
    try {
      await entriesApi.update(id, { visibility: next });
      toast?.success?.(next === 'public' ? 'Entry shared publicly to Explore.' : 'Entry set to private sanctuary.');
      refresh();
    } catch (err) {
      toast?.error?.('Failed to update privacy');
    }
  };

  const handleDelete = async () => {
    try {
      await entriesApi.delete(id);
      toast?.success?.('Entry deleted.');
      navigate('/entries');
    } catch (err) {
      toast?.error?.('Failed to delete entry');
    }
  };

  const handleCopy = async () => {
    if (!entry?.content) return;
    try {
      await navigator.clipboard.writeText(`${entry.title ? entry.title + '\n\n' : ''}${entry.content}`);
      setCopied(true);
      toast?.success?.('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast?.error?.('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '48px 24px', maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--gold)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
          Unfolding your pages...
        </p>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div style={{ padding: '48px 20px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(181, 77, 59, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--error)',
          }}
        >
          <Compass size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--ink)', margin: '0 0 8px' }}>
          Entry Not Found
        </h2>
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', margin: '0 0 24px' }}>
          This page may have been deleted, or belongs to another chapter.
        </p>
        <button
          onClick={() => navigate('/entries')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '9999px',
            backgroundColor: 'var(--gold)',
            color: '#1a140d',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Return to Diary
        </button>
      </div>
    );
  }

  const words = countWords(entry.content);
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const rawDate = entry.entryDate || entry.createdAt;

  return (
    <div
      className="entry-detail-page-container"
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: 'clamp(32px, 6vw, 64px)',
        animation: 'fadeIn 0.35s var(--ease-out)',
      }}
    >
      {/* ── Top Navigation Bar ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--border)',
            color: 'var(--ink)',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(223, 178, 100, 0.4)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={15} style={{ color: 'var(--gold)' }} />
          <span>Back</span>
        </button>

        {/* Chronological Neighbor Mini Jumper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {entry.prevEntry && (
            <Link
              to={`/entries/${entry.prevEntry._id}`}
              title={`Previous: ${entry.prevEntry.title || 'Entry'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                color: 'var(--ink-muted)',
                fontSize: '0.74rem',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={13} />
              <span>Older</span>
            </Link>
          )}

          {entry.nextEntry && (
            <Link
              to={`/entries/${entry.nextEntry._id}`}
              title={`Next: ${entry.nextEntry.title || 'Entry'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                color: 'var(--ink-muted)',
                fontSize: '0.74rem',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <span>Newer</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </nav>

      {/* ── Header Title & Meta Section ── */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Category Chip */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.70rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--gold)',
              backgroundColor: 'rgba(223, 178, 100, 0.12)',
              border: '1px solid rgba(223, 178, 100, 0.25)',
              padding: '3px 9px',
              borderRadius: '9999px',
            }}
          >
            <BookOpen size={12} />
            {getEntryTypeLabel(entry.type)}
          </span>

          {/* Privacy Pill Toggle */}
          <button
            type="button"
            onClick={handleVisibility}
            title="Click to toggle Public / Private"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.70rem',
              fontWeight: 600,
              borderRadius: '9999px',
              padding: '3px 9px',
              border: entry.visibility === 'public' ? '1px solid rgba(223, 178, 100, 0.4)' : '1px solid var(--border)',
              backgroundColor: entry.visibility === 'public' ? 'rgba(223, 178, 100, 0.15)' : 'var(--paper-dark)',
              color: entry.visibility === 'public' ? 'var(--gold)' : 'var(--ink-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {entry.visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
            <span>{entry.visibility === 'public' ? 'Public in Explore' : 'Private Sanctuary'}</span>
          </button>

          {entry.isPinned && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.70rem',
                fontWeight: 600,
                color: 'var(--gold)',
                backgroundColor: 'rgba(223, 178, 100, 0.1)',
                padding: '3px 8px',
                borderRadius: '9999px',
              }}
            >
              <Pin size={11} fill="currentColor" /> Pinned
            </span>
          )}

          {entry.isFavorite && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.70rem',
                fontWeight: 600,
                color: 'var(--gold)',
                backgroundColor: 'rgba(223, 178, 100, 0.1)',
                padding: '3px 8px',
                borderRadius: '9999px',
              }}
            >
              <Star size={11} fill="currentColor" /> Favorite
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'clamp(1.5rem, 3.8vw, 2.3rem)',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          {entry.title || 'Untitled Reflection'}
        </h1>

        {/* Sub-meta: Date & Word stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            fontSize: '0.82rem',
            color: 'var(--ink-muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={14} style={{ color: 'var(--gold)' }} />
            {formatDate(rawDate, 'DISPLAY')}
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Feather size={13} style={{ color: 'var(--gold)' }} />
            {words} words
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} style={{ color: 'var(--gold)' }} />
            ~{readingTime} min read
          </span>
        </div>
      </header>

      {/* ── Responsive Action Toolbar ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '8px',
        }}
      >
        {/* Edit Button (Primary) */}
        <button
          type="button"
          onClick={() => setShowEdit(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 14px',
            borderRadius: '10px',
            backgroundColor: 'var(--gold)',
            color: '#1a140d',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(223, 178, 100, 0.25)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Edit3 size={15} />
          <span>Edit</span>
        </button>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavorite}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 12px',
            borderRadius: '10px',
            backgroundColor: entry.isFavorite ? 'rgba(223, 178, 100, 0.16)' : 'var(--paper)',
            border: entry.isFavorite ? '1px solid var(--gold)' : '1px solid var(--border)',
            color: entry.isFavorite ? 'var(--gold)' : 'var(--ink)',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Star size={15} fill={entry.isFavorite ? 'currentColor' : 'none'} />
          <span>{entry.isFavorite ? 'Favorited' : 'Favorite'}</span>
        </button>

        {/* Pin Button */}
        <button
          type="button"
          onClick={handlePin}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 12px',
            borderRadius: '10px',
            backgroundColor: entry.isPinned ? 'rgba(223, 178, 100, 0.16)' : 'var(--paper)',
            border: entry.isPinned ? '1px solid var(--gold)' : '1px solid var(--border)',
            color: entry.isPinned ? 'var(--gold)' : 'var(--ink)',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Pin size={15} fill={entry.isPinned ? 'currentColor' : 'none'} />
          <span>{entry.isPinned ? 'Pinned' : 'Pin'}</span>
        </button>

        {/* Export Dropdown */}
        <div ref={exportMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: '10px',
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--border)',
              color: 'var(--ink)',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={15} style={{ color: 'var(--gold)' }} />
            <span>{exporting ? 'Exporting...' : 'Export'}</span>
            <ChevronDown size={13} style={{ opacity: 0.6 }} />
          </button>

          {showExportMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 100,
                minWidth: '190px',
              }}
              className="paper-texture"
            >
              {[
                { format: 'pdf', label: 'PDF Document (.pdf)' },
                { format: 'docx', label: 'Word Document (.docx)' },
                { format: 'txt', label: 'Plain Text (.txt)' },
                { format: 'md', label: 'Markdown (.md)' },
              ].map((opt) => (
                <button
                  key={opt.format}
                  type="button"
                  onClick={() => {
                    exportEntry(id, opt.format, entry.title);
                    setShowExportMenu(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--active-bg)';
                    e.currentTarget.style.color = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--ink)';
                  }}
                >
                  <span>{opt.label}</span>
                  <Download size={13} style={{ opacity: 0.6 }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy Text Button */}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 12px',
            borderRadius: '10px',
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--border)',
            color: 'var(--ink)',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {copied ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Copy size={15} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 12px',
            borderRadius: '10px',
            backgroundColor: 'var(--paper)',
            border: '1px solid rgba(181, 77, 59, 0.3)',
            color: 'var(--error)',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(181, 77, 59, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--paper)';
          }}
        >
          <Trash2 size={15} />
          <span>Delete</span>
        </button>
      </div>

      {/* ── Main Reading Canvas ── */}
      <article
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: 'clamp(20px, 4vw, 36px)',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.15)',
          position: 'relative',
        }}
        className="paper-texture diary-page"
      >
        {/* Reading Comfort Controls Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '12px',
            marginBottom: '24px',
            fontSize: '0.74rem',
            color: 'var(--ink-muted)',
          }}
        >
          <span>Parchment View</span>

          {/* Font Size Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.70rem' }}>Text Size:</span>
            <button
              type="button"
              onClick={() => setFontSizeLarge(false)}
              style={{
                border: 'none',
                background: !fontSizeLarge ? 'var(--active-bg)' : 'transparent',
                color: !fontSizeLarge ? 'var(--gold)' : 'var(--ink-muted)',
                fontWeight: !fontSizeLarge ? 700 : 500,
                fontSize: '0.75rem',
                padding: '2px 7px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setFontSizeLarge(true)}
              style={{
                border: 'none',
                background: fontSizeLarge ? 'var(--active-bg)' : 'transparent',
                color: fontSizeLarge ? 'var(--gold)' : 'var(--ink-muted)',
                fontWeight: fontSizeLarge ? 700 : 500,
                fontSize: '0.85rem',
                padding: '2px 7px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Comfort
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          className="entry-content"
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            lineHeight: 1.55,
            fontSize: fontSizeLarge ? '1.08rem' : '0.94rem',
            color: 'var(--ink)',
            textAlign: 'justify',
            textJustify: 'inter-word',
            hyphens: 'auto',
            fontFamily: 'var(--font-family-body)',
            letterSpacing: '0.005em',
          }}
        >
          {entry.content}
        </div>

        {/* Tags Section */}
        {entry.tags && entry.tags.length > 0 && (
          <div
            style={{
              marginTop: '32px',
              paddingTop: '18px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.74rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
              TAGS:
            </span>
            {entry.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  color: 'var(--gold)',
                  backgroundColor: 'rgba(223, 178, 100, 0.1)',
                  border: '1px solid rgba(223, 178, 100, 0.2)',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Timestamp Metadata */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.74rem',
            color: 'var(--ink-light)',
          }}
        >
          <span>Created: {formatDate(entry.createdAt, 'DATETIME')}</span>
          {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
            <span>Last edited: {formatDate(entry.updatedAt, 'DATETIME')}</span>
          )}
        </div>
      </article>

      {/* ── Chronological "Memory Flipper" Footer ── */}
      {(entry.prevEntry || entry.nextEntry) && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: entry.prevEntry && entry.nextEntry ? '1fr 1fr' : '1fr',
            gap: '12px',
          }}
        >
          {entry.prevEntry ? (
            <Link
              to={`/entries/${entry.prevEntry._id}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '14px 16px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
              }}
              className="paper-texture"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.70rem', color: 'var(--gold)', fontWeight: 600 }}>
                <ArrowLeft size={12} /> OLDER MEMORY
              </span>
              <span style={{ fontSize: '0.90rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.prevEntry.title || 'Untitled Entry'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                {formatDate(entry.prevEntry.entryDate, 'SHORT')}
              </span>
            </Link>
          ) : <div />}

          {entry.nextEntry && (
            <Link
              to={`/entries/${entry.nextEntry._id}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                textAlign: 'right',
                gap: '4px',
                padding: '14px 16px',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
              }}
              className="paper-texture"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.70rem', color: 'var(--gold)', fontWeight: 600 }}>
                NEWER MEMORY <ArrowRight size={12} />
              </span>
              <span style={{ fontSize: '0.90rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.nextEntry.title || 'Untitled Entry'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                {formatDate(entry.nextEntry.entryDate, 'SHORT')}
              </span>
            </Link>
          )}
        </section>
      )}

      {/* ── Dialogs ── */}
      <ConfirmDialog
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message="Are you sure you want to permanently delete this memory? This chapter will be removed forever."
        confirmLabel="Delete"
        variant="danger"
      />

      {showEdit && (
        <Modal opened={true} onClose={() => setShowEdit(false)} title="Edit Entry" size="lg">
          <EntryEditor
            initialData={{
              title: entry.title,
              content: entry.content,
              type: entry.type,
              tags: entry.tags || [],
              isFavorite: entry.isFavorite,
              isPinned: entry.isPinned,
              visibility: entry.visibility || 'private',
              entryDate: entry.entryDate,
            }}
            onSave={async (data) => {
              try {
                await entriesApi.update(id, data);
                toast?.success?.('Entry updated successfully.');
                refresh();
                setShowEdit(false);
              } catch (err) {
                const isTimeout = err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout');
                toast?.error?.(isTimeout ? 'Server took too long to respond. Please try again.' : (err.response?.data?.error || 'Failed to update entry. Please try again.'));
              }
            }}
            onCancel={() => setShowEdit(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default EntryDetail;
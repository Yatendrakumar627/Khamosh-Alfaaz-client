import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
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
  Copy, Check, Clock, Feather, Compass, FileText
} from 'lucide-react';

export const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useMediaQuery('(max-width: 640px)');
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
    <div className="entry-detail-page-container">
      {/* ── Top Navigation Bar ── */}
      <nav className="entry-detail-nav">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="entry-detail-back-btn"
        >
          <ArrowLeft size={14} style={{ color: 'var(--gold)' }} />
          <span>Back</span>
        </button>

        {/* Chronological Neighbor Jumper */}
        {(entry.prevEntry || entry.nextEntry) && (
          <div className="entry-detail-nav-jumper">
            {entry.prevEntry && (
              <Link
                to={`/entries/${entry.prevEntry._id}`}
                title={`Older: ${entry.prevEntry.title || 'Entry'}`}
                className="entry-detail-nav-link"
              >
                <ArrowLeft size={12} />
                <span>Older</span>
              </Link>
            )}
            {entry.prevEntry && entry.nextEntry && (
              <span className="entry-detail-nav-divider" />
            )}
            {entry.nextEntry && (
              <Link
                to={`/entries/${entry.nextEntry._id}`}
                title={`Newer: ${entry.nextEntry.title || 'Entry'}`}
                className="entry-detail-nav-link"
              >
                <span>Newer</span>
                <ArrowRight size={12} />
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ── Editorial Header & Unified Metadata Bar ── */}
      <header className="entry-detail-header">
        <div className="entry-detail-meta-bar">
          {/* Category Chip */}
          <span className="entry-detail-type-badge">
            <BookOpen size={11} />
            {getEntryTypeLabel(entry.type)}
          </span>

          {/* Privacy Pill Toggle */}
          <button
            type="button"
            onClick={handleVisibility}
            title="Click to toggle Public / Private"
            className={`entry-detail-visibility-pill ${entry.visibility === 'public' ? 'is-public' : ''}`}
          >
            {entry.visibility === 'public' ? <Globe size={11} /> : <Lock size={11} />}
            <span>{entry.visibility === 'public' ? (isMobile ? 'Public' : 'Public in Explore') : 'Private'}</span>
          </button>

          {entry.isPinned && (
            <span className="entry-detail-status-pill">
              <Pin size={11} fill="currentColor" /> Pinned
            </span>
          )}

          {entry.isFavorite && (
            <span className="entry-detail-status-pill">
              <Star size={11} fill="currentColor" /> Favorite
            </span>
          )}

          <span className="entry-detail-meta-sep">•</span>

          <span className="entry-detail-meta-item">
            <Calendar size={13} style={{ color: 'var(--gold)' }} />
            {formatDate(rawDate, isMobile ? 'SHORT' : 'DISPLAY')}
          </span>

          <span className="entry-detail-meta-sep">•</span>

          <span className="entry-detail-meta-item">
            <Feather size={12} style={{ color: 'var(--gold)' }} />
            {words} words
          </span>

          <span className="entry-detail-meta-sep">•</span>

          <span className="entry-detail-meta-item">
            <Clock size={12} style={{ color: 'var(--gold)' }} />
            ~{readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="entry-detail-title">
          {entry.title || 'Untitled Reflection'}
        </h1>
      </header>

      {/* ── Cohesive Action Toolbar ── */}
      <div className="entry-detail-actions">
        <div className="entry-detail-actions-left">
          {/* Edit Button (Primary) */}
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="entry-detail-action-btn entry-detail-action-btn-primary"
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleFavorite}
            className={`entry-detail-action-btn ${entry.isFavorite ? 'is-active' : ''}`}
          >
            <Star size={14} fill={entry.isFavorite ? 'currentColor' : 'none'} />
            <span>{entry.isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          {/* Pin Button */}
          <button
            type="button"
            onClick={handlePin}
            className={`entry-detail-action-btn ${entry.isPinned ? 'is-active' : ''}`}
          >
            <Pin size={14} fill={entry.isPinned ? 'currentColor' : 'none'} />
            <span>{entry.isPinned ? 'Pinned' : 'Pin'}</span>
          </button>

          {/* Export Dropdown */}
          <div ref={exportMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
              className="entry-detail-action-btn"
            >
              <Download size={14} style={{ color: 'var(--gold)' }} />
              <span>{exporting ? 'Exporting...' : 'Export'}</span>
              <ChevronDown size={12} style={{ opacity: 0.6 }} />
            </button>

            {showExportMenu && (
              <div className="entry-detail-export-dropdown paper-texture">
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
                    className="entry-detail-export-item"
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
            className="entry-detail-action-btn"
          >
            {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="entry-detail-action-btn entry-detail-action-btn-danger"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>

      {/* ── Main Reading Canvas ── */}
      <article className="paper-texture diary-page entry-detail-reading-card">
        {/* Reading Comfort Controls Header */}
        <div className="entry-detail-card-header">
          <div className="entry-detail-card-badge">
            <FileText size={13} style={{ color: 'var(--gold)' }} />
            <span>Parchment View</span>
          </div>

          {/* Font Size Toggle */}
          <div className="entry-detail-font-toggle">
            <span className="entry-detail-font-label">Text Size:</span>
            <button
              type="button"
              onClick={() => setFontSizeLarge(false)}
              className={`entry-detail-size-btn ${!fontSizeLarge ? 'is-active' : ''}`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setFontSizeLarge(true)}
              className={`entry-detail-size-btn ${fontSizeLarge ? 'is-active' : ''}`}
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
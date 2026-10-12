import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntry } from '../hooks/useEntries';
import { useExport } from '../hooks/useExport';
import { entriesApi } from '../services/api';
import { formatDate, getEntryTypeLabel } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { EntryEditor } from '../components/diary/EntryEditor';
import { useToast } from '../context/ToastContext';
import { Edit, Trash2, Star, MapPin, Share2, ArrowLeft, Calendar, BookOpen, Globe, Lock, Download, ChevronDown } from 'lucide-react';
import { classNames } from '../utils/helpers';

export const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { entry, loading, error, refresh } = useEntry(id);
  const { exportEntry, exporting } = useExport();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
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

  const handleFavorite = async () => {
    try {
      await entriesApi.toggleFavorite(id, !entry.isFavorite);
      refresh();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handlePin = async () => {
    try {
      await entriesApi.togglePin(id, !entry.isPinned);
      refresh();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleVisibility = async () => {
    const next = entry.visibility === 'public' ? 'private' : 'public';
    if (next === 'public' && !window.confirm('Make this entry PUBLIC? Anyone visiting Explore can read it. Your name is never shown.')) {
      return;
    }
    try {
      await entriesApi.update(id, { visibility: next });
      refresh();
    } catch (err) {
      console.error('Failed to update visibility:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await entriesApi.delete(id);
      navigate('/entries');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', color: 'var(--ink-muted)' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto var(--spacing-lg)' }} />
          <p>Opening entry...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--error)', marginBottom: 'var(--spacing-md)' }}>
          Entry not found
        </h2>
        <p style={{ color: 'var(--ink-muted)', marginBottom: 'var(--spacing-lg)' }}>
          This entry may have been deleted or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate('/entries')} leftIcon={<ArrowLeft size={18} />}>
          Back to Entries
        </Button>
      </div>
    );
  }

  return (
    <div className="entry-detail-page-container">
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <Button variant="subtle" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={18} />}>
            Back
          </Button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-sm)' }}>
              {entry.title || 'Untitled Entry'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={16} />
                {formatDate(entry.entryDate || entry.createdAt, 'DISPLAY')}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={16} />
                {getEntryTypeLabel(entry.type)}
              </span>
              {entry.isPinned && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}><MapPin size={16} /> Pinned</span>}
              {entry.isFavorite && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)' }}><Star size={16} /> Favorite</span>}
              {entry.visibility === 'public' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)' }}><Globe size={16} /> Public</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink-muted)' }}><Lock size={16} /> Private</span>
              )}
            </div>
          </div>
        </div>
        <div className="entry-actions" style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div ref={exportMenuRef} style={{ position: 'relative' }}>
            <Button
              variant="subtle"
              onClick={() => setShowExportMenu(!showExportMenu)}
              leftIcon={<Download size={18} />}
              rightIcon={<ChevronDown size={14} />}
              loading={exporting}
            >
              Export
            </Button>
            {showExportMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  backgroundColor: 'var(--paper)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.12))',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 100,
                  minWidth: '180px',
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
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--accent) 12%, transparent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--ink)';
                    }}
                  >
                    <span>{opt.label}</span>
                    <Download size={14} style={{ opacity: 0.6 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="subtle" onClick={() => setShowEdit(true)} leftIcon={<Edit size={18} />}>
            Edit
          </Button>
          <Button variant="subtle" onClick={handleFavorite} leftIcon={entry.isFavorite ? <Star size={18} fill="currentColor" /> : <Star size={18} />}>
            {entry.isFavorite ? 'Unfavorite' : 'Favorite'}
          </Button>
          <Button variant="subtle" onClick={handlePin} leftIcon={<MapPin size={18} />}>
            {entry.isPinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button variant="subtle" onClick={handleVisibility} leftIcon={entry.visibility === 'public' ? <Lock size={18} /> : <Globe size={18} />}>
            {entry.visibility === 'public' ? 'Make Private' : 'Make Public'}
          </Button>
          <Button variant="subtle" onClick={() => setShowDeleteConfirm(true)} leftIcon={<Trash2 size={18} />} color="red">
            Delete
          </Button>
        </div>

      </header>

      <article style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-xxl)',
      }} className="paper-texture diary-page fade-in">
        <div className="entry-content" style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          lineHeight: 1.55,
          fontSize: '1.1rem',
          color: 'var(--ink)',
          textAlign: 'justify',
          textJustify: 'inter-word',
        }}>
          {entry.content}
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
              {entry.tags.map(tag => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-sm)', fontSize: '0.8rem', color: 'var(--ink-light)' }}>
          <span>Created: {formatDate(entry.createdAt, 'DATETIME')}</span>
          <span>Updated: {formatDate(entry.updatedAt, 'DATETIME')}</span>
        </div>
      </article>

      <ConfirmDialog
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
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
                console.error('Failed to update:', err);
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
import { formatDate, formatRelativeTime, countWords } from '../../utils/helpers';
import { TypeBadge, VisibilityBadge } from '../ui/Badge';
import { Calendar, Star, MoreVertical, Edit, Trash2, Globe, Lock, Eye, Pin } from 'lucide-react';
import { ConfirmDialog } from '../ui/Modal';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context';

export const EntryCard = ({ entry, onEdit, onDelete, onFavorite, onPin, onVisibility, showActions = true, index = 0 }) => {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [fav, setFav] = useState(entry.isFavorite);
  const [pinned, setPinned] = useState(entry.isPinned);
  const [visibility, setVisibility] = useState(entry.visibility || 'private');
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    setFav(entry.isFavorite);
    setPinned(entry.isPinned);
    setVisibility(entry.visibility || 'private');
  }, [entry.isFavorite, entry.isPinned, entry.visibility]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    const prev = fav;
    const next = !prev;
    setFav(next);
    setShowMenu(false);
    try {
      await onFavorite?.(entry, next);
    } catch {
      setFav(prev);
      showError('Failed to update favorite');
    }
  };

  const handlePin = async (e) => {
    e.stopPropagation();
    const prev = pinned;
    const next = !prev;
    setPinned(next);
    setShowMenu(false);
    try {
      await onPin?.(entry, next);
    } catch {
      setPinned(prev);
      showError('Failed to update pin');
    }
  };

  const handleVisibility = async (e) => {
    e.stopPropagation();
    const prev = visibility;
    const next = prev === 'public' ? 'private' : 'public';
    setVisibility(next);
    setShowMenu(false);
    try {
      await onVisibility?.(entry, next);
    } catch {
      setVisibility(prev);
      showError('Failed to update visibility');
    }
  };

  const openMenu = (e) => {
    e.stopPropagation();
    if (showMenu) { setShowMenu(false); return; }
    const rect = btnRef.current.getBoundingClientRect();
    const container = menuRef.current && menuRef.current.closest('.dashboard-main');
    const cRect = container ? container.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    const belowSpace = cRect.bottom - rect.bottom;
    const aboveSpace = rect.top - cRect.top;
    setOpenUp(belowSpace < 360 && aboveSpace > belowSpace);
    setShowMenu(true);
  };

  const words = countWords(entry.content);
  const tags = Array.isArray(entry.tags) ? entry.tags : [];

  return (
    <div
      ref={menuRef}
      className={showMenu ? 'menu-open' : undefined}
      style={{
        position: 'relative',
        zIndex: showMenu ? 10 : 'auto',
      }}
    >
      <article
        onClick={() => navigate(`/entries/${entry._id}`)}
        onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) navigate(`/entries/${entry._id}`); }}
        tabIndex={0}
        role="link"
        aria-label={entry.title ? `Open entry: ${entry.title}` : 'Open entry'}
        className="entry-card paper-texture"
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '14px 16px',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* ── Top row: badges + actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: entry.title || entry.content ? '8px' : '0' }}>
          {/* Left: type badge + status indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
            <TypeBadge type={entry.type} />
            <VisibilityBadge visibility={visibility} />
            {pinned && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                padding: '2px 7px', borderRadius: '999px',
                backgroundColor: 'rgba(185,146,74,0.12)',
                border: '1px solid rgba(185,146,74,0.28)',
                fontSize: '0.68rem', fontWeight: 600,
                color: 'var(--gold)', letterSpacing: '0.04em',
              }}>
                <Pin size={10} fill="currentColor" /> Pinned
              </span>
            )}
            {fav && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                padding: '2px 7px', borderRadius: '999px',
                backgroundColor: 'rgba(185,146,74,0.12)',
                border: '1px solid rgba(185,146,74,0.28)',
                fontSize: '0.68rem', fontWeight: 600,
                color: 'var(--gold)',
              }}>
                <Star size={10} fill="currentColor" />
              </span>
            )}
          </div>

          {/* Right: meta + kebab */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>
              <Calendar size={12} />
              {formatDate(entry.entryDate || entry.createdAt, 'DISPLAY')}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>
              {formatRelativeTime(entry.updatedAt || entry.createdAt)}
            </span>
            {showActions && (
              <button
                ref={btnRef}
                onClick={openMenu}
                className="icon-btn entry-kebab"
                style={{
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--ink-light)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-label="More options"
                aria-expanded={showMenu}
              >
                <MoreVertical size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Title ── */}
        {entry.title && (
          <h3 style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.02rem',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 5px',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {entry.title}
          </h3>
        )}

        {/* ── Content preview ── */}
        <div style={{
          color: 'var(--ink-muted)',
          fontSize: '0.875rem',
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: tags.length > 0 ? '10px' : '0',
        }}>
          {entry.content}
        </div>

        {/* ── Tags + word count ── */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {tags.slice(0, 4).map(tag => (
                <span key={tag} className="entry-tag">#{tag}</span>
              ))}
              {tags.length > 4 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-light)', alignSelf: 'center' }}>
                  +{tags.length - 4}
                </span>
              )}
            </div>
            {words > 0 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-light)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {words} {words === 1 ? 'word' : 'words'}
              </span>
            )}
          </div>
        )}

        {/* word count when no tags */}
        {tags.length === 0 && words > 0 && (
          <div style={{ textAlign: 'right', marginTop: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-light)' }}>
              {words} {words === 1 ? 'word' : 'words'}
            </span>
          </div>
        )}
      </article>

      {/* ── Dropdown menu ── */}
      {showMenu && (
        <div style={{
          position: 'absolute',
          top: openUp ? 'auto' : 'calc(100% + 4px)',
          bottom: openUp ? 'calc(100% + 4px)' : 'auto',
          right: 0,
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          minWidth: '180px',
          padding: '5px',
          zIndex: 100,
          animation: 'scaleIn 0.15s ease',
        }}>
          {[
            { icon: Eye, label: 'Open', action: (e) => { e.stopPropagation(); setShowMenu(false); navigate(`/entries/${entry._id}`); } },
            { icon: Edit, label: 'Edit', action: (e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(entry); } },
          ].map(({ icon: Icon, label, action }) => (
            <button key={label} onClick={action} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--ink)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left' }}>
              <Icon size={14} /> {label}
            </button>
          ))}

          <div className="menu-divider" role="separator" />

          <button onClick={handleFavorite} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: fav ? 'var(--gold)' : 'var(--ink)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left' }}>
            <Star size={14} fill={fav ? 'currentColor' : 'none'} /> {fav ? 'Unfavorite' : 'Favorite'}
          </button>
          <button onClick={handlePin} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: pinned ? 'var(--gold)' : 'var(--ink)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left' }}>
            <Pin size={14} fill={pinned ? 'currentColor' : 'none'} /> {pinned ? 'Unpin' : 'Pin to top'}
          </button>

          <div className="menu-divider" role="separator" />

          <button onClick={handleVisibility} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--ink)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left' }}>
            {visibility === 'public' ? <Lock size={14} /> : <Globe size={14} />}
            {visibility === 'public' ? 'Make Private' : 'Make Public'}
          </button>

          <div className="menu-divider" role="separator" />

          <button onClick={handleDelete} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--error)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left' }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      <ConfirmDialog
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => { onDelete?.(entry._id); setShowDeleteConfirm(false); }}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

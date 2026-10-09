import { formatDate, formatRelativeTime, truncate } from '../../utils/helpers';
import { TypeBadge, FavoriteBadge, PinBadge, VisibilityBadge } from '../ui/Badge';
import { Calendar, Star, MoreVertical, Edit, Trash2, Globe, Lock, Eye, Pin } from 'lucide-react';
import { ConfirmDialog } from '../ui/Modal';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context';

export const EntryCard = ({ entry, onEdit, onDelete, onFavorite, onPin, onVisibility, showActions = true }) => {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setVisibility(prev);
      showError('Failed to update visibility');
    }
  };

  const POPUP_HEIGHT = 390;

  const openMenu = (e) => {
    e.stopPropagation();
    if (showMenu) {
      setShowMenu(false);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    const container = menuRef.current && menuRef.current.closest('.dashboard-main');
    const cRect = container ? container.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    const belowSpace = cRect.bottom - rect.bottom;
    const aboveSpace = rect.top - cRect.top;
    setOpenUp(belowSpace < POPUP_HEIGHT && aboveSpace > belowSpace);
    setShowMenu(true);
  };

  const menuItemStyle = (color) => ({
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
    width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)',
    border: 'none', background: 'transparent', color: color || 'var(--ink)',
    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
    fontSize: '0.9rem', fontFamily: 'inherit', textAlign: 'left',
  });

  return (
    <div ref={menuRef} style={{ position: 'relative', zIndex: showMenu ? 50 : 'auto' }}>
      <article
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-lg)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        }}
        className="paper-texture diary-page fade-in entry-card"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', alignItems: 'center' }}>
          <TypeBadge type={entry.type} />
          {entry.isPinned && <PinBadge isPinned={entry.isPinned} />}
          {entry.isFavorite && <FavoriteBadge isFavorite={entry.isFavorite} />}
          {(entry.visibility === 'public' || entry.visibility === 'private') && <VisibilityBadge visibility={entry.visibility} />}
        </div>

        {entry.title && (
          <h3 style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.12rem',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 var(--spacing-sm)',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
          }}>
            {entry.title}
          </h3>
        )}

        <div style={{
          color: 'var(--ink-muted)',
          fontSize: '0.92rem',
          lineHeight: 1.5,
          marginBottom: 'var(--spacing-md)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {truncate(entry.content, 200)}
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)', alignItems: 'center' }}>
            {entry.tags.slice(0, 5).map(tag => (
              <span key={tag} className="tag-chip">#{tag}</span>
            ))}
            {entry.tags.length > 5 && (
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--ink-light)',
              }}>
                +{entry.tags.length - 5} more
              </span>
            )}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-sm)',
          paddingTop: 'var(--spacing-md)',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: '0.84rem', color: 'var(--ink-light)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {formatDate(entry.entryDate || entry.createdAt, 'DISPLAY')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>•</span>
              {formatRelativeTime(entry.updatedAt || entry.createdAt)}
            </span>
          </div>

          {showActions && (
            <div style={{ position: 'relative' }}>
              <button
                ref={btnRef}
                onClick={openMenu}
                className="icon-btn"
                style={{
                  padding: 'var(--spacing-xs)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--ink-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="More options"
                aria-expanded={showMenu}
              >
                <MoreVertical size={18} />
              </button>
            </div>
          )}
        </div>
      </article>

      {showMenu && (
        <div style={{
          position: 'absolute',
          top: openUp ? 'auto' : 'calc(100% + var(--spacing-xs))',
          bottom: openUp ? 'calc(100% + var(--spacing-xs))' : 'auto',
          right: 0,
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          minWidth: '190px',
          padding: 'var(--spacing-xs)',
          zIndex: 'calc(var(--z-sticky) - 1)',
          animation: 'scaleIn 0.15s ease',
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(false); navigate(`/entries/${entry._id}`); }}
            className="menu-item"
            style={menuItemStyle()}
          >
            <Eye size={16} /> Open
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(entry); }}
            className="menu-item"
            style={menuItemStyle()}
          >
            <Edit size={16} /> Edit
          </button>

          <div className="menu-divider" role="separator" />

          <button
            onClick={handleFavorite}
            className="menu-item"
            style={menuItemStyle(fav ? 'var(--gold)' : 'var(--ink)')}
          >
            <Star size={16} fill={fav ? 'currentColor' : 'none'} /> {fav ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
          <button
            onClick={handlePin}
            className="menu-item"
            style={menuItemStyle(pinned ? 'var(--gold)' : 'var(--ink)')}
          >
            <Pin size={16} fill={pinned ? 'currentColor' : 'none'} /> {pinned ? 'Unpin' : 'Pin to top'}
          </button>

          <div className="menu-divider" role="separator" />

          <button
            onClick={handleVisibility}
            className="menu-item"
            style={menuItemStyle()}
          >
            {visibility === 'public' ? <Lock size={16} /> : <Globe size={16} />} {visibility === 'public' ? 'Make Private' : 'Make Public'}
          </button>

          <div className="menu-divider" role="separator" />

          <button
            onClick={handleDelete}
            className="menu-item"
            style={menuItemStyle('var(--error)')}
          >
            <Trash2 size={16} /> Delete
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

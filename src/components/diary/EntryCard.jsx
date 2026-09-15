import { formatDate, formatRelativeTime, getEntryTypeLabel, truncate } from '../../utils/helpers';
import { TypeBadge, FavoriteBadge, PinBadge, VisibilityBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Calendar, Star, MapPin, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import { Modal, ConfirmDialog } from '../ui/Modal';
import { useState, useEffect, useRef } from 'react';

export const EntryCard = ({ entry, onEdit, onDelete, onFavorite, onPin, showActions = true }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

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

  const POPUP_HEIGHT = 130;

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

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
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
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
          <TypeBadge type={entry.type} />
          {entry.isPinned && <PinBadge isPinned={entry.isPinned} />}
          {entry.isFavorite && <FavoriteBadge isFavorite={entry.isFavorite} />}
          {(entry.visibility === 'public' || entry.visibility === 'private') && <VisibilityBadge visibility={entry.visibility} />}
        </div>

        {entry.title && (
          <h3 style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.15rem',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 var(--spacing-sm)',
            lineHeight: 1.3,
          }}>
            {entry.title}
          </h3>
        )}

        <div style={{
          color: 'var(--ink-muted)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          marginBottom: 'var(--spacing-md)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {truncate(entry.content, 200)}
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: '0.85rem', color: 'var(--ink-light)' }}>
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
          minWidth: '160px',
          padding: 'var(--spacing-xs)',
          zIndex: 'calc(var(--z-sticky) - 1)',
          animation: 'scaleIn 0.15s ease',
        }}>
          <button
            onClick={() => { onEdit(entry); setShowMenu(false); }}
            className="menu-item"
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
              width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)',
              border: 'none', background: 'transparent', color: 'var(--ink)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              fontSize: '0.9rem', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Edit size={16} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="menu-item"
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
              width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)',
              border: 'none', background: 'transparent', color: 'var(--error)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              fontSize: '0.9rem', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}

      <ConfirmDialog
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => { onDelete(entry._id); setShowDeleteConfirm(false); }}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
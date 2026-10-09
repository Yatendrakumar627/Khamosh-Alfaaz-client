import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Lock, Tag, Star, MoreVertical, Edit, Trash2, Pin, Eye } from 'lucide-react';
import { entriesApi } from '../../services/api';
import { useToast } from '../../context';
import { ConfirmDialog } from '../ui/Modal';

export const DashboardEntryCard = ({ entry, onDelete, index }) => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fav, setFav] = useState(entry.isFavorite);
  const [pinned, setPinned] = useState(entry.isPinned);
  const [visibility, setVisibility] = useState(entry.visibility || 'private');
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const raw = entry.entryDate || entry.createdAt;
  const d = new Date(raw);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const year = String(d.getFullYear());
  const tags = Array.isArray(entry.tags) ? entry.tags : [];

  const handleFavorite = async (e) => {
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    try {
      await entriesApi.toggleFavorite(entry._id, next);
    } catch (err) {
      setFav(fav);
      showError('Failed to update favorite');
    }
  };

  const handlePin = async (e) => {
    e.stopPropagation();
    const next = !pinned;
    setPinned(next);
    setShowMenu(false);
    try {
      await entriesApi.togglePin(entry._id, next);
      onDelete?.(entry._id);
    } catch (err) {
      setPinned(pinned);
      showError('Failed to update pin');
    }
  };

  const handleVisibility = async (e) => {
    e.stopPropagation();
    const next = visibility === 'public' ? 'private' : 'public';
    const prev = visibility;
    setVisibility(next);
    setShowMenu(false);
    try {
      await entriesApi.update(entry._id, { visibility: next });
      onDelete?.(entry._id);
    } catch (err) {
      setVisibility(prev);
      showError('Failed to update visibility');
    }
  };

  const handleDelete = async () => {
    try {
      await entriesApi.delete(entry._id);
      success('Entry deleted.');
      onDelete?.(entry._id);
    } catch (err) {
      showError('Failed to delete entry');
    }
  };

  const POPUP_HEIGHT = 320;

  const openMenu = (e) => {
    e.stopPropagation();
    if (showMenu) {
      setShowMenu(false);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    const container = menuRef.current && menuRef.current.closest('.dashboard-main');
    const cRect = container ? container.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    const viewportBottom = window.innerHeight;
    const belowSpace = Math.min(viewportBottom, cRect.bottom) - rect.bottom;
    const aboveSpace = rect.top - Math.max(0, cRect.top);
    setOpenUp(belowSpace < POPUP_HEIGHT && aboveSpace > belowSpace);
    setShowMenu(true);
  };

  return (
    <div
      ref={menuRef}
      className={showMenu ? 'menu-open' : undefined}
      style={{
        position: 'relative',
        zIndex: showMenu ? 50 : 1,
        animation: index !== undefined ? `dashCardIn 0.35s var(--ease-out) ${index * 0.06}s both` : undefined,
      }}
    >
      <article
        className="dashboard-entry-card paper-texture"
        onClick={() => navigate(`/entries/${entry._id}`)}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/entries/${entry._id}`); }}
        role="link"
        tabIndex={0}
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: '12px',
          minHeight: '96px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {/* Date block */}
        <div
          className="dash-date"
          style={{
            width: '62px',
            height: '76px',
            flexShrink: 0,
            borderRadius: '6px',
            backgroundColor: 'var(--paper-dark)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-family-ui)',
            fontSize: '1.6rem',
            fontWeight: 600,
            lineHeight: 1,
            color: 'var(--gold)',
          }}>
            {day}
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink)',
            marginTop: '2px',
          }}>
            {month}
          </span>
          <span style={{ fontSize: '0.64rem', color: 'var(--ink-muted)', marginTop: '1px' }}>
            {year}
          </span>
        </div>

        {/* Content */}
        <div className="dash-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px', padding: '2px 0' }}>
          {entry.title ? (
            <h3 style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '0.98rem',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {entry.title}
            </h3>
          ) : (
            <p style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '0.92rem',
              fontWeight: 500,
              fontStyle: 'italic',
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {entry.content}
            </p>
          )}

          <p style={{
            margin: 0,
            fontSize: '0.8rem',
            color: 'var(--ink-muted)',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {entry.content}
          </p>
        </div>

        {/* Right rail — icons + 3-dot menu */}
        <div className="dash-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0, width: '30px', padding: '2px 0' }}>
          <span
            title={visibility === 'public' ? 'Public — visible in Explore' : 'Private — only you can see'}
            style={{ color: visibility === 'public' ? 'var(--gold)' : 'var(--ink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {visibility === 'public' ? <Globe size={13} /> : <Lock size={13} />}
          </span>

          {tags.length > 0 && (
            <span
              title={`Tags: ${tags.join(', ')}`}
              style={{ color: 'var(--ink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Tag size={13} />
            </span>
          )}

          <button
            ref={btnRef}
            type="button"
            onClick={openMenu}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label="More options"
            aria-expanded={showMenu}
            className="icon-btn"
            style={{
              marginTop: 'auto',
              padding: '5px',
              background: 'transparent',
              color: 'var(--ink-light)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoreVertical size={15} />
          </button>
        </div>
      </article>

      {showMenu && (
        <div style={{
          position: 'absolute',
          top: openUp ? 'auto' : 'calc(100% + 4px)',
          bottom: openUp ? 'calc(100% + 4px)' : 'auto',
          right: '8px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          minWidth: '180px',
          padding: '6px',
          zIndex: 100,
          animation: 'scaleIn 0.15s ease',
        }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/entries/${entry._id}`); }}
            className="menu-item"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '9px 12px',
              border: 'none', background: 'transparent', color: 'var(--ink)',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Eye size={15} /> Open
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/entries/${entry._id}/edit?from=${encodeURIComponent('/dashboard')}`); }}
            className="menu-item"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '9px 12px',
              border: 'none', background: 'transparent', color: 'var(--ink)',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Edit size={15} /> Edit
          </button>

          <div className="menu-divider" role="separator" />

          <button
            type="button"
            onClick={(e) => { handleFavorite(e); setShowMenu(false); }}
            className="menu-item"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '9px 12px',
              border: 'none', background: 'transparent',
              color: fav ? 'var(--gold)' : 'var(--ink)',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Star size={15} fill={fav ? 'currentColor' : 'none'} /> {fav ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
          <button
            type="button"
            onClick={handlePin}
            className="menu-item"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '9px 12px',
              border: 'none', background: 'transparent',
              color: pinned ? 'var(--gold)' : 'var(--ink)',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Pin size={15} fill={pinned ? 'currentColor' : 'none'} /> {pinned ? 'Unpin' : 'Pin to top'}
          </button>

          <div className="menu-divider" role="separator" />

          <button
            type="button"
            onClick={handleVisibility}
            className="menu-item"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '9px 12px',
              border: 'none', background: 'transparent', color: 'var(--ink)',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            {visibility === 'public' ? <Lock size={15} /> : <Globe size={15} />} {visibility === 'public' ? 'Make Private' : 'Make Public'}
          </button>

          <div className="menu-divider" role="separator" />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowDeleteConfirm(true); }}
            className="menu-item"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '9px 12px',
              border: 'none', background: 'transparent', color: 'var(--error)',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}

      <ConfirmDialog
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default DashboardEntryCard;
import { useState, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Lock, Star, MoreVertical, Edit, Trash2, Pin, Eye, BookOpen, Clock } from 'lucide-react';
import { entriesApi } from '../../services/api';
import { useToast } from '../../context';
import { ConfirmDialog } from '../ui/Modal';
import { TypeBadge } from '../ui/Badge';
import { countWords, formatRelativeTime, formatDate } from '../../utils/helpers';

export const DashboardEntryCard = memo(({ entry, onDelete, index }) => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fav, setFav] = useState(Boolean(entry.isFavorite));
  const [pinned, setPinned] = useState(Boolean(entry.isPinned));
  const [visibility, setVisibility] = useState(entry.visibility || 'private');
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    setFav(Boolean(entry.isFavorite));
    setPinned(Boolean(entry.isPinned));
    setVisibility(entry.visibility || 'private');
  }, [entry.isFavorite, entry.isPinned, entry.visibility]);

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
  const validDate = !isNaN(d.getTime());
  const day = validDate ? String(d.getDate()).padStart(2, '0') : '--';
  const month = validDate ? d.toLocaleDateString('en-US', { month: 'short' }) : '---';
  const year = validDate ? String(d.getFullYear()) : '----';
  const tags = Array.isArray(entry.tags) ? entry.tags.filter(Boolean) : [];
  const words = countWords(entry.content);
  const timeDisplay = validDate ? formatRelativeTime(raw) : '';

  const handleFavorite = async (e) => {
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    try {
      await entriesApi.toggleFavorite(entry._id, next);
    } catch {
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
    } catch {
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
    } catch {
      setVisibility(prev);
      showError('Failed to update visibility');
    }
  };

  const handleDelete = async () => {
    try {
      await entriesApi.delete(entry._id);
      success('Entry deleted.');
      onDelete?.(entry._id);
    } catch {
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
    const rect = btnRef.current ? btnRef.current.getBoundingClientRect() : null;
    if (rect) {
      const container = menuRef.current && menuRef.current.closest('.dashboard-main');
      const cRect = container ? container.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
      const viewportBottom = window.innerHeight;
      const belowSpace = Math.min(viewportBottom, cRect.bottom) - rect.bottom;
      const aboveSpace = rect.top - Math.max(0, cRect.top);
      setOpenUp(belowSpace < POPUP_HEIGHT && aboveSpace > belowSpace);
    }
    setShowMenu(true);
  };

  return (
    <div
      className={`dash-card-wrapper ${showMenu ? 'menu-open' : ''}`}
      style={{
        position: 'relative',
        zIndex: showMenu ? 50 : 1,
        animation: index !== undefined ? `dashCardIn 0.35s var(--ease-out) ${Math.min(index * 0.05, 0.3)}s both` : undefined,
      }}
    >
      <article
        className={`dashboard-entry-card paper-texture ${pinned ? 'is-pinned' : ''}`}
        onClick={() => navigate(`/entries/${entry._id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') navigate(`/entries/${entry._id}`);
        }}
        role="link"
        tabIndex={0}
        aria-label={entry.title ? `Open entry: ${entry.title}` : 'Open entry'}
      >
        {/* Date block */}
        <div className="dash-date" aria-label={`Date: ${month} ${day}, ${year}`}>
          <span className="dash-date-day">{day}</span>
          <span className="dash-date-month">{month}</span>
          <span className="dash-date-year">{year}</span>
        </div>

        {/* Content body */}
        <div className="dash-content">
          {/* Header row: Category + Pinned + Title + Actions */}
          <div className="dash-card-top-row">
            <div className="dash-card-title-group">
              <TypeBadge type={entry.type || 'diary'} />
              {pinned && (
                <span className="dash-pinned-badge" title="Pinned to top">
                  <Pin size={10} fill="currentColor" aria-hidden="true" />
                  <span>Pinned</span>
                </span>
              )}
              <h3 className={`dash-card-title ${!entry.title ? 'is-untitled' : ''}`}>
                {entry.title || 'Untitled reflection'}
              </h3>
            </div>

            {/* Actions toolbar */}
            <div className="dash-actions-bar" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={`dash-action-btn ${fav ? 'is-active' : ''}`}
                onClick={handleFavorite}
                title={fav ? 'Favorited (click to remove)' : 'Add to favorites'}
                aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star size={14} fill={fav ? 'currentColor' : 'none'} />
              </button>

              <button
                type="button"
                className={`dash-action-btn ${visibility === 'public' ? 'is-public' : ''}`}
                onClick={handleVisibility}
                title={visibility === 'public' ? 'Public (visible in Explore)' : 'Private (only you)'}
                aria-label={visibility === 'public' ? 'Public entry' : 'Private entry'}
              >
                {visibility === 'public' ? <Globe size={14} /> : <Lock size={14} />}
              </button>

              <div ref={menuRef} style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  ref={btnRef}
                  type="button"
                  onClick={openMenu}
                  onKeyDown={(e) => e.stopPropagation()}
                  aria-label="More options"
                  aria-expanded={showMenu}
                  className="dash-action-btn"
                >
                  <MoreVertical size={14} />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`dash-menu-dropdown ${openUp ? 'open-up' : 'open-down'}`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        navigate(`/entries/${entry._id}`);
                      }}
                      className="menu-item"
                    >
                      <Eye size={15} style={{ flexShrink: 0 }} />
                      <span>Open</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        navigate(`/entries/${entry._id}/edit?from=${encodeURIComponent('/dashboard')}`);
                      }}
                      className="menu-item"
                    >
                      <Edit size={15} style={{ flexShrink: 0 }} />
                      <span>Edit</span>
                    </button>

                    <div className="menu-divider" role="separator" />

                    <button
                      type="button"
                      onClick={(e) => {
                        handleFavorite(e);
                        setShowMenu(false);
                      }}
                      className={`menu-item ${fav ? 'is-active' : ''}`}
                    >
                      <Star size={15} fill={fav ? 'currentColor' : 'none'} style={{ flexShrink: 0 }} />
                      <span>{fav ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        handlePin(e);
                        setShowMenu(false);
                      }}
                      className={`menu-item ${pinned ? 'is-active' : ''}`}
                    >
                      <Pin size={15} fill={pinned ? 'currentColor' : 'none'} style={{ flexShrink: 0 }} />
                      <span>{pinned ? 'Unpin' : 'Pin to top'}</span>
                    </button>

                    <div className="menu-divider" role="separator" />

                    <button
                      type="button"
                      onClick={(e) => {
                        handleVisibility(e);
                        setShowMenu(false);
                      }}
                      className="menu-item"
                    >
                      {visibility === 'public' ? (
                        <Lock size={15} style={{ flexShrink: 0 }} />
                      ) : (
                        <Globe size={15} style={{ flexShrink: 0 }} />
                      )}
                      <span>{visibility === 'public' ? 'Make Private' : 'Make Public'}</span>
                    </button>

                    <div className="menu-divider" role="separator" />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="menu-item is-danger"
                    >
                      <Trash2 size={15} style={{ flexShrink: 0 }} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Snippet text */}
          <p className="dash-card-snippet">
            {entry.content}
          </p>

          {/* Footer metadata: Word count, relative time, tags */}
          <div className="dash-card-meta-row">
            <div className="dash-card-meta-left">
              <span className="dash-meta-item">
                <BookOpen size={12} className="dash-meta-icon" />
                <span>{words} {words === 1 ? 'word' : 'words'}</span>
              </span>
              {timeDisplay && (
                <>
                  <span className="dash-meta-bullet" aria-hidden="true">•</span>
                  <span className="dash-meta-item" title={formatDate(raw, 'DATETIME')}>
                    <Clock size={12} className="dash-meta-icon" />
                    <span>{timeDisplay}</span>
                  </span>
                </>
              )}
            </div>

            {tags.length > 0 && (
              <div className="dash-card-tags" onClick={(e) => e.stopPropagation()}>
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="dash-tag-pill" title={`Tag: #${tag}`}>
                    #{tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="dash-tag-pill-more" title={`+${tags.length - 3} more tags`}>
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
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
    </div>
  );
});

export default DashboardEntryCard;

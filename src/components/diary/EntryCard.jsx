import { formatDate, formatRelativeTime, countWords } from '../../utils/helpers';
import { TypeBadge, VisibilityBadge } from '../ui/Badge';
import { Calendar, Star, MoreVertical, Edit, Trash2, Globe, Lock, Eye, Pin, BookOpen } from 'lucide-react';
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
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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
    const rect = btnRef.current ? btnRef.current.getBoundingClientRect() : null;
    if (rect) {
      const container = menuRef.current && menuRef.current.closest('.dashboard-main');
      const cRect = container ? container.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
      const viewportBottom = window.innerHeight;
      const belowSpace = Math.min(viewportBottom, cRect.bottom) - rect.bottom;
      const aboveSpace = rect.top - Math.max(0, cRect.top);
      setOpenUp(belowSpace < 270 && aboveSpace > belowSpace);
    }
    setShowMenu(true);
  };

  const words = countWords(entry.content);
  const tags = Array.isArray(entry.tags) ? entry.tags : [];

  return (
    <div
      className={showMenu ? 'menu-open' : undefined}
      style={{
        position: 'relative',
        zIndex: showMenu ? 50 : 1,
        animation: index !== undefined ? `dashCardIn 0.3s var(--ease-out) ${Math.min(index * 0.04, 0.3)}s both` : undefined,
      }}
    >
      <article
        onClick={() => navigate(`/entries/${entry._id}`)}
        onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) navigate(`/entries/${entry._id}`); }}
        tabIndex={0}
        role="link"
        aria-label={entry.title ? `Open entry: ${entry.title}` : 'Open entry'}
        className="entry-card paper-texture"
      >
        {/* ── Top row: badges + actions ── */}
        <div className="entry-card-top-row" style={{ marginBottom: entry.title || entry.content ? '8px' : '0' }}>
          {/* Left: type badge + status indicators */}
          <div className="entry-card-badges">
            <TypeBadge type={entry.type} />
            <VisibilityBadge visibility={visibility} />
            {pinned && (
              <span className="entry-card-pin-pill" style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                padding: '2px 8px', borderRadius: '9999px',
                backgroundColor: 'rgba(223, 178, 100, 0.12)',
                border: '1px solid rgba(223, 178, 100, 0.28)',
                fontSize: '0.67rem', fontWeight: 600,
                color: 'var(--gold)', letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                <Pin size={10} fill="currentColor" /> Pinned
              </span>
            )}
            {fav && (
              <span className="entry-card-fav-pill" style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                padding: '2px 7px', borderRadius: '9999px',
                backgroundColor: 'rgba(223, 178, 100, 0.12)',
                border: '1px solid rgba(223, 178, 100, 0.28)',
                fontSize: '0.67rem', fontWeight: 600,
                color: 'var(--gold)',
              }}>
                <Star size={10} fill="currentColor" />
              </span>
            )}
          </div>

          {/* Right: meta + kebab */}
          <div className="entry-card-meta">
            <span className="entry-card-date">
              <Calendar size={12} style={{ color: 'var(--gold)', opacity: 0.85 }} />
              <span>{formatDate(entry.entryDate || entry.createdAt, 'SHORT')}</span>
            </span>
            <span className="entry-card-relative-time" style={{ fontSize: '0.72rem', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>
              · {formatRelativeTime(entry.updatedAt || entry.createdAt)}
            </span>
            {showActions && (
              <div ref={menuRef} style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  ref={btnRef}
                  type="button"
                  onClick={openMenu}
                  className="entry-kebab"
                  aria-label="More options"
                  aria-expanded={showMenu}
                >
                  <MoreVertical size={16} />
                </button>

                {/* ── Dropdown menu anchored directly to 3-dots button ── */}
                {showMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: openUp ? 'auto' : 'calc(100% + 4px)',
                      bottom: openUp ? 'calc(100% + 4px)' : 'auto',
                      right: 0,
                      backgroundColor: 'var(--paper)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      minWidth: '175px',
                      width: 'max-content',
                      padding: '5px',
                      zIndex: 100,
                      animation: 'scaleIn 0.15s ease',
                    }}
                  >
                    {[
                      { icon: Eye, label: 'Open', action: (e) => { e.stopPropagation(); setShowMenu(false); navigate(`/entries/${entry._id}`); } },
                      { icon: Edit, label: 'Edit', action: (e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(entry); } },
                    ].map(({ icon: Icon, label, action }) => (
                      <button key={label} onClick={action} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--ink)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <Icon size={14} style={{ flexShrink: 0 }} /> {label}
                      </button>
                    ))}

                    <div className="menu-divider" role="separator" />

                    <button onClick={handleFavorite} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: fav ? 'var(--gold)' : 'var(--ink)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <Star size={14} fill={fav ? 'currentColor' : 'none'} style={{ flexShrink: 0 }} /> {fav ? 'Unfavorite' : 'Favorite'}
                    </button>
                    <button onClick={handlePin} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: pinned ? 'var(--gold)' : 'var(--ink)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <Pin size={14} fill={pinned ? 'currentColor' : 'none'} style={{ flexShrink: 0 }} /> {pinned ? 'Unpin' : 'Pin to top'}
                    </button>

                    <div className="menu-divider" role="separator" />

                    <button onClick={handleVisibility} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--ink)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      {visibility === 'public' ? <Lock size={14} style={{ flexShrink: 0 }} /> : <Globe size={14} style={{ flexShrink: 0 }} />}
                      {visibility === 'public' ? 'Make Private' : 'Make Public'}
                    </button>

                    <div className="menu-divider" role="separator" />

                    <button onClick={handleDelete} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: 'var(--error)', borderRadius: '7px', cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <Trash2 size={14} style={{ flexShrink: 0 }} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Title ── */}
        {entry.title && (
          <h3 className="entry-card-title">
            {entry.title}
          </h3>
        )}

        {/* ── Content preview ── */}
        <div
          className="entry-card-excerpt"
          style={{
            fontStyle: entry.type === 'quote' ? 'italic' : 'normal',
            fontFamily: entry.type === 'quote' ? 'var(--font-family-heading)' : 'inherit',
            fontSize: entry.type === 'quote' ? '0.96rem' : '0.875rem',
            color: entry.type === 'quote' ? 'var(--ink)' : 'var(--ink-muted)',
            WebkitLineClamp: entry.type === 'quote' ? 3 : 2,
            marginBottom: (tags.length > 0 || words > 0) ? '10px' : '0',
          }}
        >
          {entry.content}
        </div>

        {/* ── Tags + word count ── */}
        {(tags.length > 0 || words > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {tags.slice(0, 3).map(tag => (
                  <span key={tag} className="entry-tag">#{tag}</span>
                ))}
                {tags.length > 3 && (
                  <span style={{ fontSize: '0.70rem', color: 'var(--ink-light)', alignSelf: 'center', fontWeight: 500 }}>
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            )}
            {words > 0 && (
              <span className="entry-card-words" style={{ marginLeft: tags.length === 0 ? 'auto' : undefined }}>
                <BookOpen size={11} style={{ opacity: 0.7 }} />
                <span>{words} {words === 1 ? 'word' : 'words'}</span>
              </span>
            )}
          </div>
        )}
      </article>

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

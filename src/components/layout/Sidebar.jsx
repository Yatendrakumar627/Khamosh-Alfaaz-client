import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Feather, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { MAIN_NAV_ITEMS, CATEGORY_NAV_ITEMS, TOOL_NAV_ITEMS } from '../../routes';
import { getNavIcon } from '../../constants/navIcons';
import { statisticsApi } from '../../services/api';
import favicon from '../../assets/favicon.png';
import { classNames } from '../../utils/helpers';

export const Sidebar = () => {
  const { expanded, isOpen, toggle, setHovered } = useSidebar();
  const location = useLocation();
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(() => {
    statisticsApi.get()
      .then((res) => {
        if (res.data?.ok && res.data?.statistics) {
          setStats(res.data.statistics);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStats();
    const handleUpdate = () => fetchStats();
    window.addEventListener('entries-updated', handleUpdate);
    return () => {
      window.removeEventListener('entries-updated', handleUpdate);
    };
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [location.pathname, fetchStats]);

  const getItemCount = useCallback((item) => {
    if (!stats) return null;
    if (item.path === '/entries') {
      return stats.totalEntries ?? 0;
    }
    if (item.path === '/favorites') {
      return stats.favorites ?? 0;
    }
    if (item.type) {
      const typeKey = String(item.type).toLowerCase();
      const match = stats.byType?.find((t) => (t.type || '').toLowerCase() === typeKey);
      return match ? match.count : 0;
    }
    return null;
  }, [stats]);

  const sidebarWidth = expanded ? '260px' : '60px';

  const renderNavGroup = (items, groupLabel = null) => (
    <div style={{ marginBottom: expanded ? '16px' : '10px' }}>
      {/* Section Header */}
      {expanded && groupLabel && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px 6px',
            fontSize: '0.64rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--gold)',
            opacity: 0.88,
          }}
        >
          <span>{groupLabel}</span>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, rgba(223, 178, 100, 0.22) 0%, transparent 100%)',
            }}
          />
        </div>
      )}

      {!expanded && groupLabel && (
        <div
          style={{
            width: '24px',
            height: '1px',
            backgroundColor: 'var(--border)',
            margin: '8px auto',
            opacity: 0.5,
          }}
        />
      )}

      {/* Item List */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {items.map((item) => {
          const Icon = getNavIcon(item.icon);
          const isActive = !item.noActive && location.pathname === item.path;
          const count = getItemCount(item);
          const hasCount = count !== null && count !== undefined;

          return (
            <li key={item.path} style={{ margin: 0, padding: 0 }}>
              <div className="sidebar-item-wrapper">
                <NavLink
                  to={item.path}
                  style={() => ({
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: expanded ? '11px' : 0,
                    padding: expanded ? '8px 12px' : 0,
                    width: expanded ? '100%' : '40px',
                    height: expanded ? 'auto' : '40px',
                    minHeight: expanded ? '38px' : '40px',
                    borderRadius: expanded ? '10px' : '11px',
                    color: isActive ? 'var(--gold-light)' : 'var(--ink-muted)',
                    backgroundColor: isActive
                      ? expanded
                        ? 'rgba(223, 178, 100, 0.12)'
                        : 'rgba(223, 178, 100, 0.14)'
                      : 'transparent',
                    textDecoration: 'none',
                    justifyContent: expanded ? 'flex-start' : 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    border: isActive
                      ? '1px solid rgba(223, 178, 100, 0.25)'
                      : '1px solid transparent',
                    boxShadow: isActive
                      ? '0 2px 10px rgba(0, 0, 0, 0.2)'
                      : 'none',
                    fontWeight: isActive ? 600 : 500,
                  })}
                  className={classNames(
                    'sidebar-link',
                    expanded ? 'expanded' : 'collapsed',
                    isActive && 'active',
                  )}
                  aria-label={`${item.label}${hasCount ? ` (${count})` : ''}`}
                >
                  {/* Left accent bar for active item */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: expanded ? '15%' : '18%',
                        height: expanded ? '70%' : '64%',
                        width: '3.5px',
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: 'var(--gold)',
                        boxShadow: '0 0 8px rgba(223, 178, 100, 0.6)',
                      }}
                    />
                  )}

                  <Icon
                    size={18}
                    style={{
                      flexShrink: 0,
                      color: isActive ? 'var(--gold)' : 'var(--ink-light)',
                      transition: 'color 0.2s ease, transform 0.2s ease',
                    }}
                  />

                  {expanded && (
                    <span
                      style={{
                        fontSize: '0.86rem',
                        fontFamily: 'var(--font-family-ui)',
                        letterSpacing: '0.01em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginRight: hasCount ? '6px' : 0,
                      }}
                    >
                      {item.label}
                    </span>
                  )}

                  {expanded && hasCount && (
                    <span className="sidebar-count-badge">
                      {count}
                    </span>
                  )}

                  {!expanded && hasCount && count > 0 && (
                    <span className="sidebar-collapsed-badge">
                      {count > 999 ? '999+' : count}
                    </span>
                  )}
                </NavLink>

                {/* Floating Tooltip in collapsed mode */}
                {!expanded && (
                  <span className="sidebar-tooltip">
                    {item.label}{hasCount ? ` (${count})` : ''}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <aside
      className="sidebar-fixed sidebar-texture"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: sidebarWidth,
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease',
        zIndex: 100,
        overflow: 'hidden',
        boxShadow: expanded ? '4px 0 24px rgba(0, 0, 0, 0.25)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Navigation sidebar"
    >
      {/* Brand Header */}
      <div
        style={{
          padding: expanded ? '16px 14px' : '16px 10px',
          borderBottom: '1px solid var(--border)',
          height: '76px',
          minHeight: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          gap: '10px',
          boxSizing: 'border-box',
        }}
      >
        {expanded ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(223, 178, 100, 0.28) 0%, rgba(223, 178, 100, 0.08) 100%)',
                  border: '1px solid rgba(223, 178, 100, 0.32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                }}
              >
                <img src={favicon} alt="Khamosh Alfaaz" style={{ width: 20, height: 20, borderRadius: 3 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-family-heading)',
                    fontSize: '1.22rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Khamosh Alfaaz
                </h1>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: '0.72rem',
                    color: 'var(--ink-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    fontFamily: 'var(--font-family-ui)',
                    letterSpacing: '0.01em',
                  }}
                >
                  Jo keh nahi paaye, likh do.
                </p>
              </div>
            </div>

            {/* Quick Pin / Collapse Toggle Button */}
            <button
              type="button"
              onClick={toggle}
              title={isOpen ? 'Collapse sidebar' : 'Pin sidebar'}
              aria-label={isOpen ? 'Collapse sidebar' : 'Pin sidebar'}
              style={{
                background: 'rgba(223, 178, 100, 0.06)',
                border: '1px solid rgba(223, 178, 100, 0.16)',
                borderRadius: '8px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(223, 178, 100, 0.16)';
                e.currentTarget.style.color = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(223, 178, 100, 0.06)';
                e.currentTarget.style.color = 'var(--ink-muted)';
              }}
            >
              <ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <div className="sidebar-item-wrapper">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(223, 178, 100, 0.22) 0%, rgba(223, 178, 100, 0.06) 100%)',
                border: '1px solid rgba(223, 178, 100, 0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onClick={toggle}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <img src={favicon} alt="Khamosh Alfaaz" style={{ width: 20, height: 20, borderRadius: 3 }} />
            </div>
            <span className="sidebar-tooltip">
              Khamosh Alfaaz
            </span>
          </div>
        )}
      </div>

      {/* Navigation Scroll Area */}
      <nav
        className={expanded ? 'sidebar-scroll' : 'sidebar-collapsed-nav'}
        style={{
          flex: 1,
          padding: expanded ? '12px 10px' : '12px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderNavGroup(MAIN_NAV_ITEMS, null)}
        {renderNavGroup(CATEGORY_NAV_ITEMS, 'Categories & Spaces')}
        {renderNavGroup(TOOL_NAV_ITEMS, 'Tools')}
      </nav>

      {/* Bottom Inspirational "Daily Whisper" Card */}
      <div
        style={{
          padding: expanded ? '14px 12px' : '12px 0',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--paper-darker)',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {expanded ? (
          <div
            style={{
              width: '100%',
              padding: '11px 13px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(223, 178, 100, 0.08) 0%, rgba(0, 0, 0, 0.12) 100%)',
              border: '1px solid rgba(223, 178, 100, 0.18)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
                color: 'var(--gold)',
                opacity: 0.95,
              }}
            >
              <Feather size={13} />
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Daily Whisper
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-family-heading)',
                fontSize: '0.90rem',
                lineHeight: 1.45,
                color: 'var(--ink)',
                fontStyle: 'italic',
              }}
            >
              &ldquo;A calmer you is a brighter you.&rdquo;
            </p>
          </div>
        ) : (
          <div className="sidebar-item-wrapper">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid rgba(223, 178, 100, 0.22)',
                backgroundColor: 'rgba(223, 178, 100, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(223, 178, 100, 0.14)';
                e.currentTarget.style.transform = 'scale(1.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(223, 178, 100, 0.06)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Feather size={16} />
            </div>
            <span className="sidebar-tooltip">
              Daily Whisper: &ldquo;A calmer you is a brighter you.&rdquo;
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
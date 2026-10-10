import { NavLink, useLocation } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { MAIN_NAV_ITEMS, CATEGORY_NAV_ITEMS, TOOL_NAV_ITEMS } from '../../routes';
import { getNavIcon } from '../../constants/navIcons';
import favicon from '../../assets/favicon.png';
import { classNames } from '../../utils/helpers';

export const Sidebar = () => {
  const { expanded, setHovered } = useSidebar();
  const location = useLocation();

  const sidebarWidth = expanded ? '260px' : '60px';

  const renderNavGroup = (items, groupLabel = null) => (
    <div style={{ marginBottom: expanded ? '14px' : '8px' }}>
      {expanded && groupLabel && (
        <div
          style={{
            padding: '4px 12px 6px',
            fontSize: '0.66rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--ink-light)',
          }}
        >
          {groupLabel}
        </div>
      )}
      {!expanded && groupLabel && (
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--border)',
            margin: '6px 8px',
            opacity: 0.5,
          }}
        />
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(item => {
          const Icon = getNavIcon(item.icon);
          const isActive = !item.noActive && location.pathname === item.path;
          return (
            <li key={item.path} style={{ marginBottom: '2px' }}>
              <NavLink
                to={item.path}
                style={() => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: expanded ? '11px' : 0,
                  padding: '9px 12px',
                  borderRadius: '10px',
                  color: isActive ? 'var(--gold-light)' : 'var(--ink-muted)',
                  backgroundColor: isActive ? 'rgba(223, 178, 100, 0.10)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  border: isActive ? '1px solid rgba(223, 178, 100, 0.22)' : '1px solid transparent',
                  boxShadow: isActive ? 'inset 2px 0 0 var(--gold), 0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
                  fontWeight: isActive ? 600 : 500,
                })}
                className={() => classNames('sidebar-item', isActive && 'active')}
                aria-label={item.label}
                title={expanded ? undefined : item.label}
              >
                <Icon
                  size={18}
                  style={{
                    flexShrink: 0,
                    color: isActive ? 'var(--gold)' : 'var(--ink-light)',
                    transition: 'color 0.2s ease',
                  }}
                />
                {expanded && (
                  <span
                    style={{
                      fontSize: '0.87rem',
                      fontFamily: 'var(--font-family-ui)',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </NavLink>
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
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease',
        zIndex: 100,
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Navigation sidebar"
    >
      {/* Brand */}
      <div
        style={{
          padding: '16px 14px',
          borderBottom: '1px solid var(--border)',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          gap: '12px',
        }}
      >
        {expanded ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, rgba(223, 178, 100, 0.25) 0%, rgba(223, 178, 100, 0.08) 100%)',
                border: '1px solid rgba(223, 178, 100, 0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <img src={favicon} alt="" style={{ width: 19, height: 19, borderRadius: 3 }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-family-heading)',
                  fontSize: '1.25rem',
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
                  fontSize: '0.74rem',
                  color: 'var(--ink-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  fontFamily: 'var(--font-family-ui)',
                }}
              >
                Jo keh nahi paaye, likh do.
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              backgroundColor: 'rgba(223, 178, 100, 0.12)',
              border: '1px solid rgba(223, 178, 100, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold)',
              flexShrink: 0,
            }}
          >
            <img src={favicon} alt="" style={{ width: 18, height: 18, borderRadius: 3 }} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {renderNavGroup(MAIN_NAV_ITEMS, null)}
        {renderNavGroup(CATEGORY_NAV_ITEMS, 'Categories & Spaces')}
        {renderNavGroup(TOOL_NAV_ITEMS, 'Tools')}
      </nav>

      {/* Bottom inspirational section */}
      <div
        style={{
          padding: expanded ? '14px 12px' : '12px 8px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--paper-darker)',
        }}
      >
        {expanded ? (
          <div
            style={{
              padding: '11px 13px',
              borderRadius: '10px',
              backgroundColor: 'rgba(223, 178, 100, 0.05)',
              border: '1px solid rgba(223, 178, 100, 0.12)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: 'var(--gold)', opacity: 0.9 }}>
              <Feather size={12} />
              <span style={{ fontSize: '0.64rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Daily Whisper</span>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-family-heading)',
                fontSize: '0.92rem',
                lineHeight: 1.45,
                color: 'var(--ink)',
                fontStyle: 'italic',
              }}
            >
              &ldquo;A calmer you is a brighter you.&rdquo;
            </p>
          </div>
        ) : (
          <div
            title="A calmer you is a brighter you."
            style={{
              width: '32px',
              height: '32px',
              margin: '0 auto',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(223, 178, 100, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold)',
            }}
          >
            <Feather size={14} />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
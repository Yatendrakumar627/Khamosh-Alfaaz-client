import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { MAIN_NAV_ITEMS, CATEGORY_NAV_ITEMS, TOOL_NAV_ITEMS } from '../../routes';
import {
  Home,
  BookOpen,
  Quote,
  Star,
  CalendarDays,
  Tag,
  ChartNoAxesColumn,
  Download,
  Settings,
  Feather,
  Lightbulb,
  Sparkles,
  FileText,
  Heart,
  Circle,
} from 'lucide-react';
import favicon from '../../assets/favicon.png';
import { classNames } from '../../utils/helpers';

const navIcons = {
  home: Home,
  bookOpen: BookOpen,
  quote: Quote,
  star: Star,
  calendar: CalendarDays,
  tag: Tag,
  barChart: ChartNoAxesColumn,
  download: Download,
  settings: Settings,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  fileText: FileText,
  heart: Heart,
  circle: Circle,
};

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
            fontSize: '0.68rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
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
            opacity: 0.6,
          }}
        />
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(item => {
          const Icon = navIcons[item.icon] || BookOpen;
          const isActive = !item.noActive && location.pathname === item.path;
          return (
            <li key={item.path} style={{ marginBottom: '2px' }}>
              <NavLink
                to={item.path}
                style={() => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: expanded ? '10px' : 0,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  color: isActive ? 'var(--gold-light)' : 'var(--ink-muted)',
                  backgroundColor: isActive ? 'rgba(216,168,91,0.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  border: '1px solid transparent',
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
                  }}
                />
                {expanded && (
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: '0.88rem',
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
        transition: 'width 0.3s ease, background-color 0.35s ease, border-color 0.35s ease, color 0.35s ease',
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
          padding: '14px 10px',
          borderBottom: '1px solid var(--border)',
          minHeight: '86px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          gap: '12px',
        }}
      >
        {expanded ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <img src={favicon} alt="" style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 4 }} />
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-family-heading)',
                  fontSize: '1.35rem',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  lineHeight: 1.2,
                }}
              >
                Khamosh Alfaaz
              </h1>
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: '0.75rem',
                  color: 'var(--ink-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
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
              borderRadius: '10px',
              backgroundColor: 'var(--active-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold)',
              flexShrink: 0,
            }}
          >
            <img src={favicon} alt="" style={{ width: 18, height: 18, borderRadius: 4 }} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {renderNavGroup(MAIN_NAV_ITEMS, null)}
        {renderNavGroup(CATEGORY_NAV_ITEMS, 'Categories & Spaces')}
        {renderNavGroup(TOOL_NAV_ITEMS, 'Tools')}
      </nav>

      {/* Bottom inspirational section */}
      <div
        style={{
          position: 'relative',
          padding: '12px',
          borderTop: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'var(--sidebar-footer-veil), radial-gradient(ellipse at 50% 0%, var(--gold-muted) 0%, transparent 70%)',
          }}
        />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {expanded ? (
            <>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-family-heading)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: 'var(--ink)',
                  fontStyle: 'italic',
                }}
              >
                A calmer you
                <br />
                is a brighter you.
              </p>
              <div
                style={{
                  height: '1px',
                  width: '60px',
                  background: 'linear-gradient(90deg, var(--gold), transparent)',
                  opacity: 0.6,
                }}
              />
            </>
          ) : (
            <div
              style={{
                width: '30px',
                height: '30px',
                margin: '0 auto',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
              }}
            >
              <Feather size={15} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
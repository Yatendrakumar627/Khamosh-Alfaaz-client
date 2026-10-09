import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { NAV_ITEMS } from '../../routes';
import { Home, PenLine, BookOpen, Quote, Star, Calendar, Tag, BarChart3, Download, Settings, X } from 'lucide-react';
import favicon from '../../assets/favicon.png';
import { classNames } from '../../utils/helpers';

const navIcons = {
  home: Home,
  pen: PenLine,
  bookOpen: BookOpen,
  quote: Quote,
  star: Star,
  calendar: Calendar,
  tag: Tag,
  barChart: BarChart3,
  download: Download,
  settings: Settings,
};

export const MobileNavigation = () => {
  const { isOpen, close } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  if (typeof window !== 'undefined' && window.innerWidth >= 1200) return null;
  if (!isOpen) return null;

  return (
    <>
      <div
        className="drawer-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--overlay)',
          zIndex: 'var(--z-sticky)',
        }}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className="sidebar-texture drawer-panel"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          maxWidth: '85vw',
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          zIndex: 'calc(var(--z-sticky) + 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
        aria-label="Navigation sidebar"
      >
        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '86px',
            padding: '14px 10px 14px 16px',
            borderBottom: '1px solid var(--border)',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
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
          <button
            onClick={close}
            className="icon-btn"
            style={{
              padding: 'var(--spacing-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-muted)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {NAV_ITEMS.map(item => {
              const Icon = navIcons[item.icon];
              const isActive = location.pathname === item.path;
              return (
                <li key={item.icon} style={{ marginBottom: '2px' }}>
                  <NavLink
                    to={item.path}
                    onClick={close}
                    style={() => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      color: isActive ? 'var(--gold-light)' : 'var(--ink-muted)',
                      backgroundColor: isActive ? 'rgba(216,168,91,0.12)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      border: '1px solid transparent',
                    })}
                    className={() => classNames('sidebar-item', isActive && 'active')}
                    aria-label={item.label}
                  >
                    <Icon
                      size={19}
                      style={{
                        flexShrink: 0,
                        color: isActive ? 'var(--gold)' : 'var(--ink-light)',
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-family-ui)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
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
          </div>
        </div>
      </aside>
    </>
  );
};
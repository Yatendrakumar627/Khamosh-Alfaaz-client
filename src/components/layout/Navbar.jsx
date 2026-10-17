import { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { useFont } from '../../context/FontContext';
import { useSidebar } from '../../context/SidebarContext';
import { Menu, Sun, Moon, LogOut, ChevronDown, Type } from 'lucide-react';
import favicon from '../../assets/favicon.png';
import { Link, useLocation } from 'react-router-dom';
import { getInitials } from '../../utils/helpers';

export const Navbar = () => {
  const { name, deleteSession, isAuthenticated } = useSession();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { fontScheme, setFont, schemes } = useFont();
  const { toggle: toggleSidebar } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const userMenuRef = useRef(null);
  const fontMenuRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target)) {
        setShowFontMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await deleteSession();
    } finally {
      setShowUserMenu(false);
    }
  };

  return (
    <header className="navbar-header">
      {/* Left: mobile menu toggle */}
      <div className="menu-wrap">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="navbar-menu-btn"
          title="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Brand */}
      <div className="navbar-brand">
        <div className="navbar-brand-icon">
          <img
            src={favicon}
            alt="Khamosh Alfaaz"
          />
        </div>
        <div className="navbar-brand-text">
          <span className="navbar-brand-title">Khamosh Alfaaz</span>
          <span className="navbar-brand-tagline">
            Jo keh nahi paaye, likh do.
          </span>
        </div>
      </div>

      {/* Right: font switcher + theme toggle + user controls */}
      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative' }} ref={fontMenuRef}>
          <button
            onClick={() => setShowFontMenu(v => !v)}
            aria-label="Change font style"
            aria-expanded={showFontMenu}
            aria-haspopup="true"
            title="Font style"
            className={`navbar-action-btn ${showFontMenu ? 'active' : ''}`}
          >
            <Type size={16} />
          </button>
          {showFontMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                backgroundColor: 'color-mix(in srgb, var(--card-bg) 95%, transparent)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(223, 178, 100, 0.22)',
                borderRadius: '14px',
                boxShadow: '0 16px 40px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(223, 178, 100, 0.08)',
                minWidth: '240px',
                padding: '8px',
                zIndex: 60,
                animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <p style={{ margin: '4px 10px 8px', fontFamily: 'var(--font-family-ui)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)' }}>
                Typography Style
              </p>
              {schemes.map(s => {
                const active = fontScheme === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setFont(s.id); setShowFontMenu(false); }}
                    aria-pressed={active}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '7px 8px',
                      border: 'none',
                      background: active ? 'var(--hover-bg)' : 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        fontFamily: s.heading,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: active ? 'var(--gold)' : 'var(--ink)',
                        width: '26px',
                        textAlign: 'center',
                        flexShrink: 0,
                      }}
                    >
                      Aa
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-family-ui)', fontSize: '0.84rem', fontWeight: 500, color: 'var(--ink)' }}>
                        {s.name}
                      </span>
                      <span
                        style={{
                          fontFamily: s.body,
                          fontSize: '0.72rem',
                          color: 'var(--ink-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        Jo keh nahi paaye, likh do.
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="navbar-action-btn theme-btn"
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={17} />
          ) : (
            <Moon size={17} />
          )}
        </button>

        {/* User Account Button */}
        {isAuthenticated && (
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="navbar-user-btn"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              title={name || 'My Account'}
            >
              <div className="navbar-user-avatar">
                {getInitials(name || 'AW')}
              </div>
              <span className="navbar-user-name">
                {name || 'Anonymous Writer'}
              </span>
              <ChevronDown
                size={14}
                className="navbar-chevron"
                style={{
                  transform: showUserMenu ? 'rotate(180deg)' : 'none',
                }}
              />
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  backgroundColor: 'color-mix(in srgb, var(--card-bg) 95%, transparent)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(223, 178, 100, 0.22)',
                  borderRadius: '14px',
                  boxShadow: '0 16px 40px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(223, 178, 100, 0.08)',
                  minWidth: '200px',
                  padding: '8px',
                  zIndex: 60,
                  animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)', fontSize: '0.88rem' }}>{name || 'Anonymous Writer'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--gold)', opacity: 0.9 }}>Protected Session</p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '9px 12px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--error)',
                    borderRadius: '9px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
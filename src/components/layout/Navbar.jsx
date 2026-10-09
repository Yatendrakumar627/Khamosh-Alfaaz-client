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
  const { resolvedTheme, setTheme } = useTheme();
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
    <header
      className="navbar-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        backgroundColor: 'color-mix(in srgb, var(--background) 88%, transparent)',
        backdropFilter: 'blur(10px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.4)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: mobile menu toggle */}
      <div className="menu-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={toggleSidebar}
          style={{
            padding: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--ink-muted)',
            borderRadius: '8px',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle menu"
          className="mobile-menu-btn icon-btn"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Brand (mobile only) */}
      <div className="navbar-brand">
        <img
          src={favicon}
          alt=""
          style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 4 }}
        />
        <div className="navbar-brand-text">
          <span className="navbar-brand-title">Khamosh Alfaaz</span>
          <span className="navbar-brand-tagline">
            <span>Jo keh nahi paaye,</span>
            <span>likh do.</span>
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
            className="theme-pill"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              background: showFontMenu ? 'rgba(216,168,91,0.18)' : 'transparent',
              color: showFontMenu ? 'var(--gold)' : 'var(--ink-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Type size={16} />
          </button>
          {showFontMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                minWidth: '235px',
                padding: '8px',
                zIndex: 60,
                animation: 'scaleIn 0.2s ease',
              }}
            >
              <p style={{ margin: '2px 10px 6px', fontFamily: 'var(--font-family-ui)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-light)' }}>
                Font style
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

        <div
          role="group"
          aria-label="Theme switcher"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--input-bg)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '2px',
            gap: '2px',
          }}
        >
          <button
            onClick={() => setTheme('light')}
            aria-label="Switch to light theme"
            aria-pressed={resolvedTheme === 'light'}
            title="Light mode"
            className="theme-pill"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              background: resolvedTheme === 'light' ? 'rgba(216,168,91,0.18)' : 'transparent',
              color: resolvedTheme === 'light' ? 'var(--gold)' : 'var(--ink-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            aria-label="Switch to dark theme"
            aria-pressed={resolvedTheme === 'dark'}
            title="Dark mode"
            className="theme-pill"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              background: resolvedTheme === 'dark' ? 'rgba(216,168,91,0.18)' : 'transparent',
              color: resolvedTheme === 'dark' ? 'var(--gold)' : 'var(--ink-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Moon size={16} />
          </button>
        </div>

        {isAuthenticated && (
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 6px 3px 3px',
                border: 'none',
                background: 'transparent',
                color: 'var(--ink)',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--gold)',
                  color: 'var(--paper-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  flexShrink: 0,
                }}
              >
                {getInitials(name || 'AW')}
              </div>
              <span
                className="navbar-user-name"
                style={{
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  color: 'var(--ink)',
                  whiteSpace: 'nowrap',
                }}
              >
                {name || 'Anonymous Writer'}
              </span>
              <ChevronDown
                size={15}
                className="navbar-chevron"
                style={{
                  color: 'var(--ink-muted)',
                  transition: 'transform 0.2s ease',
                  transform: showUserMenu ? 'rotate(180deg)' : 'none',
                }}
              />
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    minWidth: '190px',
                  padding: '8px',
                  animation: 'scaleIn 0.2s ease',
                }}
              >
                <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--ink)', fontSize: '0.88rem' }}>{name || 'Anonymous Writer'}</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--ink-muted)' }}>Protected session</p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--error)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
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
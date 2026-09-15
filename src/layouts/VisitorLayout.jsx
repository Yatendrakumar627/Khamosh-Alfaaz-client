import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { X, Sun, Moon } from 'lucide-react';
import favicon from '../assets/favicon.png';
import { useTheme } from '../context/ThemeContext';
import { classNames } from '../utils/helpers';
import { VisitorBottomNavigation } from '../components/visitor/VisitorBottomNavigation';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/explore/quotes', label: 'Quotes' },
  { to: '/explore/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
];

const DRAWER_LINKS = [
  { to: '/explore/quotes', label: 'Quotes' },
  { to: '/explore/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
];

export const VisitorLayout = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const moreActive = ['/explore/categories', '/about'].some(path => location.pathname.startsWith(path));

  return (
    <div className="visitor-shell" style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      <header
        className="visitor-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'color-mix(in srgb, var(--background) 88%, transparent)',
          backdropFilter: 'blur(10px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(10px) saturate(1.4)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="visitor-header-inner" style={{ maxWidth: '1080px', margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" className="visitor-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', minWidth: 0 }}>
            <img src={favicon} alt="" style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 4 }} />
            <div style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: 'var(--font-family-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                Khamosh Alfaaz
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                Jo keh nahi paaye, likh do.
              </span>
            </div>
          </Link>

          <nav className="visitor-nav" aria-label="Visitor navigation" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={classNames('visitor-nav-link')}
                style={({ isActive }) => ({
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--gold)' : 'var(--ink-muted)',
                  backgroundColor: isActive ? 'rgba(216,168,91,0.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                  whiteSpace: 'nowrap',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/login"
            className="visitor-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--gold)',
              color: 'var(--paper-dark)',
              fontWeight: 600,
              fontSize: '0.88rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(216,168,91,0.3)',
            }}
          >
            Start Writing →
          </Link>

          <div role="group" aria-label="Theme switcher" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '18px', padding: '2px', gap: '2px', flexShrink: 0 }}>
            <button
              onClick={() => setTheme('light')}
              aria-label="Switch to light theme"
              aria-pressed={resolvedTheme === 'light'}
              className="theme-pill"
              style={{
                width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                background: resolvedTheme === 'light' ? 'rgba(216,168,91,0.18)' : 'transparent',
                color: resolvedTheme === 'light' ? 'var(--gold)' : 'var(--ink-light)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              aria-label="Switch to dark theme"
              aria-pressed={resolvedTheme === 'dark'}
              className="theme-pill"
              style={{
                width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                background: resolvedTheme === 'dark' ? 'rgba(216,168,91,0.18)' : 'transparent',
                color: resolvedTheme === 'dark' ? 'var(--gold)' : 'var(--ink-light)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Moon size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="visitor-body" style={{ flex: 1, padding: '26px 20px 110px', maxWidth: '1080px', width: '100%', margin: '0 auto', minWidth: 0 }}>
        <Outlet />
      </div>

      <footer className="visitor-footer" style={{ borderTop: '1px solid var(--border)', padding: '24px 20px 28px', textAlign: 'center' }}>
        <div className="gold-rule" style={{ margin: '0 auto 14px', maxWidth: '120px' }}>
          <span className="diamond" />
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', color: 'var(--ink-muted)', fontSize: '0.92rem' }}>
          Anyone can come here and quietly read what others couldn't say.
        </p>
        <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--ink-light)' }}>
          © {new Date().getFullYear()} Khamosh Alfaaz — a calm corner on the internet.
        </p>
      </footer>

      <VisitorBottomNavigation onMore={() => setDrawerOpen(true)} moreActive={moreActive} />

      {drawerOpen && (
        <>
          <div
            className="drawer-overlay"
            style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--overlay)', zIndex: 'var(--z-sticky)' }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="sidebar-texture drawer-panel"
            style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px', maxWidth: '85vw', backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)', zIndex: 'calc(var(--z-sticky) + 1)', display: 'flex', flexDirection: 'column' }}
            aria-label="More options"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '86px', padding: '14px 10px 14px 16px', borderBottom: '1px solid var(--border)', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <img src={favicon} alt="" style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 4 }} />
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.35rem', fontWeight: 500, color: 'var(--ink)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', lineHeight: 1.2 }}>Khamosh Alfaaz</h1>
                  <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: 'var(--ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>A quiet place to leave words.</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="icon-btn" style={{ padding: 'var(--spacing-sm)', border: 'none', background: 'transparent', color: 'var(--ink-muted)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>

            <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {DRAWER_LINKS.map(item => (
                  <li key={item.label} style={{ marginBottom: '2px' }}>
                    <NavLink
                      to={item.to}
                      onClick={() => setDrawerOpen(false)}
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px',
                        color: isActive ? 'var(--gold-light)' : 'var(--ink-muted)',
                        backgroundColor: isActive ? 'rgba(216,168,91,0.12)' : 'transparent',
                        textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden',
                      })}
                      className={classNames('sidebar-item')}
                    >
                      <span style={{ fontWeight: 500, fontSize: '0.9rem', fontFamily: 'var(--font-family-body)', letterSpacing: '0.02em' }}>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              <Link
                to="/login"
                onClick={() => setDrawerOpen(false)}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'var(--gold)', color: 'var(--paper-dark)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
              >
                Start Writing →
              </Link>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default VisitorLayout;
import { Outlet } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { VisitorFooter } from '../components/visitor/VisitorFooter';

export const VisitorLayout = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div
      className="visitor-shell"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Floating Minimalist Theme Switcher */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '18px',
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'color-mix(in srgb, var(--paper) 88%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          padding: '3px',
          gap: '3px',
          boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
        }}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-label="Switch to light theme"
          aria-pressed={resolvedTheme === 'light'}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: resolvedTheme === 'light' ? 'rgba(216,168,91,0.22)' : 'transparent',
            color: resolvedTheme === 'light' ? 'var(--gold)' : 'var(--ink-light)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <Sun size={15} />
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-label="Switch to dark theme"
          aria-pressed={resolvedTheme === 'dark'}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: resolvedTheme === 'dark' ? 'rgba(216,168,91,0.22)' : 'transparent',
            color: resolvedTheme === 'dark' ? 'var(--gold)' : 'var(--ink-light)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <Moon size={15} />
        </button>
      </div>

      {/* Main Visitor Content */}
      <main
        className="visitor-body"
        style={{
          flex: 1,
          padding: 'clamp(24px, 4vw, 44px) 20px 48px',
          maxWidth: '1080px',
          width: '100%',
          margin: '0 auto',
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>

      {/* Logical, High-Converting & Professional Visitor Footer */}
      <VisitorFooter />
    </div>
  );
};

export default VisitorLayout;
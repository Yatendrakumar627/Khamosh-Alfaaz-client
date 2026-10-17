import { Outlet } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { VisitorFooter } from '../components/visitor/VisitorFooter';

export const VisitorLayout = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

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
        }}
      >
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            backgroundColor: 'color-mix(in srgb, var(--paper) 88%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'var(--gold)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(223, 178, 100, 0.45)';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
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
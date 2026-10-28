import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { sessionApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import favicon from '../assets/favicon.png';
import { STORAGE_KEYS } from '../constants';
import { useSEO } from '../utils/useSEO';

export const Welcome = () => {
  useSEO({
    title: 'Open Your Sanctuary Diary — Khamosh Alfaaz',
    description: 'Sign in to your private anonymous diary or register with a unique username and 4-digit PIN. No email, no trackers.',
    canonicalUrl: 'https://khamosh-alfaaz-client.vercel.app/login',
  });
  const { initializeSession, login, loading: sessionLoading } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && !displayName.trim()) {
      setError('Please enter a display name');
      return;
    }
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!pin) {
      setError('Please enter your PIN');
      return;
    }
    if (isRegister && pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setSubmitting(true);
    try {
      const result = isRegister
        ? await initializeSession({
          name: displayName.trim(),
          username: username.trim(),
          pin,
        })
        : await login(username.trim(), pin);

      if (!result?.success) {
        if (!isRegister) {
          setError('Incorrect username or PIN.');
          return;
        }
        const message = result?.details?.username
          ? 'Username is already taken'
          : result?.error || 'Unable to open diary. Please try again.';
        setError(message);
        return;
      }

      localStorage.setItem(STORAGE_KEYS.NAME, result.name || displayName.trim());
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Unable to open diary. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--background)',
          color: 'var(--ink-muted)',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--border)',
            borderTopColor: 'var(--gold)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>Opening your diary...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Top Controls: Back & Theme */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: 'var(--ink-muted)',
            fontSize: '0.80rem',
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; }}
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--paper)',
            color: 'var(--ink-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Main Compact Card */}
      <div
        className="paper-texture"
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '20px 24px',
          borderRadius: '14px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          boxSizing: 'border-box',
        }}
      >
        {/* Simple Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <img
            src={favicon}
            alt=""
            style={{
              width: '36px',
              height: '36px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(223, 178, 100, 0.4))',
              marginBottom: '6px',
              display: 'inline-block',
            }}
          />
          <h1
            style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1.48rem',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 2px',
              lineHeight: 1.15,
            }}
          >
            Khamosh Alfaaz
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-family-heading)',
              fontStyle: 'italic',
              fontSize: '0.86rem',
              color: 'var(--gold)',
            }}
          >
            Jo keh nahi paaye, likh do.
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            marginBottom: '14px',
          }}
        >
          <button
            type="button"
            onClick={() => switchMode('login')}
            style={{
              flex: 1,
              padding: '6px 0',
              border: 'none',
              background: 'transparent',
              color: !isRegister ? 'var(--gold)' : 'var(--ink-muted)',
              fontWeight: !isRegister ? 600 : 500,
              fontSize: '0.84rem',
              borderBottom: !isRegister ? '2px solid var(--gold)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Open Diary
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            style={{
              flex: 1,
              padding: '6px 0',
              border: 'none',
              background: 'transparent',
              color: isRegister ? 'var(--gold)' : 'var(--ink-muted)',
              fontWeight: isRegister ? 600 : 500,
              fontSize: '0.84rem',
              borderBottom: isRegister ? '2px solid var(--gold)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Create Diary
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            style={{
              padding: '7px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(199, 90, 70, 0.12)',
              border: '1px solid rgba(199, 90, 70, 0.3)',
              color: 'var(--error)',
              fontSize: '0.78rem',
              marginBottom: '10px',
            }}
          >
            {error}
          </div>
        )}

        {/* Compact Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {isRegister && (
            <Input
              size="sm"
              label="Display Name"
              placeholder="e.g. A Quiet Soul"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required={isRegister}
              autoFocus
              autoComplete="name"
              maxLength={50}
            />
          )}

          <Input
            size="sm"
            label="Private Username"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            maxLength={30}
          />

          <Input
            size="sm"
            label="PIN"
            placeholder="4-12 digits"
            type={showPin ? 'text' : 'password'}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            maxLength={12}
            rightSection={
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                tabIndex={-1}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {isRegister && (
            <Input
              size="sm"
              label="Confirm PIN"
              placeholder="Re-enter PIN"
              type={showConfirmPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              required
              autoComplete="new-password"
              maxLength={12}
              rightSection={
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  tabIndex={-1}
                  aria-label={showConfirmPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showConfirmPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '4px',
              padding: '9px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--gold)',
              color: '#1a140d',
              fontWeight: 600,
              fontSize: '0.85rem',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s ease',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Please wait...' : isRegister ? 'Create Diary' : 'Open Diary'}
          </button>
        </form>

        {/* Footer switch prompt */}
        <p
          style={{
            margin: '12px 0 0',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: 'var(--ink-muted)',
          }}
        >
          {isRegister ? (
            <span>
              Already have a diary?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--gold)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Open it
              </button>
            </span>
          ) : (
            <span>
              New here?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--gold)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Create a diary
              </button>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Welcome;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { sessionApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BookOpen, LockKeyhole, Sparkles, UserRound, ArrowLeft } from 'lucide-react';
import favicon from '../assets/favicon.png';
import { STORAGE_KEYS } from '../constants';

export const Welcome = () => {
  const { initializeSession, login, loading: sessionLoading } = useSession();
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const isRegister = mode === 'register';

  const checkUsername = async () => {
    const value = username.trim();
    if (value.length < 3) {
      setUsernameStatus('');
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await sessionApi.checkUsername(value);
      setUsernameStatus(response.data.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('');
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoginFailed(false);

    if (isRegister && !displayName.trim()) {
      setError('Please enter your display name');
      return;
    }
    if (!username.trim()) {
      setError('Please enter a private username');
      return;
    }
    if (!pin) {
      setError('Please enter a PIN');
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
          setLoginFailed(true);
          setMode('register');
          setError('That username or PIN is incorrect. Create a new diary to get started.');
          return;
        }
        const message = result?.details?.username
          ? 'That private username is already taken'
          : result?.error || 'Unable to open your diary. Please try again.';
        setError(message);
        return;
      }

      localStorage.setItem(STORAGE_KEYS.NAME, result.name || displayName.trim());
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Unable to open your diary. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        color: 'var(--ink-muted)',
      }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ marginTop: 'var(--spacing-lg)' }}>Opening your diary...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-md)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-lg)',
      }} className="paper-texture diary-page fade-in">
        <p style={{ margin: '0 0 var(--spacing-sm)', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--ink-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={15} />
            Back to the public pages
          </Link>
        </p>

        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <img
            src={favicon}
            alt="Khamosh Alfaaz emblem"
            style={{ position: 'relative', width: 48, height: 48, borderRadius: 8, flexShrink: 0, margin: '0 auto var(--spacing-lg)', display: 'block' }}
          />
          <h1 style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: '0 0 var(--spacing-sm)',
          }}>
            Khamosh Alfaaz
          </h1>
          <div className="gold-rule" style={{ margin: '0 auto var(--spacing-md)', maxWidth: '220px' }}>
            <span className="diamond" />
          </div>
          <p style={{
            fontFamily: 'var(--font-family-heading)',
            color: 'var(--ink-muted)',
            fontSize: '1.15rem',
            fontStyle: 'italic',
            margin: 0,
          }}>
            Jo keh nahi paaye, likh do.
          </p>
        </div>

        <div style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--ink-muted)' }}>
          <p style={{ margin: '0 0 var(--spacing-md)', fontSize: '1rem', fontFamily: 'var(--font-family-heading)' }}>
            Your diary, protected by your private username and PIN.
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', fontStyle: 'italic', fontFamily: 'var(--font-family-heading)', lineHeight: 1.7 }}>
            The public site stays open. Your entries stay private.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
          <Button
            type="button"
            variant={isRegister ? 'filled' : 'subtle'}
            size="sm"
            onClick={() => { setMode('register'); setUsernameStatus(''); setError(''); setLoginFailed(false); }}
          >
            Create diary
          </Button>
          <Button
            type="button"
            variant={!isRegister ? 'filled' : 'subtle'}
            size="sm"
            onClick={() => { setMode('login'); setUsernameStatus(''); setError(''); setLoginFailed(false); }}
          >
            Open existing diary
          </Button>
        </div>

        {error && (
          <p role="alert" style={{
            margin: '0 0 var(--spacing-md)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--error)12',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            fontSize: '0.9rem',
          }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {isRegister && (
            <Input
              label="Display name"
              placeholder="Your simple name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={error && !username && !pin ? error : undefined}
              required={isRegister}
              autoFocus
              autoComplete="name"
              maxLength={50}
              leftIcon={<UserRound size={20} />}
            />
          )}

          <Input
            label="Private username"
            placeholder="3-30 letters, numbers, or underscores"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setUsernameStatus(''); }}
            onBlur={checkUsername}
            hint={checkingUsername ? 'Checking availability...' : usernameStatus === 'available' ? 'Available' : usernameStatus === 'taken' ? 'Already taken' : undefined}
            error={error && (!username || (!isRegister && !pin)) ? error : usernameStatus === 'taken' ? 'That private username is already taken' : undefined}
            required
            autoComplete="username"
            maxLength={30}
            leftIcon={<BookOpen size={20} />}
          />

          <Input
            label="PIN"
            placeholder="4-12 digits"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            error={error && !pin ? error : undefined}
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            maxLength={12}
            leftIcon={<LockKeyhole size={20} />}
          />

          {isRegister && (
            <Input
              label="Confirm PIN"
              placeholder="Enter the same PIN"
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              error={error && pin !== confirmPin ? error : undefined}
              required
              autoComplete="new-password"
              maxLength={12}
              leftIcon={<LockKeyhole size={20} />}
            />
          )}

          <Button type="submit" fullWidth size="lg" loading={submitting} leftIcon={<Sparkles size={20} />} className="btn-primary">
            {isRegister ? 'Create and Begin Writing' : 'Open Diary'}
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          color: 'var(--ink-light)',
          fontSize: '0.85rem',
          margin: 'var(--spacing-md) 0 0',
        }}>
          Your private username is never shown publicly. Keep it with your PIN.
        </p>
      </div>
    </div>
  );
};

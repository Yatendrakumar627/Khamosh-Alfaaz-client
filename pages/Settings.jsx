import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFont } from '../context/FontContext';
import { useSession } from '../context/SessionContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { backupApi } from '../services/api';
import { Sun, Moon, Monitor, Save, Trash2 } from 'lucide-react';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { fontScheme, setFont, schemes } = useFont();
  const { name, updateName } = useSession();
  const { success, error } = useToast();
  const [displayName, setDisplayName] = useState(name || '');
  const [saving, setSaving] = useState(false);
  const [resetPin, setResetPin] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      error('Please enter a name');
      return;
    }
    setSaving(true);
    try {
      const result = await updateName(trimmed);
      if (result?.success) {
        success('Name updated');
      } else {
        error(result?.error || 'Failed to update name');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!resetPin) {
      error('Please enter your PIN');
      return;
    }
    setResetting(true);
    try {
      await backupApi.deleteAll(resetPin);
      setResetPin('');
      setResetOpen(false);
      success('Diary reset successfully');
    } catch (err) {
      error(err?.response?.data?.error || err?.message || 'Failed to reset diary');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
          Settings
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
          Make this quiet space feel like yours.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
        <section style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }} className="paper-texture diary-page">
          <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-sm)' }}>
            Your Name
          </h2>
          <p style={{ margin: '0 0 var(--spacing-lg)', color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
            This name is shown only inside your diary.
          </p>
          <form onSubmit={handleSaveName} style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-end', maxWidth: '480px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Input
                label="Display name"
                placeholder="What should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                autoComplete="name"
              />
            </div>
            <Button type="submit" loading={saving} leftIcon={<Save size={18} />}>
              Save Name
            </Button>
          </form>
        </section>

        <section style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }} className="paper-texture diary-page">
          <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-sm)' }}>
            Typography
          </h2>
          <p style={{ margin: '0 0 var(--spacing-lg)', color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
            Choose the voice of your diary — titles, writing, and interface each have their own font.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: 'var(--spacing-md)' }}>
            {schemes.map(scheme => {
              const isActive = fontScheme === scheme.id;
              return (
                <button
                  key={scheme.id}
                  onClick={() => setFont(scheme.id)}
                  type="button"
                  aria-pressed={isActive}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-lg)',
                    border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--accent)10' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: 'var(--spacing-sm)' }}>
                    <span
                      aria-hidden="true"
                      style={{
                        fontFamily: scheme.heading,
                        fontSize: '1.7rem',
                        fontWeight: 600,
                        lineHeight: 1,
                        color: isActive ? 'var(--accent)' : 'var(--ink)',
                      }}
                    >
                      Aa
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-family-ui)',
                        fontSize: '0.66rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: isActive ? 'var(--accent)' : 'var(--ink-light)',
                        paddingTop: '4px',
                      }}
                    >
                      {isActive ? 'Active' : scheme.tagline}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-family-ui)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>
                    {scheme.name}
                  </span>
                  <span style={{ fontFamily: scheme.body, fontSize: '0.98rem', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
                    Jo keh nahi paaye, likh do.
                  </span>
                  <span style={{ fontFamily: 'var(--font-family-ui)', fontSize: '0.72rem', color: 'var(--ink-light)', lineHeight: 1.4 }}>
                    {scheme.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }} className="paper-texture diary-page">
          <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-sm)' }}>
            Appearance
          </h2>
          <p style={{ margin: '0 0 var(--spacing-lg)', color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
            Choose how your diary looks.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            {themeOptions.map(option => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  type="button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-lg)',
                    border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--accent)10' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--ink-muted)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    minWidth: '120px',
                    transition: 'all 0.2s ease',
                  }}
                  aria-pressed={isActive}
                >
                  <Icon size={24} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }} className="paper-texture diary-page">
          <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--error)', margin: '0 0 var(--spacing-sm)' }}>
            Reset Diary
          </h2>
          <p style={{ margin: '0 0 var(--spacing-lg)', color: 'var(--ink-muted)', fontSize: '0.95rem' }}>
            Delete all entries and categories for this diary. Your private username and PIN remain active.
          </p>
          <Button
            type="button"
            color="red"
            leftIcon={<Trash2 size={18} />}
            onClick={() => setResetOpen(true)}
          >
            Reset diary
          </Button>
        </section>
      </div>

      <Modal opened={resetOpen} onClose={() => setResetOpen(false)} title="Reset diary" size="sm">
        <p style={{ color: 'var(--ink)', margin: '0 0 var(--spacing-lg)' }}>
          Enter your PIN to confirm. This action cannot be undone.
        </p>
        <Input
          label="PIN"
          type="password"
          value={resetPin}
          onChange={(e) => setResetPin(e.target.value)}
          autoComplete="current-password"
          maxLength={12}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
          <Button variant="subtle" onClick={() => setResetOpen(false)} disabled={resetting}>
            Cancel
          </Button>
          <Button type="button" color="red" onClick={handleReset} loading={resetting} leftIcon={<Trash2 size={18} />}>
            Reset diary
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;

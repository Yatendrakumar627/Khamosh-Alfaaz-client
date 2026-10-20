import { useToast } from '../../context/ToastContext';
import { X } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const toastIcons = {
  success: 'check-circle',
  error: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info',
};

const iconComponents = {
  'check-circle': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  'alert-circle': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  'alert-triangle': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  'info': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const toastColors = {
  success: { bg: 'var(--success)', icon: 'var(--paper)', text: 'var(--paper)' },
  error: { bg: 'var(--error)', icon: 'var(--paper)', text: 'var(--paper)' },
  warning: { bg: 'var(--warning)', icon: 'var(--ink)', text: 'var(--ink)' },
  info: { bg: 'var(--info)', icon: 'var(--paper)', text: 'var(--paper)' },
};

export const Toast = ({ toast, onClose }) => {
  const colors = toastColors[toast.type] || toastColors.info;
  const Icon = iconComponents[toastIcons[toast.type]] || iconComponents.info;

  return (
    <div
      className="toast-enter"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '300px',
        maxWidth: '450px',
        animation: 'toastIn 0.28s var(--ease-out)',
      }}
      role="alert"
    >
      <span
        style={{
          flexShrink: 0,
          width: '32px',
          height: '32px',
          marginTop: '1px',
          borderRadius: '50%',
          backgroundColor: 'color-mix(in srgb, currentColor 20%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {Icon}
      </span>
      <div style={{ flex: 1, fontSize: '0.95rem', lineHeight: 1.5, paddingTop: '5px' }}>
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="toast-close"
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          opacity: 0.7,
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export const Toaster = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="toaster"
      style={{
        position: 'fixed',
        bottom: 'var(--spacing-xl)',
        right: 'var(--spacing-xl)',
        zIndex: 'var(--z-toast)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      {toasts.map(toast => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
};
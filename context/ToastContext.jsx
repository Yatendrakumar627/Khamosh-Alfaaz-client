import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const toastId = () => Math.random().toString(36).substring(2, 9);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const id = toastId();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration ?? 4000,
      action: options.action,
      ...options,
    };
    setToasts(prev => [...prev, toast]);
    if (toast.duration > 0) {
      setTimeout(() => removeToast(id), toast.duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message, options) => addToast(message, { ...options, type: 'success' }), [addToast]);
  const error = useCallback((message, options) => addToast(message, { ...options, type: 'error', duration: 6000 }), [addToast]);
  const warning = useCallback((message, options) => addToast(message, { ...options, type: 'warning' }), [addToast]);
  const info = useCallback((message, options) => addToast(message, { ...options, type: 'info' }), [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
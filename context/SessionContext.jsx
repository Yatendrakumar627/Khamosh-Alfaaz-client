import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sessionApi, healthApi } from '../services/api';
import { STORAGE_KEYS } from '../constants';

const SessionContext = createContext(null);

const getErrorMessage = (err) => err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Request failed';

export const SessionProvider = ({ children }) => {
  const [visitor, setVisitor] = useState(null);
  const [name, setNameState] = useState('');
  // Non-blocking: Unauthenticated visitors (no ka_token) load the UI immediately without waiting for server cold boot
  const hasStoredToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('ka_token'));
  const [loading, setLoading] = useState(hasStoredToken);
  const [error, setError] = useState(null);

  const fetchSession = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ka_token') : null;
    if (!token) {
      // No credentials stored: Visitor mode is active. Silently pre-warm server in background.
      setLoading(false);
      healthApi.check().catch(() => {});
      return;
    }

    try {
      setLoading(true);
      const response = await sessionApi.get();
      const { visitor: visitorData, name: visitorName } = response.data;
      setVisitor(visitorData);
      setNameState(visitorName || '');
      setError(null);
    } catch (err) {
      setVisitor(null);
      setNameState('');
      setError(getErrorMessage(err));
      if (err?.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('ka_token');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const setAuthenticatedVisitor = useCallback((visitorData, visitorName) => {
    setVisitor(visitorData);
    setNameState(visitorName || visitorData?.name || '');
    setError(null);
  }, []);

  const initializeSession = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await sessionApi.create(credentials);
      const { visitor: visitorData, name: visitorName } = response.data;
      setAuthenticatedVisitor(visitorData, visitorName);
      return { success: true, name: visitorName };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message, details: err?.response?.data?.details };
    } finally {
      setLoading(false);
    }
  }, [setAuthenticatedVisitor]);

  const login = useCallback(async (username, pin) => {
    try {
      setLoading(true);
      const response = await sessionApi.login({ username, pin });
      const { visitor: visitorData, name: visitorName } = response.data;
      setAuthenticatedVisitor(visitorData, visitorName);
      return { success: true, name: visitorName };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [setAuthenticatedVisitor]);

  const clearSession = useCallback(() => {
    setVisitor(null);
    setNameState('');
    localStorage.removeItem(STORAGE_KEYS.NAME);
  }, []);

  const deleteSession = useCallback(async () => {
    try {
      await sessionApi.delete();
      clearSession();
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, [clearSession]);

  const updateName = useCallback(async (newName) => {
    try {
      setError(null);
      await sessionApi.updateName(newName);
      setNameState(newName);
      localStorage.setItem(STORAGE_KEYS.NAME, newName);
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem(STORAGE_KEYS.NAME);
    if (storedName) setNameState(storedName);
    fetchSession();
  }, [fetchSession]);

  // Keep-alive heartbeat: Prevents Render free-tier backend from spinning down
  // while the user is actively composing or reading, and immediately wakes it
  // up when the user returns to the tab after their mobile screen was locked.
  useEffect(() => {
    let lastPing = Date.now();
    const pingBackend = async () => {
      try {
        lastPing = Date.now();
        await healthApi.check();
      } catch {
        // Silently ignore ping errors
      }
    };

    // Ping every 3.5 minutes (Render sleep threshold is 15 minutes)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        pingBackend();
      }
    }, 210000);

    const handleVisibilityOrFocus = () => {
      // If returning to tab and more than 2 minutes elapsed since last ping, warm up server
      if (document.visibilityState === 'visible' && Date.now() - lastPing > 120000) {
        pingBackend();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  const value = {
    visitor,
    name,
    loading,
    error,
    initializeSession,
    login,
    updateName,
    clearSession,
    deleteSession,
    isAuthenticated: Boolean(visitor?.hasCredentials),
    refreshSession: fetchSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

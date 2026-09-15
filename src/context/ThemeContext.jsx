import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, THEMES } from '../constants';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  const applyTheme = useCallback((resolved) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    }
    setResolvedTheme(resolved);
  }, []);

  const resolveTheme = useCallback((themeValue) => {
    if (themeValue === 'system') {
      return getSystemTheme();
    }
    return themeValue;
  }, [getSystemTheme]);

  const setTheme = useCallback((newTheme) => {
    if (!THEMES.some(t => t.value === newTheme)) return;
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    const resolved = resolveTheme(newTheme);
    applyTheme(resolved);
  }, [resolveTheme, applyTheme]);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    const initialTheme = stored && THEMES.some(t => t.value === stored) ? stored : 'system';
    setThemeState(initialTheme);
    const resolved = resolveTheme(initialTheme);
    applyTheme(resolved);
  }, [resolveTheme, applyTheme]);

  useEffect(() => {
    if (!mounted) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme();
        applyTheme(resolved);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, getSystemTheme, applyTheme, mounted]);

  const toggleTheme = useCallback(() => {
    const themes = THEMES.map(t => t.value);
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme, setTheme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    mounted,
    themes: THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
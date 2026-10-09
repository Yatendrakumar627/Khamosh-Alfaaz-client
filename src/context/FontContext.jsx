import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';
import { FONT_SCHEMES, DEFAULT_FONT_SCHEME, isValidFontScheme } from '../constants/fonts';

const FontContext = createContext(null);

export const FontProvider = ({ children }) => {
  const [fontScheme, setFontSchemeState] = useState(DEFAULT_FONT_SCHEME);
  const [mounted, setMounted] = useState(false);

  const applyFont = useCallback((scheme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font', scheme);
    }
  }, []);

  const setFont = useCallback((scheme) => {
    if (!isValidFontScheme(scheme)) return;
    setFontSchemeState(scheme);
    try {
      localStorage.setItem(STORAGE_KEYS.FONT, scheme);
    } catch (err) {
      // Storage unavailable (private mode) — keep in-memory only
    }
    applyFont(scheme);
  }, [applyFont]);

  useEffect(() => {
    setMounted(true);
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEYS.FONT);
    } catch (err) {
      stored = null;
    }
    const initial = stored && isValidFontScheme(stored) ? stored : DEFAULT_FONT_SCHEME;
    setFontSchemeState(initial);
    applyFont(initial);
  }, [applyFont]);

  const value = {
    fontScheme,
    setFont,
    mounted,
    schemes: FONT_SCHEMES,
    scheme: FONT_SCHEMES.find((s) => s.id === fontScheme) || FONT_SCHEMES[0],
  };

  return (
    <FontContext.Provider value={value}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
};

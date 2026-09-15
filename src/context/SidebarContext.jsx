import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const expanded = isOpen || isHovered;

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    if (stored !== null) {
      setIsOpen(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, JSON.stringify(isOpen));
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
        setIsHovered(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = {
    isOpen,
    isHovered,
    expanded,
    open,
    close,
    toggle,
    setHovered: setIsHovered,
    mounted,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
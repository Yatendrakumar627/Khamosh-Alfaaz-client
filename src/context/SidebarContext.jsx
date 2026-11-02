import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  // Desktop pinned state (persisted to localStorage)
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // Mobile drawer state (ephemeral overlay, never locks desktop scroll)
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Desktop sidebar controls
  const openDesktop = useCallback(() => setIsOpen(true), []);
  const closeDesktop = useCallback(() => setIsOpen(false), []);
  const toggleDesktop = useCallback(() => setIsOpen((prev) => !prev), []);

  // Mobile drawer controls
  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }, []);
  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => {
      const next = !prev;
      if (!next && typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      return next;
    });
  }, []);

  // Adaptive controls: route to mobile drawer on small screens, desktop rail on large screens
  const toggle = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      toggleMobile();
    } else {
      toggleDesktop();
    }
  }, [toggleMobile, toggleDesktop]);

  const open = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      openMobile();
    } else {
      openDesktop();
    }
  }, [openMobile, openDesktop]);

  const close = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      closeMobile();
    } else {
      closeDesktop();
    }
  }, [closeMobile, closeDesktop]);

  const expanded = isOpen || isHovered;

  // Restore desktop pinned state from localStorage
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    if (stored !== null) {
      try {
        setIsOpen(JSON.parse(stored));
      } catch {
        // fallback
      }
    }
  }, []);

  // Sync desktop pinned state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, JSON.stringify(isOpen));
    }
  }, [isOpen, mounted]);

  // Window resize handler: collapse mobile drawer and release any scroll locks when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setIsMobileOpen(false);
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
        }
      } else {
        // On mobile, the desktop sidebar shouldn't stay hovered
        setIsHovered(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = {
    // Desktop state
    isOpen,
    isHovered,
    expanded,
    setHovered: setIsHovered,
    openDesktop,
    closeDesktop,
    toggleDesktop,

    // Mobile drawer state
    isMobileOpen,
    openMobile,
    closeMobile,
    toggleMobile,

    // Unified helpers (backward compatible with existing callers)
    open,
    close,
    toggle,
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

export default SidebarContext;

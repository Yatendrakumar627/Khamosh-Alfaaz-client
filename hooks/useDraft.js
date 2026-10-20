import { useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEYS } from '../constants';

const AUTOSAVE_DELAY = 1000;

export const useDraft = (initialData = {}) => {
  const [draft, setDraftState] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const timeoutRef = useRef(null);
  const initialRef = useRef(initialData);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Object.keys(parsed).length > 0) {
          setDraftState(parsed);
          initialRef.current = parsed;
          setHasUnsavedChanges(true);
        }
      }
    } catch (e) {
      console.warn('Failed to load draft:', e);
    }
  }, []);

  const setDraft = useCallback((updater) => {
    setDraftState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      setHasUnsavedChanges(true);
      setSaving(true);
      setLastSaved(null);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(next));
          setSaving(false);
          setLastSaved(new Date());
        } catch (e) {
          console.warn('Failed to save draft:', e);
          setSaving(false);
        }
      }, AUTOSAVE_DELAY);
      
      return next;
    });
  }, []);

  const clearDraft = useCallback(() => {
    setDraftState(initialData);
    initialRef.current = initialData;
    setHasUnsavedChanges(false);
    setLastSaved(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  }, [initialData]);

  const resetDraft = useCallback((newInitial = {}) => {
    initialRef.current = newInitial;
    setDraftState(newInitial);
    setHasUnsavedChanges(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  }, []);

  const getDraft = useCallback(() => draft, [draft]);

  const isDirty = useCallback(() => {
    const current = draft;
    const initial = initialRef.current;
    return JSON.stringify(current) !== JSON.stringify(initial);
  }, [draft]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    draft,
    setDraft,
    clearDraft,
    resetDraft,
    getDraft,
    saving,
    lastSaved,
    hasUnsavedChanges,
    isDirty: isDirty(),
  };
};
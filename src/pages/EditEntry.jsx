import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEntry } from '../hooks/useEntries';
import { entriesApi } from '../services/api';
import { EntryEditor } from '../components/diary/EntryEditor';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Save, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const isSafePath = (path) => {
  if (!path || typeof path !== 'string') return false;
  return /^\/[a-zA-Z0-9]/.test(path) && !path.includes('://') && !path.startsWith('//');
};

export const EditEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { entry, loading, error } = useEntry(id);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);

  const from = searchParams.get('from');
  const returnTo = isSafePath(from) ? from : `/entries/${id}`;
  const draftKey = `khamosh_alfaaz_edit_draft_${id}`;
  const draftSaveTimeoutRef = useRef(null);
  const currentFormDataRef = useRef(null);

  // Load draft from localStorage if available
  const localDraft = useMemo(() => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.content) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse edit draft:', e);
    }
    return null;
  }, [draftKey]);

  useEffect(() => {
    if (localDraft && entry && localDraft.content !== entry.content) {
      setRestoredFromDraft(true);
      setHasUnsavedChanges(true);
    }
  }, [localDraft, entry]);

  // Protect against accidental window close/reload with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !saved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saved]);

  // Auto-save draft to localStorage on edit
  const handleEditorChange = useCallback((newData) => {
    currentFormDataRef.current = newData;
    setHasUnsavedChanges(true);
    if (saveError) setSaveError(null);

    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }
    draftSaveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(newData));
      } catch (e) {
        console.warn('Failed to auto-save edit draft:', e);
      }
    }, 800);
  }, [draftKey, saveError]);

  const clearLocalDraft = useCallback(() => {
    if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);
    try {
      localStorage.removeItem(draftKey);
    } catch (e) {
      console.warn('Failed to clear edit draft:', e);
    }
    setHasUnsavedChanges(false);
    setRestoredFromDraft(false);
  }, [draftKey]);

  const handleSave = async (data) => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    // Save immediate snapshot locally first so work is never lost
    try {
      localStorage.setItem(draftKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to snapshot edit draft before save:', e);
    }

    try {
      await entriesApi.update(id, {
        ...data,
        entryDate: data.entryDate || entry.entryDate,
      });

      setSaved(true);
      clearLocalDraft();
      toast?.success?.('Saved successfully.');
      setTimeout(() => navigate(returnTo), 800);
    } catch (err) {
      console.error('Update failed:', err);

      const isTimeout = err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout');
      const isNetwork = !err.response && Boolean(err.request);
      let errorMsg = 'Failed to update entry. Please try again.';

      if (isTimeout || isNetwork) {
        errorMsg = 'Server took too long to respond. Your changes are saved safely on your device. Please click Save again.';
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }

      setSaveError(errorMsg);
      toast?.error?.(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges && !window.confirm('Discard unsaved changes?')) {
      return;
    }
    clearLocalDraft();
    navigate(returnTo);
  };

  // Prepare initial data for EntryEditor (local draft takes precedence if newer)
  const editorInitialData = useMemo(() => {
    if (!entry) return {};
    const base = {
      title: entry.title,
      content: entry.content,
      type: entry.type,
      tags: entry.tags || [],
      isFavorite: entry.isFavorite,
      isPinned: entry.isPinned,
      visibility: entry.visibility || 'private',
      entryDate: entry.entryDate,
    };
    if (localDraft) {
      return { ...base, ...localDraft };
    }
    return base;
  }, [entry, localDraft]);

  if (loading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', color: 'var(--ink-muted)' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto var(--spacing-lg)' }} />
          <p>Loading entry...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--error)', marginBottom: 'var(--spacing-md)' }}>
          Entry not found
        </h2>
        <Button onClick={() => navigate('/entries')} leftIcon={<ArrowLeft size={18} />}>
          Back to Entries
        </Button>
      </div>
    );
  }

  return (
    <div className="edit-entry-page-container">
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
            Edit Entry
          </h1>
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
            {formatDate(entry.updatedAt, 'DATETIME')}
          </p>
        </div>
        <Button variant="subtle" onClick={handleCancel} leftIcon={<ArrowLeft size={18} />} disabled={saving}>
          Cancel
        </Button>
      </header>

      {/* Draft recovery notice */}
      {restoredFromDraft && !saved && (
        <div style={{
          backgroundColor: 'rgba(217, 119, 6, 0.1)',
          border: '1px solid rgba(217, 119, 6, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          color: 'var(--gold-dark, #b45309)',
          marginBottom: 'var(--spacing-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-sm)',
          fontSize: '0.875rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} />
            <span>Restored your unsaved changes from this device.</span>
          </div>
          <button
            type="button"
            onClick={clearLocalDraft}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gold-dark, #b45309)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Discard draft
          </button>
        </div>
      )}

      {/* Error banner with retry reassurance */}
      {saveError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid var(--error, #ef4444)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          color: 'var(--error, #ef4444)',
          marginBottom: 'var(--spacing-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: '0.9rem' }}>
            <strong>{saveError}</strong>
          </div>
        </div>
      )}

      {saved && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--success, #10b981)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-md)',
          color: 'var(--success, #10b981)',
          marginBottom: 'var(--spacing-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <Save size={20} />
          <span>Saved successfully</span>
        </div>
      )}

      <div style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-xl)',
      }} className="paper-texture diary-page">
        <EntryEditor
          initialData={editorInitialData}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleEditorChange}
          saving={saving}
          submitLabel={saving ? 'Saving...' : saveError ? 'Retry Save' : 'Save Changes'}
          submitIcon={saveError ? <RefreshCw size={17} /> : undefined}
          showTitle={true}
          showType={true}
          showTags={true}
          showFavorite={true}
          showPin={true}
        />
      </div>
    </div>
  );
};
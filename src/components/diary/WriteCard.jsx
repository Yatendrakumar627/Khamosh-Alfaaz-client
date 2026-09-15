import { useState, useEffect, useMemo, useRef } from 'react';
import { Pen, CalendarDays, Cloud, Check, ArrowRight } from 'lucide-react';
import { STORAGE_KEYS } from '../../constants';
import { entriesApi } from '../../services/api';
import { useToast } from '../../context';
import { getLocalDateString, formatDate } from '../../utils/helpers';
import { useDraft } from '../../hooks/useDraft';
import { EntryEditor } from './EntryEditor';

const emptyDraft = () => ({
  title: '',
  content: '',
  type: 'diary',
  tags: [],
  isFavorite: false,
  isPinned: false,
  visibility: 'private',
  entryDate: getLocalDateString(),
});

const isFreshDraft = (d) =>
  d &&
  !(d.title || '').trim() &&
  !(d.content || '').trim() &&
  !(Array.isArray(d.tags) && d.tags.length) &&
  !d.isFavorite &&
  !d.isPinned;

const loadStoredDraft = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return { ...emptyDraft(), ...parsed };
      }
    }
  } catch (e) {
    console.warn('Failed to load draft:', e);
  }
  return emptyDraft();
};

export const WriteCard = ({ onSaved }) => {
  const { success, error: showError } = useToast();
  const [edition, setEdition] = useState(0);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  const { draft, setDraft, clearDraft, saving: draftSaving, lastSaved, hasUnsavedChanges } = useDraft(emptyDraft());

  const editorInitial = useMemo(loadStoredDraft, []);

  useEffect(() => {
    if (!isFreshDraft(draft) && !hydratedRef.current) {
      hydratedRef.current = true;
      setHydrated(true);
      setEdition(e => e + 1);
    }
  }, [draft, editorInitial]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !saving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saving]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      await entriesApi.create({
        ...data,
        entryDate: data.entryDate || getLocalDateString(),
      });
      success('Saved. You can breathe now.');
      clearDraft();
      setEdition(e => e + 1);
      onSaved?.();
    } catch (err) {
      console.error('Save failed:', err);
      showError('Failed to save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!isFreshDraft(draft) && !window.confirm('Clear this unsaved draft?')) return;
    clearDraft();
    setEdition(e => e + 1);
  };

  const wordCount = draft.content ? draft.content.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <section
      className="write-card paper-texture"
      style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '18px',
      }}
      aria-label="Write your thoughts"
    >
      {/* Header */}
      <div className="write-card-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'var(--active-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Pen size={20} style={{ color: 'var(--gold)' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1.12rem',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.25,
            }}>
              Write Your Thoughts
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
              Anything on your mind — your day, a thought, a quote, a feeling...
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-muted)', fontSize: '0.8rem', fontWeight: 500, paddingTop: '4px' }}>
          <CalendarDays size={14} style={{ color: 'var(--gold)' }} />
          <span>{formatDate(draft.entryDate || getLocalDateString(), 'SHORT')}</span>
        </div>
      </div>

      {/* Full editor */}
      <div style={{ marginTop: '14px' }}>
        <EntryEditor
          key={edition}
          initialData={hydrated ? draft : editorInitial}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
          showTitle={true}
          showType={true}
          showTags={true}
          showFavorite={true}
          showPin={true}
          submitLabel="Write New Entry"
          submitIcon={<ArrowRight size={18} />}
          submitIconPosition="right"
          onChange={setDraft}
        />
      </div>

      {/* Status footer */}
      <div
        style={{
          marginTop: 'var(--spacing-lg)',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-sm)',
          fontSize: '0.85rem',
          color: 'var(--ink-light)',
        }}
      >
        <span className={draftSaving ? 'write-status saving' : lastSaved ? 'write-status saved' : 'write-status'}>
          {draftSaving ? <Cloud size={13} /> : lastSaved ? <Check size={13} /> : <span className="dot" />}
          {draftSaving ? 'Saving…' : lastSaved ? `Saved ${formatDate(lastSaved, 'TIME')}` : 'Ready to write'}
        </span>
        <span>
          {wordCount} words • {draft.content.length} characters
        </span>
      </div>
    </section>
  );
};

export default WriteCard;
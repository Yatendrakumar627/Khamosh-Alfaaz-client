import { useState, useEffect, useMemo, useRef } from 'react';
import { Pen, Cloud, Check, ArrowRight } from 'lucide-react';
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
        const today = getLocalDateString();
        if (isFreshDraft(parsed)) {
          return { ...emptyDraft(), entryDate: today };
        }
        return { ...emptyDraft(), ...parsed, entryDate: parsed.entryDate || today };
      }
    }
  } catch (e) {
    console.warn('Failed to load draft:', e);
  }
  return emptyDraft();
};

const StatusPill = ({ saving, lastSaved }) => {
  const state = saving ? 'saving' : lastSaved ? 'saved' : 'idle';
  return (
    <span
      className={`write-status ${state}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        fontSize: '0.78rem',
        color: 'var(--ink-muted)',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: state === 'saving' ? 'var(--gold)' : state === 'saved' ? 'var(--success)' : 'var(--ink-light)',
          boxShadow: state === 'saving' ? '0 0 8px var(--gold)' : state === 'saved' ? '0 0 6px var(--success)' : 'none',
          animation: state === 'saving' ? 'pulseGentle 1.4s ease-in-out infinite' : 'none',
        }}
      />
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {state === 'saving' ? 'Saving changes…' : state === 'saved' ? `Saved at ${formatDate(lastSaved, 'TIME')}` : 'Ready to write'}
      </span>
    </span>
  );
};

export const WriteCard = ({ onSaved }) => {
  const { success, error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  const { draft, setDraft, clearDraft, saving: draftSaving, lastSaved, hasUnsavedChanges } = useDraft(emptyDraft());

  const editorInitial = useMemo(loadStoredDraft, []);

  useEffect(() => {
    if (!isFreshDraft(draft) && !hydratedRef.current) {
      hydratedRef.current = true;
      setHydrated(true);
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
  };

  return (
    <section
      className="write-card paper-texture"
      style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px 22px',
        boxShadow: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 24px -4px rgba(0, 0, 0, 0.35)',
      }}
      aria-label="Write your thoughts"
    >
      {/* Header */}
      <div className="write-card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', width: '100%' }}>
        <div
          className="write-card-pen-badge"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(223, 178, 100, 0.22) 0%, rgba(223, 178, 100, 0.06) 100%)',
            border: '1px solid rgba(223, 178, 100, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Pen size={17} style={{ color: 'var(--gold)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="write-card-title" style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            Write Your Thoughts
          </h2>
          <p className="write-card-subtitle" style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
            Anything on your mind — your day, a thought, a quote, a feeling...
          </p>
        </div>
      </div>

      {/* Full editor */}
      <div>
        <EntryEditor
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
          submitIcon={<ArrowRight size={17} />}
          submitIconPosition="right"
          onChange={setDraft}
          statusSlot={<StatusPill saving={draftSaving} lastSaved={lastSaved} />}
        />
      </div>
    </section>
  );
};

export default WriteCard;

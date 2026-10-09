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

const StatusPill = ({ saving, lastSaved }) => {
  const state = saving ? 'saving' : lastSaved ? 'saved' : 'idle';
  return (
    <span className={`write-status ${state}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px' }}>
        {state === 'saving' ? (
          <Cloud size={13} style={{ animation: 'pulseGentle 1.4s ease-in-out infinite' }} />
        ) : state === 'saved' ? (
          <Check size={13} />
        ) : (
          <span className="dot" />
        )}
      </span>
      <span>
        {state === 'saving' ? 'Saving…' : state === 'saved' ? `Saved ${formatDate(lastSaved, 'TIME')}` : 'Ready to write'}
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
        borderRadius: '14px',
        padding: '18px 20px',
      }}
      aria-label="Write your thoughts"
    >
      {/* Header */}
      <div className="write-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div className="write-card-pen-badge" style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--gold-muted) 0%, var(--gold) 55%, var(--gold-dark) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(122, 92, 52, 0.28)',
          }}>
            <Pen size={18} style={{ color: 'var(--paper)' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 className="write-card-title" style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1.18rem',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}>
              Write Your Thoughts
            </h2>
            <p className="write-card-subtitle" style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
              Anything on your mind — your day, a thought, a quote, a feeling...
            </p>
          </div>
        </div>

        <div className="write-card-date-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          color: 'var(--gold)',
          fontSize: '0.8rem',
          fontWeight: 600,
          padding: '5px 13px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--paper-dark)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <CalendarDays size={14} />
          <span>{formatDate(draft.entryDate || getLocalDateString(), 'SHORT')}</span>
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

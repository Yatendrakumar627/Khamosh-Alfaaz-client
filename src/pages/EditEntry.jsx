import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEntry } from '../hooks/useEntries';
import { entriesApi } from '../services/api';
import { EntryEditor } from '../components/diary/EntryEditor';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const isSafePath = (path) => {
  if (!path || typeof path !== 'string') return false;
  return /^\/[a-zA-Z0-9]/.test(path) && !path.includes('://') && !path.startsWith('//');
};

export const EditEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { entry, loading, error, refresh } = useEntry(id);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const from = searchParams.get('from');
  const returnTo = isSafePath(from) ? from : `/entries/${id}`;

  const handleSave = async (data) => {
    setSaving(true);
    setSaved(false);
    try {
      await entriesApi.update(id, {
        ...data,
        entryDate: data.entryDate || entry.entryDate,
      });
      setSaved(true);
      setTimeout(() => navigate(returnTo), 1000);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(returnTo);
  };

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
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '800px', margin: '0 auto' }}>
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

      {saved && (
        <div style={{
          backgroundColor: 'var(--success)15', border: '1px solid var(--success)',
          borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)',
          color: 'var(--success)', marginBottom: 'var(--spacing-lg)',
          display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
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
          initialData={{
            title: entry.title,
            content: entry.content,
            type: entry.type,
            tags: entry.tags || [],
            isFavorite: entry.isFavorite,
            isPinned: entry.isPinned,
            visibility: entry.visibility || 'private',
            entryDate: entry.entryDate,
          }}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
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
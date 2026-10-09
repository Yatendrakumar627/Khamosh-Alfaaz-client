import { useState } from 'react';
import { useExport } from '../hooks/useExport';
import { useEntries } from '../hooks/useEntries';
import { ExportDialog, BackupDialog } from '../components/diary/ExportDialog';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { Download, Save, FileText, ArrowRight } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export const Export = () => {
  const { exportEntry, exportBulk, exportBackup, importBackup, exporting, progress } = useExport();
  const { entries, loading } = useEntries({ limit: 100 });
  const [showExport, setShowExport] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  if (loading && entries.length === 0) {
    return <LoadingState message="Loading your diary..." />;
  }

  const handleExport = async (data) => {
    if (data.scope === 'selected' && data.entryIds?.length) {
      for (const id of data.entryIds) {
        await exportEntry(id, data.format);
      }
    } else {
      await exportBulk(data.format, data);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
          Export & Backup
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
          Keep your words safe — download them as a file or a full backup.
        </p>
      </header>

      {exporting && (
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 'var(--spacing-xs)' }}>
            <span>Exporting...</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }} className="paper-texture diary-page">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent)20', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--ink)' }}>
              Export Diary
            </h2>
          </div>
          <p style={{ margin: '0 0 var(--spacing-lg)', color: 'var(--ink-muted)', fontSize: '0.95rem', lineHeight: 1.45 }}>
            Download your entries as Word, PDF, or plain text — everything, a month, a year, or just a few you pick.
          </p>
          <Button onClick={() => setShowExport(true)} leftIcon={<Download size={18} />} fullWidth>
            Choose Export Options
          </Button>
        </div>

        <div style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }} className="paper-texture diary-page">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--gold)20', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Save size={24} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--ink)' }}>
              Backup & Restore
            </h2>
          </div>
          <p style={{ margin: '0 0 var(--spacing-lg)', color: 'var(--ink-muted)', fontSize: '0.95rem', lineHeight: 1.45 }}>
            Export a complete JSON backup of everything, or restore your diary from a previous backup.
          </p>
          <Button variant="outline" onClick={() => setShowBackup(true)} leftIcon={<Save size={18} />} fullWidth>
            Open Backup Options
          </Button>
        </div>
      </div>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
            Quick Export
          </h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{entries.length} entr{entries.length === 1 ? 'y' : 'ies'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {entries.slice(0, 10).map(entry => (
            <div key={entry._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', flexWrap: 'wrap', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md) var(--spacing-lg)' }} className="paper-texture">
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.title || 'Untitled Entry'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                  {formatDate(entry.entryDate || entry.createdAt, 'SHORT')} • {entry.type}
                </p>
              </div>
              <Button variant="subtle" size="sm" onClick={() => exportEntry(entry._id, 'pdf')} leftIcon={<Download size={16} />}>
                PDF
              </Button>
            </div>
          ))}
          {entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--ink-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
              <ArrowRight size={24} style={{ marginBottom: 'var(--spacing-sm)', opacity: 0.6 }} />
              <p style={{ margin: 0 }}>No entries yet. Write something first to see it here.</p>
            </div>
          )}
        </div>
      </section>

      <ExportDialog
        opened={showExport}
        onClose={() => setShowExport(false)}
        onExport={handleExport}
        exporting={exporting}
        entries={entries}
      />
      <BackupDialog
        opened={showBackup}
        onClose={() => setShowBackup(false)}
        onExport={exportBackup}
        onImport={importBackup}
        exporting={exporting}
        importing={exporting}
      />
    </div>
  );
};

export default Export;
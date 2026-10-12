import { Modal, ConfirmDialog } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { EXPORT_FORMATS, EXPORT_SCOPES } from '../../constants';
import { useState, useRef } from 'react';
import { formatDate, getLocalDateString } from '../../utils/helpers';
import { FileText, FileType, Download, Calendar, X, ArrowDownUp, ArrowUpDown } from 'lucide-react';

export const ExportDialog = ({ opened, onClose, onExport, exporting = false, entries = [] }) => {
  const [format, setFormat] = useState('pdf');
  const [scope, setScope] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [selectingEntries, setSelectingEntries] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState([]);

  // Sort entries for display and selection dynamically based on chosen sortOrder
  const sortedEntriesList = [...entries].sort((a, b) => {
    const dA = new Date(a.entryDate || a.createdAt || 0).getTime();
    const dB = new Date(b.entryDate || b.createdAt || 0).getTime();
    return sortOrder === 'oldest' ? dA - dB : dB - dA;
  });

  const handleSelectAll = () => {
    if (selectedEntries.length === sortedEntriesList.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(sortedEntriesList.map(e => e._id));
    }
  };

  const handleExport = () => {
    let data = { format, scope, sortOrder };
    if (scope === 'custom') {
      data.startDate = customRange.start;
      data.endDate = customRange.end;
    } else if (scope === 'selected') {
      if (selectedEntries.length === 0) {
        alert('Please select at least one entry to export.');
        return;
      }
      data.entryIds = selectedEntries;
    }
    onExport(data);
    onClose();
  };

  const formatIcons = { docx: FileType, pdf: FileType, txt: FileText, md: FileText };

  return (
    <Modal opened={opened} onClose={onClose} title="Export Diary" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        {/* Date Sorting Order Selector */}
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500, color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            Sort Entries By (Date Order)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
              padding: '10px 14px', border: '2px solid', borderRadius: 'var(--radius-md)',
              borderColor: sortOrder === 'newest' ? 'var(--accent)' : 'var(--border)',
              backgroundColor: sortOrder === 'newest' ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
              <input type="radio" name="sortOrder" value="newest" checked={sortOrder === 'newest'} onChange={() => setSortOrder('newest')} style={{ display: 'none' }} />
              <ArrowDownUp size={20} style={{ color: sortOrder === 'newest' ? 'var(--accent)' : 'var(--ink-muted)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: sortOrder === 'newest' ? 'var(--accent)' : 'var(--ink)' }}>New → Old</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-light)' }}>Recent date first</div>
              </div>
            </label>

            <label style={{
              display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
              padding: '10px 14px', border: '2px solid', borderRadius: 'var(--radius-md)',
              borderColor: sortOrder === 'oldest' ? 'var(--accent)' : 'var(--border)',
              backgroundColor: sortOrder === 'oldest' ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
              <input type="radio" name="sortOrder" value="oldest" checked={sortOrder === 'oldest'} onChange={() => setSortOrder('oldest')} style={{ display: 'none' }} />
              <ArrowUpDown size={20} style={{ color: sortOrder === 'oldest' ? 'var(--accent)' : 'var(--ink-muted)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: sortOrder === 'oldest' ? 'var(--accent)' : 'var(--ink)' }}>Old → New</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-light)' }}>Oldest date first</div>
              </div>
            </label>
          </div>
        </div>


        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500, color: 'var(--ink-muted)' }}>
            Document Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)' }}>
            {EXPORT_FORMATS.map(f => {
              const Icon = formatIcons[f.value] || FileText;
              return (
                <label key={f.value} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xs)',
                  padding: 'var(--spacing-sm)', border: '2px solid', borderRadius: 'var(--radius-md)',
                  borderColor: format === f.value ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: format === f.value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  textAlign: 'center',
                }}>
                  <input type="radio" name="format" value={f.value} checked={format === f.value} onChange={() => setFormat(f.value)} style={{ display: 'none' }} />
                  <Icon size={24} style={{ color: format === f.value ? 'var(--accent)' : 'var(--ink-muted)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: format === f.value ? 'var(--accent)' : 'var(--ink)' }}>{f.value.toUpperCase()}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-light)' }}>.{f.value}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 500, color: 'var(--ink-muted)' }}>
            Scope
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {EXPORT_SCOPES.map(s => (
              <label key={s.value} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid', borderRadius: 'var(--radius-md)',
                borderColor: scope === s.value ? 'var(--accent)' : 'var(--border)',
                backgroundColor: scope === s.value ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}>
                <input type="radio" name="scope" value={s.value} checked={scope === s.value} onChange={() => { setScope(s.value); setSelectingEntries(s.value === 'selected'); }} style={{ accentColor: 'var(--accent)' }} />
                <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{s.label}</span>
              </label>
            ))}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
              padding: 'var(--spacing-sm) var(--spacing-md)', border: '1px solid', borderRadius: 'var(--radius-md)',
              borderColor: scope === 'selected' ? 'var(--accent)' : 'var(--border)',
              backgroundColor: scope === 'selected' ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
              <input type="radio" name="scope" value="selected" checked={scope === 'selected'} onChange={() => { setScope('selected'); setSelectingEntries(true); }} style={{ accentColor: 'var(--accent)' }} />
              <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Selected Entries ({selectedEntries.length})</span>
            </label>
          </div>
        </div>

        {scope === 'custom' && (
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                Start Date
              </label>
              <DatePicker
                value={customRange.start}
                onChange={val => setCustomRange(prev => ({ ...prev, start: val }))}
                maxDate={customRange.end || getLocalDateString()}
                placeholder="Start Date"
                ariaLabel="Export start date"
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                End Date
              </label>
              <DatePicker
                value={customRange.end}
                onChange={val => setCustomRange(prev => ({ ...prev, end: val }))}
                minDate={customRange.start}
                maxDate={getLocalDateString()}
                placeholder="End Date"
                ariaLabel="Export end date"
              />
            </div>
          </div>
        )}

        {scope === 'selected' && selectingEntries && sortedEntriesList.length > 0 && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)', padding: '0 4px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                Choose entries (recent first):
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600, padding: 0
                }}
              >
                {selectedEntries.length === sortedEntriesList.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sortedEntriesList.map(entry => (
                <label key={entry._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', padding: '6px 8px', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'background-color 0.15s ease' }}>
                  <input type="checkbox" checked={selectedEntries.includes(entry._id)} onChange={e => setSelectedEntries(prev => e.target.checked ? [...prev, entry._id] : prev.filter(id => id !== entry._id))} style={{ accentColor: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title || 'Untitled'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>{formatDate(entry.entryDate || entry.createdAt, 'SHORT')}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border)' }}>
          <Button variant="subtle" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} loading={exporting} leftIcon={<Download size={18} />}>
            Export {format.toUpperCase()}
          </Button>
        </div>
      </div>
    </Modal>
  );
};


export const BackupDialog = ({ opened, onClose, onExport, onImport, exporting = false, importing = false }) => {
  const [file, setFile] = useState(null);
  const [importError, setImportError] = useState('');
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setImportError('');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImportError('');
    try {
      await onImport(file);
      onClose();
    } catch (err) {
      setImportError(err.response?.data?.message || 'Invalid backup file');
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Backup & Restore" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
        <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--paper-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h4 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 var(--spacing-sm)', color: 'var(--ink)' }}>
            Export Backup
          </h4>
          <p style={{ margin: '0 0 var(--spacing-lg)', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            Download a complete JSON backup of all your entries, categories, and settings.
          </p>
          <Button onClick={onExport} loading={exporting} leftIcon={<Download size={18} />}>
            Export Backup (JSON)
          </Button>
        </div>

        <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--paper-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <h4 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 var(--spacing-sm)', color: 'var(--ink)' }}>
            Import Backup
          </h4>
          <p style={{ margin: '0 0 var(--spacing-lg)', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            Restore your diary from a previously exported JSON backup file. This will replace all current data.
          </p>
          <input type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} id="backup-file" ref={inputRef} />
          <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={importing}>
            Choose Backup File
          </Button>
          {file && (
            <p style={{ margin: 'var(--spacing-sm) 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              Selected: {file.name}
            </p>
          )}
          {importError && (
            <p style={{ margin: 'var(--spacing-sm) 0 0', fontSize: '0.85rem', color: 'var(--error)' }}>
              {importError}
            </p>
          )}
          {file && (
            <Button onClick={handleImport} loading={importing} variant="filled" color="brown" style={{ marginTop: 'var(--spacing-md)' }}>
              Import Backup
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
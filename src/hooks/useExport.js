import { useState, useCallback } from 'react';
import { exportApi, backupApi, downloadBlob } from '../services/api';
import { useToast } from '../context';

export const useExport = () => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { success, error } = useToast();

  const exportEntry = useCallback(async (entryId, format, title = '') => {
    setExporting(true);
    setProgress(0);
    try {
      const response = await exportApi.entry(entryId, format);
      const safeTitle = title
        ? title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)
        : `entry-${entryId}`;
      const filename = `${safeTitle || 'entry'}.${format}`;
      downloadBlob(response.data, filename);
      success('Entry exported successfully');
      return true;
    } catch (err) {
      error('Failed to export entry');
      throw err;
    } finally {
      setExporting(false);
      setProgress(100);
    }
  }, [success, error]);

  const exportBulk = useCallback(async (format, data) => {
    setExporting(true);
    setProgress(0);
    try {
      const response = await exportApi.bulk(format, data);
      const date = new Date().toISOString().split('T')[0];
      const filename = `khamosh-alfaaz-diary-${date}.${format}`;
      downloadBlob(response.data, filename);
      success('Diary exported successfully (Recent to Oldest)');
      return true;
    } catch (err) {
      error('Failed to export diary');
      throw err;
    } finally {
      setExporting(false);
      setProgress(100);
    }
  }, [success, error]);

  const exportBackup = useCallback(async () => {
    setExporting(true);
    setProgress(0);
    try {
      const response = await backupApi.export();
      const date = new Date().toISOString().split('T')[0];
      const filename = `khamosh-alfaaz-backup-${date}.json`;
      downloadBlob(response.data, filename);
      success('Backup created successfully');
      return true;
    } catch (err) {
      error('Failed to create backup');
      throw err;
    } finally {
      setExporting(false);
      setProgress(100);
    }
  }, [success, error]);

  const importBackup = useCallback(async (file) => {
    setExporting(true);
    setProgress(0);
    try {
      await backupApi.import(file);
      success('Backup imported successfully');
      return true;
    } catch (err) {
      error('Failed to import backup');
      throw err;
    } finally {
      setExporting(false);
      setProgress(100);
    }
  }, [success, error]);

  return {
    exporting,
    progress,
    exportEntry,
    exportBulk,
    exportBackup,
    importBackup,
  };
};
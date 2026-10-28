import { describe, it, expect } from 'vitest';
import {
  ENTRY_TYPES,
  DEFAULT_CATEGORIES,
  SORT_OPTIONS,
  EXPORT_FORMATS,
  EXPORT_SCOPES,
  THEMES,
  QUOTES,
  STORAGE_KEYS,
  API_ENDPOINTS,
} from './index';

describe('client constants unit tests', () => {
  it('contains valid and complete ENTRY_TYPES', () => {
    expect(ENTRY_TYPES.length).toBe(8);
    const types = ENTRY_TYPES.map((t) => t.value);
    expect(types).toContain('diary');
    expect(types).toContain('thought');
    expect(types).toContain('quote');
    expect(types).toContain('idea');
    expect(types).toContain('note');
    expect(types).toContain('personal');
    expect(types).toContain('gratitude');
    expect(types).toContain('other');
    expect(DEFAULT_CATEGORIES).toEqual(types);
  });

  it('contains standard SORT_OPTIONS', () => {
    const sortValues = SORT_OPTIONS.map((s) => s.value);
    expect(sortValues).toContain('newest');
    expect(sortValues).toContain('oldest');
    expect(sortValues).toContain('recentlyUpdated');
    expect(sortValues).toContain('az');
  });

  it('contains supported EXPORT_FORMATS and EXPORT_SCOPES', () => {
    const formats = EXPORT_FORMATS.map((f) => f.value);
    expect(formats).toEqual(['pdf', 'docx', 'txt', 'md']);
    const scopes = EXPORT_SCOPES.map((s) => s.value);
    expect(scopes).toEqual(['all', 'month', 'year', 'custom']);
  });

  it('contains supported THEMES', () => {
    const themeValues = THEMES.map((t) => t.value);
    expect(themeValues).toEqual(['light', 'dark', 'system']);
  });

  it('contains curated non-empty QUOTES', () => {
    expect(QUOTES.length).toBeGreaterThan(10);
    QUOTES.forEach((q) => {
      expect(q).toHaveProperty('id');
      expect(typeof q.text).toBe('string');
      expect(q.text.length).toBeGreaterThan(5);
      expect(typeof q.author).toBe('string');
    });
  });

  it('provides consistent STORAGE_KEYS', () => {
    expect(STORAGE_KEYS.THEME).toBe('khamosh-theme');
    expect(STORAGE_KEYS.TOKEN).toBe('ka_token');
    expect(STORAGE_KEYS.EDIT_DRAFT('123')).toBe('khamosh_alfaaz_edit_draft_123');
  });

  it('provides correct API_ENDPOINTS matching backend routes', () => {
    expect(API_ENDPOINTS.SESSION).toBe('/api/session');
    expect(API_ENDPOINTS.SESSION_LOGIN).toBe('/api/session/login');
    expect(API_ENDPOINTS.ENTRIES).toBe('/api/entries');
    expect(API_ENDPOINTS.ENTRY('abc')).toBe('/api/entries/abc');
    expect(API_ENDPOINTS.ENTRY_FAVORITE('abc')).toBe('/api/entries/abc/favorite');
    expect(API_ENDPOINTS.ENTRY_PIN('abc')).toBe('/api/entries/abc/pin');
    expect(API_ENDPOINTS.SEARCH).toBe('/api/entries/search');
    expect(API_ENDPOINTS.CALENDAR).toBe('/api/entries/calendar');
    expect(API_ENDPOINTS.ON_THIS_DAY).toBe('/api/entries/on-this-day');
    expect(API_ENDPOINTS.CATEGORIES).toBe('/api/categories');
    expect(API_ENDPOINTS.BACKUP).toBe('/api/backup');
    expect(API_ENDPOINTS.BACKUP_RESTORE).toBe('/api/backup/restore');
    expect(API_ENDPOINTS.HEALTH).toBe('/api/health');
    expect(API_ENDPOINTS.STATISTICS).toBe('/api/statistics');
    expect(API_ENDPOINTS.PUBLIC_ENTRIES).toBe('/api/public/entries');
    expect(API_ENDPOINTS.STT_TRANSCRIBE).toBe('/api/stt/transcribe');
  });
});


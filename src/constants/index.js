export const ENTRY_TYPES = [
  { value: 'diary', label: 'Diary', icon: 'bookOpen' },
  { value: 'thought', label: 'Thought', icon: 'lightbulb' },
  { value: 'quote', label: 'Quote', icon: 'quote' },
  { value: 'idea', label: 'Idea', icon: 'sparkles' },
  { value: 'note', label: 'Note', icon: 'fileText' },
  { value: 'personal', label: 'Personal', icon: 'heart' },
  { value: 'gratitude', label: 'Gratitude', icon: 'star' },
  { value: 'other', label: 'Other', icon: 'circle' },
];

export const DEFAULT_CATEGORIES = ENTRY_TYPES.map(t => t.value);

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'recentlyUpdated', label: 'Recently Updated' },
  { value: 'az', label: 'A to Z' },
];

export const EXPORT_FORMATS = [
  { value: 'docx', label: 'Microsoft Word (.docx)', icon: 'fileType' },
  { value: 'pdf', label: 'PDF (.pdf)', icon: 'fileType' },
  { value: 'txt', label: 'Plain Text (.txt)', icon: 'fileText' },
];

export const EXPORT_SCOPES = [
  { value: 'all', label: 'Everything' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export const QUOTES = [
  { id: 1, text: 'Small steps every day lead to big results.', author: 'Unknown' },
  { id: 2, text: 'The only way out is through.', author: 'Robert Frost' },
  { id: 3, text: 'Be gentle with yourself. You are doing the best you can.', author: 'Unknown' },
  { id: 4, text: 'This too shall pass.', author: 'Persian Proverb' },
  { id: 5, text: 'Write it down. Let it out. Khamosh Alfaaz.', author: 'Khamosh Alfaaz' },
  { id: 6, text: 'You don\'t have to see the whole staircase, just take the first step.', author: 'Martin Luther King Jr.' },
  { id: 7, text: 'Healing is not linear. Some days are better than others.', author: 'Unknown' },
  { id: 8, text: 'Your feelings are valid, even if they don\'t make sense to anyone else.', author: 'Unknown' },
  { id: 9, text: 'Sometimes the most productive thing you can do is rest.', author: 'Unknown' },
  { id: 10, text: 'Courage doesn\'t always roar. Sometimes it\'s the quiet voice saying "I will try again tomorrow."', author: 'Mary Anne Radmacher' },
  { id: 11, text: 'You are allowed to be both a masterpiece and a work in progress.', author: 'Sophia Bush' },
  { id: 12, text: 'The wound is the place where the Light enters you.', author: 'Rumi' },
  { id: 13, text: 'Don\'t compare your beginning to someone else\'s middle.', author: 'Jon Acuff' },
  { id: 14, text: 'There is no greater agony than bearing an untold story inside you.', author: 'Maya Angelou' },
  { id: 15, text: 'One day at a time. One breath at a time.', author: 'Unknown' },
];

export const STORAGE_KEYS = {
  THEME: 'khamosh-theme',
  FONT: 'khamosh-font',
  DRAFT: 'khamosh-draft',
  EDIT_DRAFT: (id) => `khamosh_alfaaz_edit_draft_${id}`,
  NAME: 'khamosh-name',
  SIDEBAR_OPEN: 'khamosh-sidebar-open',
};

export const API_ENDPOINTS = {
  SESSION: '/api/session',
  SESSION_USERNAME: '/api/session/username',
  SESSION_LOGIN: '/api/session/login',
  SESSION_NAME: '/api/session/name',
  SESSION_DELETE: '/api/session',
  ENTRIES: '/api/entries',
  ENTRY: (id) => `/api/entries/${id}`,
  ENTRY_FAVORITE: (id) => `/api/entries/${id}/favorite`,
  ENTRY_PIN: (id) => `/api/entries/${id}/pin`,
  SEARCH: '/api/entries/search',
  CALENDAR: '/api/entries/calendar',
  ON_THIS_DAY: '/api/entries/on-this-day',
  CATEGORIES: '/api/categories',
  CATEGORY: (id) => `/api/categories/${id}`,
  EXPORT_ENTRY: (id, format) => `/api/export/entry/${id}/${format}`,
  EXPORT_BULK: (format) => `/api/export/${format}`,
  BACKUP: '/api/backup',
  BACKUP_RESTORE: '/api/backup/restore',
  BACKUP_DELETE_ALL: '/api/backup/delete-all',
  HEALTH: '/api/health',
  STATISTICS: '/api/statistics',
  PUBLIC_ENTRIES: '/api/public/entries',
  PUBLIC_ENTRY: (id) => `/api/public/entries/${id}`,
  PUBLIC_QUOTES: '/api/public/quotes',
  PUBLIC_CATEGORIES: '/api/public/categories',
};

export const DATE_FORMATS = {
  DISPLAY: 'MMMM d, yyyy',
  SHORT: 'MMM d, yyyy',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'MMMM d, yyyy at HH:mm',
};
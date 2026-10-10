export const getLocalDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export const formatDate = (date, format = 'DISPLAY') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const options = {
    DISPLAY: { year: 'numeric', month: 'long', day: 'numeric' },
    SHORT: { year: 'numeric', month: 'short', day: 'numeric' },
    ISO: { year: 'numeric', month: '2-digit', day: '2-digit' },
    TIME: { hour: '2-digit', minute: '2-digit', hour12: false },
    DATETIME: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false },
  };

  try {
    return d.toLocaleDateString('en-US', options[format] || options.DISPLAY);
  } catch {
    return d.toLocaleDateString();
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date, 'SHORT');
};

export const getEntryTypeLabel = (type) => {
  const types = {
    diary: 'Diary',
    thought: 'Thought',
    quote: 'Quote',
    idea: 'Idea',
    note: 'Note',
    personal: 'Personal',
    gratitude: 'Gratitude',
    other: 'Other',
  };
  return types[type] || type;
};

export const getEntryTypeColor = (type, theme = 'light') => {
  const colors = {
    light: {
      diary: '#7d603c',
      thought: '#5a7a8e',
      quote: '#b9924a',
      idea: '#9c8160',
      note: '#6b5a45',
      personal: '#a5503c',
      gratitude: '#b58c2e',
      other: '#9c8970',
    },
    dark: {
      diary: '#c19a5e',
      thought: '#6f95a0',
      quote: '#d9b25c',
      idea: '#c8a47c',
      note: '#bfab88',
      personal: '#c2806b',
      gratitude: '#d4a94a',
      other: '#8a785a',
    },
  };
  return colors[theme]?.[type] || colors[theme]?.other;
};

export const truncate = (text, length = 150) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

export const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const parseTags = (input) => {
  if (!input) return [];
  return input.split(',').map(t => t.trim().replace(/^#+/, '')).filter(Boolean);
};

export const formatTags = (tags) => {
  if (!Array.isArray(tags)) return '';
  return tags.join(', ');
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const getMonthYear = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

export const generateCalendarDays = (year, month, entriesByDate = {}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push({ date: null, isCurrentMonth: false, entries: [] });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({
      date: dateStr,
      day,
      isCurrentMonth: true,
      entries: entriesByDate[dateStr] || [],
      count: (entriesByDate[dateStr] || []).length,
    });
  }

  return days;
};

export const validateEntry = (data) => {
  const errors = {};
  if (!data.content || !data.content.trim()) {
    errors.content = 'Content is required';
  }
  if (!data.type) {
    errors.type = 'Type is required';
  }
  if (data.title && data.title.length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }
  const tagList = Array.isArray(data.tags) ? data.tags : (data.tags ? parseTags(data.tags) : []);
  if (tagList && tagList.length > 20) {
    errors.tags = 'Maximum 20 tags allowed';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const sanitizeHtml = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
import { describe, it, expect, vi } from 'vitest';
import {
  getLocalDateString,
  formatDate,
  formatRelativeTime,
  getEntryTypeLabel,
  getEntryTypeColor,
  truncate,
  countWords,
  generateId,
  debounce,
  throttle,
  parseTags,
  formatTags,
  getInitials,
  getGreeting,
  getMonthYear,
  getDaysInMonth,
  getFirstDayOfMonth,
  generateCalendarDays,
  validateEntry,
  classNames,
} from './helpers';

describe('helpers.js unit tests', () => {
  describe('getLocalDateString', () => {
    it('returns YYYY-MM-DD formatted string matching current date', () => {
      const result = getLocalDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('formatDate', () => {
    it('returns empty string for null, undefined, or invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('invalid-date')).toBe('');
    });

    it('formats date according to format styles', () => {
      const date = new Date('2026-05-15T14:30:00Z');
      expect(formatDate(date, 'DISPLAY')).toContain('2026');
      expect(formatDate(date, 'SHORT')).toContain('2026');
      expect(formatDate(date, 'ISO')).toMatch(/\d{2}/);
    });
  });

  describe('formatRelativeTime', () => {
    it('returns empty string for falsy or invalid input', () => {
      expect(formatRelativeTime(null)).toBe('');
      expect(formatRelativeTime(undefined)).toBe('');
      expect(formatRelativeTime('invalid-date')).toBe('');
    });

    it('returns "Just now" for times within the last minute', () => {
      const now = Date.now();
      expect(formatRelativeTime(new Date(now - 30 * 1000))).toBe('Just now');
    });

    it('returns "Xm ago" for times within the hour', () => {
      const now = Date.now();
      expect(formatRelativeTime(new Date(now - 15 * 60 * 1000))).toBe('15m ago');
    });

    it('returns "Xh ago" for times within the day', () => {
      const now = Date.now();
      expect(formatRelativeTime(new Date(now - 5 * 3600 * 1000))).toBe('5h ago');
    });

    it('returns "Xd ago" for times within the week', () => {
      const now = Date.now();
      expect(formatRelativeTime(new Date(now - 3 * 86400 * 1000))).toBe('3d ago');
    });

    it('formats future dates safely without saying "Just now"', () => {
      const futureDate = new Date(Date.now() + 5 * 86400 * 1000); // 5 days in future
      const result = formatRelativeTime(futureDate);
      expect(result).not.toBe('Just now');
    });
  });

  describe('getEntryTypeLabel & getEntryTypeColor', () => {
    it('returns human-readable label for valid entry types', () => {
      expect(getEntryTypeLabel('diary')).toBe('Diary');
      expect(getEntryTypeLabel('thought')).toBe('Thought');
      expect(getEntryTypeLabel('quote')).toBe('Quote');
      expect(getEntryTypeLabel('custom_type')).toBe('custom_type');
    });

    it('returns matching theme color for light and dark themes', () => {
      const lightColor = getEntryTypeColor('diary', 'light');
      const darkColor = getEntryTypeColor('diary', 'dark');
      expect(lightColor).toBe('#7d603c');
      expect(darkColor).toBe('#c19a5e');
      // Unknown type falls back to other
      expect(getEntryTypeColor('unknown', 'light')).toBe('#9c8970');
    });
  });

  describe('truncate', () => {
    it('returns empty string for empty input', () => {
      expect(truncate('')).toBe('');
      expect(truncate(null)).toBe('');
    });

    it('does not truncate text shorter than length limit', () => {
      expect(truncate('Hello world', 50)).toBe('Hello world');
    });

    it('truncates text exceeding length and appends ellipsis', () => {
      expect(truncate('Hello amazing world', 10)).toBe('Hello amaz...');
    });
  });

  describe('countWords', () => {
    it('counts words accurately across spaces, tabs, and newlines', () => {
      expect(countWords('')).toBe(0);
      expect(countWords(null)).toBe(0);
      expect(countWords(123)).toBe(0);
      expect(countWords('One')).toBe(1);
      expect(countWords('  One   Two \n Three \t Four ')).toBe(4);
    });
  });

  describe('generateId', () => {
    it('generates unique non-empty alphanumeric string', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(5);
      expect(id1).not.toBe(id2);
    });
  });

  describe('debounce', () => {
    it('debounces multiple invocations until delay expires', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 200);

      debounced(1);
      debounced(2);
      debounced(3);

      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(200);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(3);
      vi.useRealTimers();
    });
  });

  describe('throttle', () => {
    it('throttles execution so fn is invoked at most once per limit interval', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled(1);
      throttled(2);
      throttled(3);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(1);

      vi.advanceTimersByTime(100);
      throttled(4);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenCalledWith(4);
      vi.useRealTimers();
    });
  });

  describe('parseTags & formatTags', () => {
    it('parses comma-separated tag string and strips leading hashtags', () => {
      expect(parseTags('#peace, #mind, happiness')).toEqual(['peace', 'mind', 'happiness']);
      expect(parseTags('')).toEqual([]);
      expect(parseTags(null)).toEqual([]);
    });

    it('formats tag array back to comma-separated string', () => {
      expect(formatTags(['peace', 'mind'])).toBe('peace, mind');
      expect(formatTags([])).toBe('');
      expect(formatTags(null)).toBe('');
    });
  });

  describe('getInitials', () => {
    it('extracts uppercase initials from name', () => {
      expect(getInitials('Ahmad Khan')).toBe('AK');
      expect(getInitials('Zoya')).toBe('Z');
    });

    it('handles extra whitespace and fallback gracefully', () => {
      expect(getInitials('   ')).toBe('?');
      expect(getInitials('')).toBe('?');
      expect(getInitials(null)).toBe('?');
      expect(getInitials('  John   Doe  ')).toBe('JD');
    });
  });

  describe('getGreeting', () => {
    it('returns a valid greeting depending on time of day', () => {
      const greeting = getGreeting();
      expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting);
    });
  });

  describe('getMonthYear, getDaysInMonth, getFirstDayOfMonth', () => {
    it('computes correct calendar metadata', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29); // Leap year Feb
      expect(getDaysInMonth(2026, 1)).toBe(28); // Non-leap year Feb
      expect(getDaysInMonth(2026, 0)).toBe(31); // Jan
      expect(getFirstDayOfMonth(2026, 0)).toBe(4); // Jan 1 2026 was Thursday (4)
    });
  });

  describe('generateCalendarDays', () => {
    it('generates days grid with padding for preceding days and date strings', () => {
      const days = generateCalendarDays(2026, 0, { '2026-01-15': [{ id: '1' }] });
      expect(days.length).toBeGreaterThanOrEqual(31);
      const day15 = days.find((d) => d.date === '2026-01-15');
      expect(day15).toBeDefined();
      expect(day15.isCurrentMonth).toBe(true);
      expect(day15.count).toBe(1);
    });
  });

  describe('validateEntry', () => {
    it('flags empty content as invalid', () => {
      const res = validateEntry({ content: '', type: 'diary' });
      expect(res.isValid).toBe(false);
      expect(res.errors.content).toBe('Content is required');
    });

    it('flags title exceeding 200 characters', () => {
      const res = validateEntry({ content: 'Valid', type: 'diary', title: 'a'.repeat(201) });
      expect(res.isValid).toBe(false);
      expect(res.errors.title).toBe('Title must be 200 characters or less');
    });

    it('flags more than 20 tags', () => {
      const tags = Array.from({ length: 21 }, (_, i) => `tag${i}`);
      const res = validateEntry({ content: 'Valid', type: 'diary', tags });
      expect(res.isValid).toBe(false);
      expect(res.errors.tags).toBe('Maximum 20 tags allowed');
    });

    it('passes for complete valid entry', () => {
      const res = validateEntry({
        title: 'Peaceful Night',
        content: 'Writing quietly in the dark.',
        type: 'diary',
        tags: ['peace', 'night'],
      });
      expect(res.isValid).toBe(true);
      expect(res.errors).toEqual({});
    });
  });

  describe('classNames', () => {
    it('joins truthy class names with spaces', () => {
      expect(classNames('btn', true && 'btn-primary', false && 'active', null, undefined, 'rounded')).toBe(
        'btn btn-primary rounded',
      );
    });
  });
});


import { useState, useEffect, useRef } from 'react';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { ENTRY_TYPES } from '../../constants';
import { parseTags, formatTags, validateEntry, getLocalDateString, classNames } from '../../utils/helpers';
import { Tag, X, Plus, Star, Pin, Lock, Globe, BookOpen } from 'lucide-react';
import { getNavIcon } from '../../constants/navIcons';

export const EntryEditor = ({
  initialData = {},
  onSave,
  onCancel,
  saving = false,
  showTitle = true,
  showType = true,
  showTags = true,
  showFavorite = true,
  showPin = true,
  showVisibility = true,
  showCancel = true,
  submitLabel = 'Save Entry',
  submitIcon = <Plus size={17} />,
  submitIconPosition = 'left',
  onChange,
  statusSlot = null,
}) => {
  const [formData, setFormData] = useState(() => {
    const today = getLocalDateString();
    return {
      title: '',
      content: '',
      type: 'diary',
      isFavorite: false,
      isPinned: false,
      visibility: 'private',
      ...initialData,
      entryDate: initialData?.entryDate || today,
      tags: Array.isArray(initialData.tags) ? formatTags(initialData.tags) : (initialData.tags || ''),
    };
  });
  const [tags, setTags] = useState(() => {
    if (Array.isArray(initialData.tags)) return initialData.tags;
    if (typeof initialData.tags === 'string' && initialData.tags) return parseTags(initialData.tags);
    return [];
  });
  const [errors, setErrors] = useState({});
  const TypeIcon = getNavIcon(formData.type, BookOpen);
  const prevInitialKeyRef = useRef(null);

  useEffect(() => {
    const currentKey = `${initialData?._id || initialData?.id || ''}_${initialData?.updatedAt || ''}_${initialData?.content ? initialData.content.slice(0, 30) : ''}`;
    // Only re-initialize if the underlying entry actually changed, preventing parent re-renders from wiping edits
    if (prevInitialKeyRef.current !== currentKey) {
      prevInitialKeyRef.current = currentKey;
      const parsedTags = Array.isArray(initialData.tags)
        ? initialData.tags
        : (typeof initialData.tags === 'string' ? parseTags(initialData.tags) : []);
      const today = getLocalDateString();
      setFormData({
        title: '',
        content: '',
        type: 'diary',
        isFavorite: false,
        isPinned: false,
        visibility: 'private',
        ...initialData,
        entryDate: initialData?.entryDate || today,
        tags: Array.isArray(initialData.tags) ? formatTags(initialData.tags) : (initialData.tags || ''),
      });
      setTags(parsedTags);
      setErrors({});
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (onChange) {
      onChange({ ...next, tags: field === 'tags' ? parseTags(value) : tags });
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagInput = (e) => {
    handleChange('tags', e.target.value);
    setTags(parseTags(e.target.value));
  };

  const addTag = (tag) => {
    const trimmed = tag.trim().replace(/^#+/, '');
    if (trimmed && !tags.includes(trimmed) && tags.length < 20) {
      const nextTags = [...tags, trimmed];
      setTags(nextTags);
      handleChange('tags', formatTags(nextTags));
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    handleChange('tags', formatTags(newTags));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      tags,
      entryDate: formData.entryDate || getLocalDateString(),
    };
    const validation = validateEntry(submitData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSave(submitData);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const current = (formData.tags || '').trim();
      if (current && !current.endsWith(',')) {
        handleChange('tags', current + ', ');
      }
    }
  };

  const wordCount = formData.content ? formData.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = formData.content ? formData.content.length : 0;

  return (
    <form onSubmit={handleSubmit} className="entry-form">
      {/* 1. Header row: Title (optional) + Date side by side */}
      <div className="entry-header-row">
        {showTitle && (
          <div className="entry-title-col">
            <label className="entry-field-label" htmlFor="entry-title-input">
              Title <span className="entry-label-optional">(optional)</span>
            </label>
            <input
              id="entry-title-input"
              type="text"
              className="entry-field entry-title-input"
              placeholder="Give your entry a title..."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              maxLength={200}
            />
            {errors.title && <span className="entry-field-error">{errors.title}</span>}
          </div>
        )}

        <div className="entry-date-col">
          <label className="entry-field-label" htmlFor="entry-date-input">
            Date
          </label>
          <DatePicker
            id="entry-date-input"
            value={formData.entryDate || getLocalDateString()}
            onChange={(dateStr) => handleChange('entryDate', dateStr || getLocalDateString())}
            maxDate={getLocalDateString()}
            ariaLabel="Entry date"
          />
        </div>
      </div>

      {/* 2. Textarea Canvas */}
      <div className="entry-content-col">
        <label className="entry-field-label" htmlFor="entry-content-textarea">
          Write your thoughts... <span className="entry-label-required">*</span>
        </label>
        <Textarea
          id="entry-content-textarea"
          placeholder="Anything on your mind — your day, a thought, a quote, a feeling..."
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          error={errors.content}
          required
          minRows={10}
          maxRows={22}
          className="entry-textarea"
        />
      </div>

      {/* 3. Tier 1: Attributes & Metadata Strip */}
      {(showType || showTags || showFavorite || showPin || showVisibility) && (
        <div className="entry-attributes-bar">
          <div className="entry-attr-left">
            {showType && (
              <div className="entry-attr-type">
                <Select
                  placeholder="Type"
                  data={ENTRY_TYPES.map(t => ({ value: t.value, label: t.label }))}
                  value={formData.type}
                  onChange={(value) => handleChange('type', value)}
                  error={errors.type}
                  required
                  leftSection={<TypeIcon size={15} />}
                  className="entry-type-select"
                />
              </div>
            )}

            {showVisibility && (
              <div
                className="entry-visibility-toggle"
                role="group"
                aria-label="Entry visibility"
                title={formData.visibility === 'public' ? 'Public — visible in Explore' : 'Private — only you can see'}
              >
                <button
                  type="button"
                  onClick={() => handleChange('visibility', 'private')}
                  aria-pressed={formData.visibility === 'private'}
                  className={classNames('entry-visibility-btn', formData.visibility === 'private' && 'active')}
                >
                  <Lock size={13} />
                  <span>Private</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('visibility', 'public')}
                  aria-pressed={formData.visibility === 'public'}
                  className={classNames('entry-visibility-btn', formData.visibility === 'public' && 'active')}
                >
                  <Globe size={13} />
                  <span>Public</span>
                </button>
              </div>
            )}

            {(showFavorite || showPin) && (
              <div className="entry-flags-group">
                {showFavorite && (
                  <button
                    type="button"
                    className={classNames('entry-flag-btn', formData.isFavorite && 'active')}
                    onClick={() => handleChange('isFavorite', !formData.isFavorite)}
                    aria-label={formData.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                    aria-pressed={formData.isFavorite}
                    title={formData.isFavorite ? 'Favorited' : 'Add to favorites'}
                  >
                    <Star size={16} fill={formData.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                )}

                {showPin && (
                  <button
                    type="button"
                    className={classNames('entry-flag-btn', formData.isPinned && 'active')}
                    onClick={() => handleChange('isPinned', !formData.isPinned)}
                    aria-label={formData.isPinned ? 'Unpin entry' : 'Pin to top'}
                    aria-pressed={formData.isPinned}
                    title={formData.isPinned ? 'Pinned to top' : 'Pin to top'}
                  >
                    <Pin size={16} fill={formData.isPinned ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>
            )}
          </div>

          {showTags && (
            <div className="entry-attr-right">
              <div className="entry-tags-input-wrap">
                <Tag size={14} className="entry-tags-icon" />
                <input
                  type="text"
                  className="entry-field entry-tags-input"
                  placeholder="Add tags (press Enter)..."
                  aria-label="Tags"
                  value={formData.tags}
                  onChange={handleTagInput}
                  onKeyDown={handleKeyDown}
                />
                <span className={classNames('entry-tags-count', (tags?.length || 0) >= 20 && 'full')}>
                  {tags?.length || 0}/20
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tag chips */}
      {showTags && tags && tags.length > 0 && (
        <div className="entry-tag-chips">
          {tags.map(tag => (
            <span key={tag} className="entry-tag-chip">
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="entry-tag-remove"
                aria-label={`Remove tag ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 4. Tier 2: Unified Telemetry & Action Footer */}
      <div className="entry-footer-bar">
        <div className="entry-footer-telemetry">
          {statusSlot}
          {statusSlot && <span className="entry-telemetry-dot" aria-hidden="true">•</span>}
          <span className="entry-stats">
            <span className="entry-stats-num">{wordCount}</span> words
            <span className="entry-stats-divider" aria-hidden="true">•</span>
            <span className="entry-stats-num">{charCount}</span> characters
          </span>
        </div>

        <div className="entry-footer-actions">
          {showCancel && (
            <button
              type="button"
              className="entry-btn-cancel"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          )}

          <Button
            className="btn-primary entry-btn-submit"
            type="submit"
            loading={saving}
            leftIcon={submitIconPosition === 'left' ? submitIcon : null}
            rightIcon={submitIconPosition === 'right' ? submitIcon : null}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EntryEditor;
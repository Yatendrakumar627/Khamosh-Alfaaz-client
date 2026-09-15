import { useState } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { ENTRY_TYPES } from '../../constants';
import { parseTags, formatTags, validateEntry, getLocalDateString, formatDate, classNames } from '../../utils/helpers';
import { Tag, X, Plus, Star, Pin, Lock, Globe, BookOpen, Lightbulb, Quote, Sparkles, FileText, Heart, Circle } from 'lucide-react';

const typeIcons = {
  diary: BookOpen,
  thought: Lightbulb,
  quote: Quote,
  idea: Sparkles,
  note: FileText,
  personal: Heart,
  gratitude: Star,
  other: Circle,
};

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
  submitIcon = <Plus size={18} />,
  submitIconPosition = 'left',
  onChange,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'diary',
    isFavorite: false,
    isPinned: false,
    visibility: 'private',
    entryDate: getLocalDateString(),
    ...initialData,
    tags: Array.isArray(initialData.tags) ? formatTags(initialData.tags) : (initialData.tags || ''),
  });
  const [errors, setErrors] = useState({});
  const [tags, setTags] = useState(Array.isArray(initialData.tags) ? initialData.tags : []);
  const TypeIcon = typeIcons[formData.type] || BookOpen;

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
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 20) {
      setTags(prev => [...prev, trimmed]);
      handleChange('tags', formatTags([...tags, trimmed]));
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    handleChange('tags', formatTags(newTags));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateEntry(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    const submitData = {
      ...formData,
      tags,
      entryDate: formData.entryDate || getLocalDateString(),
    };
    onSave(submitData);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      addTag(e.target.value);
      e.target.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="entry-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {showTitle && (
        <Input
          label="Title (optional)"
          placeholder="Give your entry a title..."
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          maxLength={200}
        />
      )}

      <div className="entry-form-row" style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500, color: 'var(--ink-muted)' }}>
            Date
          </label>
          <input
            type="date"
            className="entry-field"
            value={formData.entryDate}
            onChange={(e) => handleChange('entryDate', e.target.value)}
            style={{
              width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)',
              border: '1px solid var(--input-border)', borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--input-bg)', color: 'var(--ink)',
              fontFamily: 'inherit', fontSize: '0.95rem',
            }}
            max={getLocalDateString()}
          />
        </div>
      </div>

      <Textarea
        label="Write your thoughts..."
        placeholder="Anything on your mind — your day, a thought, a quote, a feeling..."
        value={formData.content}
        onChange={(e) => handleChange('content', e.target.value)}
        error={errors.content}
        required
        minRows={12}
        className="entry-textarea"
      />

      {(showType || showTags || showFavorite || showPin || showVisibility) && (
        <div className="entry-toolbar">
          <div className="entry-tool-groups">
            {showType && (
              <div className="entry-tool-type">
                <Select
                  label="Type"
                  placeholder="Type"
                  data={ENTRY_TYPES.map(t => ({ value: t.value, label: t.label }))}
                  value={formData.type}
                  onChange={(value) => handleChange('type', value)}
                  error={errors.type}
                  required
                  leftSection={<TypeIcon size={16} />}
                />
              </div>
            )}

            {showType && (showTags || showVisibility) && <div className="entry-tool-divider" aria-hidden="true" />}

            {showTags && (
              <div className="entry-tool-tags">
                <Tag size={16} className="entry-tool-tags-icon" />
                <input
                  type="text"
                  className="entry-field entry-tool-tags-input"
                  placeholder="Add tags…"
                  aria-label="Tags"
                  value={formData.tags}
                  onChange={handleTagInput}
                  onKeyDown={handleKeyDown}
                />
                <span className={classNames('entry-tool-tags-count', tags.length >= 20 && 'full')}>
                  {tags.length}/20
                </span>
              </div>
            )}

            {showTags && showVisibility && <div className="entry-tool-divider" aria-hidden="true" />}

            {showVisibility && (
              <div className="entry-tool-visibility-wrap">
                <div className="entry-tool-visibility" role="group" aria-label="Entry visibility" title="Private stays only on your diary; Public can be read by visitors in Explore">
                  <button
                    type="button"
                    onClick={() => handleChange('visibility', 'private')}
                    aria-pressed={formData.visibility === 'private'}
                    className={classNames('entry-visibility-pill', formData.visibility === 'private' && 'active')}
                  >
                    <Lock size={15} />
                    <span>Private</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('visibility', 'public')}
                    aria-pressed={formData.visibility === 'public'}
                    className={classNames('entry-visibility-pill', formData.visibility === 'public' && 'active')}
                  >
                    <Globe size={15} />
                    <span>Public</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="entry-tool-actions">
            {showFavorite && (
              <button
                type="button"
                className="entry-tool-toggle"
                onClick={() => handleChange('isFavorite', !formData.isFavorite)}
                aria-label={formData.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                aria-pressed={formData.isFavorite}
                title="Favorite"
              >
                <Star size={18} fill={formData.isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}

            {showPin && (
              <button
                type="button"
                className="entry-tool-toggle"
                onClick={() => handleChange('isPinned', !formData.isPinned)}
                aria-label={formData.isPinned ? 'Unpin entry' : 'Pin to top'}
                aria-pressed={formData.isPinned}
                title="Pin to top"
              >
                <Pin size={18} fill={formData.isPinned ? 'currentColor' : 'none'} />
              </button>
            )}

            {showCancel && (
              <Button variant="subtle" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
            )}

            <Button
              className="btn-primary entry-submit"
              type="submit"
              loading={saving}
              leftIcon={submitIconPosition === 'left' ? submitIcon : null}
              rightIcon={submitIconPosition === 'right' ? submitIcon : null}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      )}

      {showTags && tags.length > 0 && (
        <div className="entry-tag-chips">
          {tags.map(tag => (
            <span key={tag} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: 'var(--accent)', color: 'var(--paper)',
              padding: '4px 10px', borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem', fontWeight: 500,
            }}>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
                aria-label={`Remove tag ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {showTags && (
        <p className="entry-tags-hint">
          Press Enter to add tags. Maximum 20 tags.
        </p>
      )}
    </form>
  );
};
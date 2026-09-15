import { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useEntries';
import { categoriesApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { classNames } from '../utils/helpers';
import { DEFAULT_CATEGORIES } from '../constants';

export const Categories = () => {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory, refresh } = useCategories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  const handleCreate = async () => {
    if (!newCategoryName.trim()) { setCreateError('Category name is required'); return; }
    setCreateError('');
    try {
      await createCategory({ name: newCategoryName.trim() });
      setShowCreateModal(false);
      setNewCategoryName('');
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleEdit = async () => {
    if (!editCategoryName.trim()) { setEditError('Category name is required'); return; }
    setEditError('');
    try {
      await updateCategory(editingCategory._id, { name: editCategoryName.trim() });
      setEditingCategory(null);
      setEditCategoryName('');
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Entries using it will keep the tag but the category will be removed.')) return;
    try {
      await deleteCategory(id);
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const startEdit = (cat) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
    setEditError('');
  };

  const isDefault = (name) => DEFAULT_CATEGORIES.includes(name);

  if (loading) {
    return <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--ink-muted)' }}>Loading categories...</div>;
  }

  if (error) {
    return <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--error)' }}>Failed to load categories: {error}</div>;
  }

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
            Categories
          </h1>
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
            Organize your entries. Default categories can&apos;t be deleted.
          </p>
        </div>
        <Button onClick={() => { setShowCreateModal(true); setNewCategoryName(''); setCreateError(''); }} leftIcon={<Plus size={18} />}>
          New Category
        </Button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {categories.map(category => (
          <div key={category._id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          }} className="paper-texture diary-page">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <Tag size={22} style={{ color: 'var(--accent)' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 500, color: 'var(--ink)', fontSize: '1.05rem' }}>{category.name}</p>
                {isDefault(category.name) && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-light)', backgroundColor: 'var(--hover-bg, var(--paper-dark))', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    Default
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              {!isDefault(category.name) && (
                <Button variant="subtle" size="sm" onClick={() => startEdit(category)} leftIcon={<Edit size={16} />}><span style={{ display: 'none' }}>Edit</span></Button>
              )}
              {!isDefault(category.name) && (
                <Button variant="subtle" size="sm" color="red" onClick={() => handleDelete(category._id)} leftIcon={<Trash2 size={16} />}><span style={{ display: 'none' }}>Delete</span></Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal opened={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Category" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <Input
            label="Category Name"
            placeholder="e.g., Travel, Dreams, Work"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            error={createError}
            required
            maxLength={50}
            autoFocus
            leftIcon={<Tag size={20} />}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
            <Button variant="subtle" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} leftIcon={<Plus size={18} />}>Create</Button>
          </div>
        </div>
      </Modal>

      {editingCategory && (
        <Modal opened={true} onClose={() => setEditingCategory(null)} title="Edit Category" size="sm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <Input
              label="Category Name"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              error={editError}
              required
              maxLength={50}
              autoFocus
              leftIcon={<Tag size={20} />}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
              <Button variant="subtle" onClick={() => setEditingCategory(null)}>Cancel</Button>
              <Button onClick={handleEdit} leftIcon={<Plus size={18} />}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
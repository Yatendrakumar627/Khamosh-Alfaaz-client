import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useEntries';
import { CATEGORY_SECTIONS } from '../constants/categorySections';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Plus, Edit, Trash2, Tag, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../constants';

export const Categories = () => {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories();
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

  // Filter out custom user categories that aren't the default built-ins
  const customCategories = categories.filter(c => !isDefault(c.name.toLowerCase()));

  return (
    <div className="page-container" style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={22} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)' }}>
            Spaces & Sections
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
          Categories & Writing Spaces
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: '0.96rem', maxWidth: '640px', lineHeight: 1.5 }}>
          Explore every individual writing section in Khamosh Alfaaz. Each section has its own dedicated space, tailored prompts, and tranquil environment.
        </p>
      </header>

      {/* Grid of Dedicated Category Sections */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.35rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Dedicated Sections</span>
        </h2>

        <div className="category-sections-grid">
          {CATEGORY_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.type}
                to={section.path}
                style={{ textDecoration: 'none', color: 'inherit' }}
                className="category-card-link"
              >
                <div
                  className="paper-texture category-hub-card"
                  style={{
                    backgroundColor: 'var(--paper)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '20px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, var(--gold-muted) 0%, var(--gold) 55%, var(--gold-dark) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--paper)',
                          boxShadow: '0 4px 12px rgba(122, 92, 52, 0.22)',
                        }}
                      >
                        <Icon size={22} strokeWidth={2.1} />
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: 'var(--gold)',
                          backgroundColor: 'var(--paper-dark)',
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        Section
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-family-heading)',
                        fontSize: '1.22rem',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        margin: '0 0 6px',
                      }}
                    >
                      {section.title}
                    </h3>

                    <p
                      style={{
                        margin: '0 0 12px',
                        fontSize: '0.84rem',
                        color: 'var(--ink-muted)',
                        lineHeight: 1.45,
                      }}
                    >
                      {section.tagline}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--gold)',
                    }}
                  >
                    <span>Open {section.label}</span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Custom User Tags & Custom Categories Section */}
      <section style={{ borderTop: '1px solid var(--border)', paddingTop: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px' }}>
              Custom Categories & Tags
            </h2>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: '0.86rem' }}>
              Create personalized tags to organize your thoughts even further.
            </p>
          </div>
          <Button
            onClick={() => { setShowCreateModal(true); setNewCategoryName(''); setCreateError(''); }}
            leftIcon={<Plus size={16} />}
            variant="subtle"
            size="sm"
          >
            New Custom Category
          </Button>
        </div>

        {customCategories.length === 0 ? (
          <div
            className="paper-texture"
            style={{
              padding: '24px',
              textAlign: 'center',
              backgroundColor: 'var(--paper)',
              border: '1px dashed var(--border)',
              borderRadius: '12px',
              color: 'var(--ink-muted)',
              fontSize: '0.88rem',
            }}
          >
            No custom categories yet. Add custom tags like &ldquo;Travel&rdquo;, &ldquo;Dreams&rdquo;, or &ldquo;Reading&rdquo; anytime.
          </div>
        ) : (
          <div className="custom-categories-grid">
            {customCategories.map(category => (
              <div
                key={category._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--paper)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                }}
                className="paper-texture"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Tag size={18} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontWeight: 500, color: 'var(--ink)', fontSize: '0.92rem' }}>
                    {category.name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button variant="subtle" size="sm" onClick={() => startEdit(category)} leftIcon={<Edit size={14} />} />
                  <Button variant="subtle" size="sm" color="red" onClick={() => handleDelete(category._id)} leftIcon={<Trash2 size={14} />} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Modal */}
      <Modal opened={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Category" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <Input
            label="Category Name"
            placeholder="e.g., Travel, Dreams, Books"
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

      {/* Edit Modal */}
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

export default Categories;
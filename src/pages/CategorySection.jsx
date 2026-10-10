import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { CATEGORY_SECTIONS, getCategoryBySlugOrType } from '../constants/categorySections';
import { useEntries } from '../hooks/useEntries';
import { EntryCard } from '../components/diary/EntryCard';
import { EntryEditor } from '../components/diary/EntryEditor';
import { SearchBar, FilterPopover, EmptyState, ErrorState } from '../components/diary/SearchAndFilter';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';
import { useToast } from '../context';
import { entriesApi } from '../services/api';
import {
  PenLine,
  Sparkles,
  RefreshCw,
  Plus,
  Filter,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  BookMarked,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { classNames } from '../utils/helpers';

export const CategorySection = ({ type: propType }) => {
  const { type: paramType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  // Determine which category configuration to use
  const categoryConfig = useMemo(() => {
    if (propType) return getCategoryBySlugOrType(propType);
    if (paramType) return getCategoryBySlugOrType(paramType);
    // Check route pathname (e.g. /thoughts, /ideas, etc.)
    const cleanPath = location.pathname.replace(/^\//, '');
    return getCategoryBySlugOrType(cleanPath);
  }, [propType, paramType, location.pathname]);

  const CategoryIcon = categoryConfig.icon;

  // Inspiration prompt state
  const [promptIndex, setPromptIndex] = useState(0);
  const currentPrompt = categoryConfig.prompts?.[promptIndex] || categoryConfig.prompts?.[0];

  const handleNextPrompt = () => {
    if (!categoryConfig.prompts?.length) return;
    setPromptIndex(prev => (prev + 1) % categoryConfig.prompts.length);
  };

  // Compose box toggle & initial data
  const [isComposing, setIsComposing] = useState(false);
  const [composeInitial, setComposeInitial] = useState({
    title: '',
    content: '',
    type: categoryConfig.type,
    tags: [categoryConfig.type],
  });
  const [saving, setSaving] = useState(false);

  // Search & filters for this category
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const filterBtnRef = useRef(null);
  const popoverRef = useRef(null);

  // Hook for category entries
  const {
    entries,
    loading,
    error,
    pagination,
    searchEntries,
    refresh,
    deleteEntry,
    updateEntry,
    setPage,
  } = useEntries({
    type: categoryConfig.type,
    sort: sortOrder,
    favorite: favoritesOnly,
    pinned: pinnedOnly,
    limit: 1000,
  });

  // Re-sync compose initial data when category changes
  useEffect(() => {
    setComposeInitial({
      title: '',
      content: '',
      type: categoryConfig.type,
      tags: [categoryConfig.type],
    });
    setPromptIndex(0);
  }, [categoryConfig.type]);

  // Click outside filter popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target)
      ) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilters]);

  // Handle Search
  const handleSearch = (query) => {
    setSearchQuery(query);
    searchEntries(query, {
      type: categoryConfig.type,
      sort: sortOrder,
      favorite: favoritesOnly,
      pinned: pinnedOnly,
    });
  };

  // Use Prompt into Compose Box
  const handleUsePrompt = (promptText) => {
    setComposeInitial({
      title: '',
      content: `${promptText}\n\n`,
      type: categoryConfig.type,
      tags: [categoryConfig.type],
    });
    setIsComposing(true);
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  // Handle Save from Compose Box
  const handleSaveCompose = async (entryData) => {
    setSaving(true);
    try {
      await entriesApi.create({
        ...entryData,
        type: categoryConfig.type,
      });
      showSuccess(`${categoryConfig.label} saved successfully!`);
      setIsComposing(false);
      setComposeInitial({
        title: '',
        content: '',
        type: categoryConfig.type,
        tags: [categoryConfig.type],
      });
      refresh();
    } catch (err) {
      console.error('Failed to save entry:', err);
      showError('Failed to save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Entry Actions
  const handleFavorite = async (entry, isFav) => {
    try {
      await updateEntry(entry._id, { isFavorite: isFav });
    } catch {
      showError('Failed to update favorite');
    }
  };

  const handlePin = async (entry, isPin) => {
    try {
      await updateEntry(entry._id, { isPinned: isPin });
    } catch {
      showError('Failed to update pin');
    }
  };

  const handleVisibility = async (entry, vis) => {
    try {
      await updateEntry(entry._id, { visibility: vis });
    } catch {
      showError('Failed to update visibility');
    }
  };

  const handleDelete = async (entry) => {
    try {
      await deleteEntry(entry._id);
      showSuccess('Entry deleted');
    } catch {
      showError('Failed to delete entry');
    }
  };

  const handleEdit = (entry) => {
    navigate(`/entries/${entry._id}/edit`);
  };

  return (
    <div className="page-container category-section-page" style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
        <Link to="/categories" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--ink-muted)', textDecoration: 'none' }}>
          <Layers size={14} />
          <span>Categories</span>
        </Link>
        <span style={{ opacity: 0.5 }}>/</span>
        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{categoryConfig.label}</span>
      </nav>

      {/* Category Hero Banner */}
      <header
        className="category-hero paper-texture"
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px 24px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: 0, flex: 1 }}>
            <div
              className="category-hero-icon"
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, var(--gold-muted) 0%, var(--gold) 55%, var(--gold-dark) 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--paper)',
                flexShrink: 0,
                boxShadow: '0 6px 18px rgba(122, 92, 52, 0.25)',
              }}
            >
              <CategoryIcon size={26} strokeWidth={2.1} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-family-heading)',
                    fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {categoryConfig.title}
                </h1>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--paper-dark)',
                    border: '1px solid var(--border)',
                    color: 'var(--gold)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {pagination?.total || entries.length} {categoryConfig.pluralLabel}
                </span>
              </div>

              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: '0.92rem',
                  color: 'var(--ink-muted)',
                  lineHeight: 1.5,
                }}
              >
                {categoryConfig.tagline}
              </p>
            </div>
          </div>

          {/* Quick Write Toggle Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              onClick={() => setIsComposing(prev => !prev)}
              leftIcon={isComposing ? <ChevronUp size={16} /> : <PenLine size={16} />}
              className="btn-primary"
            >
              {isComposing ? 'Close Editor' : `Write ${categoryConfig.label}`}
            </Button>
          </div>
        </div>

        {/* Inspirational Prompt Bar */}
        {currentPrompt && (
          <div
            style={{
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <Sparkles size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <p
                style={{
                  margin: 0,
                  fontSize: '0.86rem',
                  color: 'var(--ink)',
                  fontStyle: 'italic',
                  lineHeight: 1.45,
                }}
              >
                &ldquo;{currentPrompt}&rdquo;
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleNextPrompt}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 10px',
                  fontSize: '0.76rem',
                  color: 'var(--ink-muted)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Next prompt"
              >
                <RefreshCw size={12} />
                <span>Next Prompt</span>
              </button>
              <button
                type="button"
                onClick={() => handleUsePrompt(currentPrompt)}
                style={{
                  background: 'var(--paper-dark)',
                  border: '1px solid var(--gold)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px',
                  fontSize: '0.76rem',
                  color: 'var(--gold)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Use this prompt
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Category Composer Card (Collapsible) */}
      {isComposing && (
        <section
          className="paper-texture"
          style={{
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '26px',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.25s ease-out',
          }}
          aria-label={`Write new ${categoryConfig.label}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PenLine size={18} style={{ color: 'var(--gold)' }} />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)' }}>
                Write in {categoryConfig.label}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-muted)',
                cursor: 'pointer',
                fontSize: '0.84rem',
              }}
            >
              Cancel
            </button>
          </div>

          <EntryEditor
            initialData={composeInitial}
            onSave={handleSaveCompose}
            onCancel={() => setIsComposing(false)}
            saving={saving}
            showTitle={true}
            showType={false}
            showTags={true}
            showFavorite={true}
            showPin={true}
            submitLabel={`Save ${categoryConfig.label}`}
            submitIcon={<Plus size={16} />}
          />
        </section>
      )}

      {/* Search, Filter & Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder={`Search through your ${categoryConfig.pluralLabel.toLowerCase()}...`}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            ref={filterBtnRef}
            type="button"
            className={classNames('btn-icon-subtle', (favoritesOnly || pinnedOnly) && 'active')}
            onClick={() => setShowFilters(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: favoritesOnly || pinnedOnly ? 'var(--paper-dark)' : 'var(--paper)',
              color: favoritesOnly || pinnedOnly ? 'var(--gold)' : 'var(--ink)',
              cursor: 'pointer',
              fontSize: '0.86rem',
            }}
          >
            <Filter size={15} />
            <span>Filter</span>
            {(favoritesOnly || pinnedOnly) && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--gold)',
              }} />
            )}
          </button>

          {showFilters && (
            <div
              ref={popoverRef}
              style={{
                position: 'absolute',
                right: '20px',
                marginTop: '190px',
                zIndex: 100,
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                minWidth: '240px',
              }}
            >
              <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 600 }}>
                Filter & Sort {categoryConfig.label}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={favoritesOnly}
                    onChange={(e) => setFavoritesOnly(e.target.checked)}
                  />
                  <span>Favorites only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={pinnedOnly}
                    onChange={(e) => setPinnedOnly(e.target.checked)}
                  />
                  <span>Pinned only</span>
                </label>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                    Sort order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--paper-dark)',
                      color: 'var(--ink)',
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="az">A to Z</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entries Content Area */}
      {loading ? (
        <LoadingState message={`Gathering your ${categoryConfig.pluralLabel.toLowerCase()}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : entries.length === 0 ? (
        <div
          className="paper-texture"
          style={{
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '50px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--paper-dark)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--gold)',
            }}
          >
            <CategoryIcon size={26} />
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1.3rem',
              color: 'var(--ink)',
              margin: '0 0 8px',
            }}
          >
            No {categoryConfig.pluralLabel} Yet
          </h3>
          <p
            style={{
              color: 'var(--ink-muted)',
              fontSize: '0.9rem',
              maxWidth: '440px',
              margin: '0 auto 20px',
              lineHeight: 1.5,
            }}
          >
            {categoryConfig.description}
          </p>
          <Button
            onClick={() => {
              setIsComposing(true);
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            leftIcon={<Plus size={16} />}
            className="btn-primary"
          >
            Write your first {categoryConfig.label}
          </Button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {entries.map((entry, index) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onFavorite={handleFavorite}
                onPin={handlePin}
                onVisibility={handleVisibility}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '36px',
              }}
            >
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                leftIcon={<ChevronLeft size={16} />}
              >
                Previous
              </Button>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                rightIcon={<ChevronRight size={16} />}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategorySection;

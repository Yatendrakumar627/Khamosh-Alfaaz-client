import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { entriesApi } from '../services/api';
import { QUOTES } from '../constants';
import { QuoteCard, DailyQuote } from '../components/diary/QuoteCard';
import { EntryCard } from '../components/diary/EntryCard';
import { EntryEditor } from '../components/diary/EntryEditor';
import { Button } from '../components/ui/Button';
import { useToast } from '../context';
import { useEntries } from '../hooks/useEntries';
import {
  Quote as QuoteIcon,
  Sparkles,
  RefreshCw,
  Plus,
  Layers,
  PenLine,
  BookMarked,
  Heart,
} from 'lucide-react';
import { getLocalDateString } from '../utils/helpers';

export const Quotes = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [quotes] = useState(QUOTES);
  const [dailyQuoteIndex, setDailyQuoteIndex] = useState(Math.floor(Math.random() * QUOTES.length));
  const [savingQuote, setSavingQuote] = useState(null);
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'my-quotes'
  const [isComposing, setIsComposing] = useState(false);
  const [savingEntry, setSavingEntry] = useState(false);

  // User's own quote entries
  const {
    entries: userQuotes,
    loading: loadingUserQuotes,
    refresh: refreshUserQuotes,
    updateEntry,
    deleteEntry,
  } = useEntries({
    type: 'quote',
    limit: 50,
  });

  const dailyQuote = quotes[dailyQuoteIndex];

  const handleSaveAsEntry = async (quote) => {
    setSavingQuote(quote.id);
    try {
      await entriesApi.create({
        title: quote.text.substring(0, 100),
        content: `"${quote.text}" — ${quote.author}`,
        type: 'quote',
        tags: ['quote', 'inspiration'],
        entryDate: getLocalDateString(),
      });
      showSuccess('Quote saved to your diary!');
      refreshUserQuotes();
    } catch (err) {
      console.error('Failed to save quote:', err);
      showError('Failed to save quote. Please try again.');
    } finally {
      setSavingQuote(null);
    }
  };

  const handleNewDailyQuote = () => {
    setDailyQuoteIndex(prev => {
      let next = prev;
      while (next === prev) {
        next = Math.floor(Math.random() * QUOTES.length);
      }
      return next;
    });
  };

  const handleSaveCustomQuote = async (data) => {
    setSavingEntry(true);
    try {
      await entriesApi.create({
        ...data,
        type: 'quote',
      });
      showSuccess('Quote saved successfully!');
      setIsComposing(false);
      setActiveTab('my-quotes');
      refreshUserQuotes();
    } catch (err) {
      console.error('Failed to save quote:', err);
      showError('Failed to save quote');
    } finally {
      setSavingEntry(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', fontSize: '0.84rem', color: 'var(--ink-muted)' }}>
        <Link to="/categories" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--ink-muted)', textDecoration: 'none' }}>
          <Layers size={14} />
          <span>Categories</span>
        </Link>
        <span style={{ opacity: 0.5 }}>/</span>
        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Quotes</span>
      </nav>

      {/* Hero Header */}
      <header
        className="paper-texture"
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--gold-muted) 0%, var(--gold) 55%, var(--gold-dark) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--paper)',
                flexShrink: 0,
                boxShadow: '0 6px 18px rgba(122, 92, 52, 0.25)',
              }}
            >
              <QuoteIcon size={26} strokeWidth={2.1} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-family-heading)',
                    fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    margin: 0,
                  }}
                >
                  Quotes & Verses
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
                  }}
                >
                  {userQuotes.length} Saved in Diary
                </span>
              </div>
              <p style={{ margin: '6px 0 0', color: 'var(--ink-muted)', fontSize: '0.92rem' }}>
                Words that resonate, inspire, and stay with you. Collect them or pen your own.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsComposing(prev => !prev)}
            leftIcon={isComposing ? null : <PenLine size={16} />}
            className="btn-primary"
          >
            {isComposing ? 'Close Editor' : 'Write a Quote'}
          </Button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'library' ? '1px solid var(--gold)' : '1px solid var(--border)',
              backgroundColor: activeTab === 'library' ? 'var(--paper-dark)' : 'transparent',
              color: activeTab === 'library' ? 'var(--gold)' : 'var(--ink)',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} />
            <span>Inspiration Vault ({quotes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-quotes')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'my-quotes' ? '1px solid var(--gold)' : '1px solid var(--border)',
              backgroundColor: activeTab === 'my-quotes' ? 'var(--paper-dark)' : 'transparent',
              color: activeTab === 'my-quotes' ? 'var(--gold)' : 'var(--ink)',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookMarked size={14} />
            <span>My Saved Quotes ({userQuotes.length})</span>
          </button>
        </div>
      </header>

      {/* Compose Form */}
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)' }}>
              Write / Save a Quote
            </h2>
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          <EntryEditor
            initialData={{
              title: '',
              content: '',
              type: 'quote',
              tags: ['quote'],
            }}
            onSave={handleSaveCustomQuote}
            onCancel={() => setIsComposing(false)}
            saving={savingEntry}
            showTitle={true}
            showType={false}
            showTags={true}
            showFavorite={true}
            showPin={true}
            submitLabel="Save Quote"
            submitIcon={<Plus size={16} />}
          />
        </section>
      )}

      {/* Tab 1: Inspiration Vault */}
      {activeTab === 'library' && (
        <div>
          {/* Daily Quote Highlight */}
          <section style={{ marginBottom: 'var(--spacing-xl)' }}>
            <DailyQuote quote={dailyQuote} onSaveAsEntry={handleSaveAsEntry} />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-md)' }}>
              <Button variant="subtle" size="sm" onClick={handleNewDailyQuote} leftIcon={<RefreshCw size={16} />}>
                Another quote
              </Button>
            </div>
          </section>

          {/* Collection Grid */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-lg)' }}>
              Curated Quotes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-lg)' }}>
              {quotes.map((quote, index) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onSaveAsEntry={handleSaveAsEntry}
                  index={index}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: My Saved Quotes */}
      {activeTab === 'my-quotes' && (
        <section>
          {loadingUserQuotes ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)' }}>
              Loading your saved quotes...
            </div>
          ) : userQuotes.length === 0 ? (
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
              <QuoteIcon size={32} style={{ color: 'var(--gold)', margin: '0 auto 14px' }} />
              <h3 style={{ margin: '0 0 8px', color: 'var(--ink)' }}>No Quotes Saved In Diary Yet</h3>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 20px' }}>
                Save quotes from the Inspiration Vault or pen your own meaningful verses.
              </p>
              <Button onClick={() => setIsComposing(true)} leftIcon={<Plus size={16} />} className="btn-primary">
                Write a Quote
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {userQuotes.map((entry, index) => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  index={index}
                  onEdit={(e) => navigate(`/entries/${e._id}/edit`)}
                  onDelete={async (e) => {
                    await deleteEntry(e._id);
                    refreshUserQuotes();
                  }}
                  onFavorite={async (e, isFav) => {
                    await updateEntry(e._id, { isFavorite: isFav });
                    refreshUserQuotes();
                  }}
                  onPin={async (e, isPin) => {
                    await updateEntry(e._id, { isPinned: isPin });
                    refreshUserQuotes();
                  }}
                  onVisibility={async (e, vis) => {
                    await updateEntry(e._id, { visibility: vis });
                    refreshUserQuotes();
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Quotes;
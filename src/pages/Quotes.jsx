import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { entriesApi } from '../services/api';
import { QUOTES } from '../constants';
import { QuoteCard, DailyQuote } from '../components/diary/QuoteCard';
import { Button } from '../components/ui/Button';
import { Sparkles, BookOpen, Heart, Copy, RefreshCw } from 'lucide-react';
import { classNames, getLocalDateString } from '../utils/helpers';

export const Quotes = () => {
  const navigate = useNavigate();
  const [quotes] = useState(QUOTES);
  const [dailyQuoteIndex, setDailyQuoteIndex] = useState(Math.floor(Math.random() * QUOTES.length));
  const [savingQuote, setSavingQuote] = useState(null);

  const dailyQuote = quotes[dailyQuoteIndex];

  const handleSaveAsEntry = async (quote) => {
    setSavingQuote(quote.id);
    try {
      await entriesApi.create({
        title: quote.text.substring(0, 100),
        content: `"${quote.text}" — ${quote.author}`,
        type: 'quote',
        tags: ['quote', 'saved', 'inspiration'],
        entryDate: getLocalDateString(),
      });
      alert('Quote saved as entry!');
      navigate('/entries');
    } catch (err) {
      console.error('Failed to save quote:', err);
      alert('Failed to save quote. Please try again.');
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

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
          Quotes
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
          Words that resonate. Save them to your diary.
        </p>
      </header>

      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <DailyQuote quote={dailyQuote} onSaveAsEntry={handleSaveAsEntry} />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-md)' }}>
          <Button variant="subtle" size="sm" onClick={handleNewDailyQuote} leftIcon={<RefreshCw size={16} />}>
            Another quote
          </Button>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-lg)' }}>
          Collection
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
  );
};
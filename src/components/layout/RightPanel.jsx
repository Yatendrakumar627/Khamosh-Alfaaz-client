import { Zap, BookOpen, Download, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OnThisDay } from '../diary/OnThisDay';
import { RecentMemories } from '../diary/RecentMemories';
import { DailyQuote } from '../diary/QuoteCard';
import { useEntries } from '../../hooks/useEntries';
import { useState } from 'react';
import { getLocalDateString } from '../../utils/helpers';
import { QUOTES } from '../../constants';
import { entriesApi } from '../../services/api';

export const RightPanel = () => {
  const { entries, loading } = useEntries({ limit: 100, sort: 'newest' });
  const [dailyQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const handleSaveQuote = async (quote) => {
    await entriesApi.create({
      title: quote.text.substring(0, 100),
      content: `"${quote.text}" — ${quote.author}`,
      type: 'quote',
      tags: ['quote', 'daily'],
      entryDate: getLocalDateString(),
    });
  };

  return (
    <aside className="dashboard-rail">
      <RecentMemories entries={entries} loading={loading} />

      <OnThisDay entries={entries} loading={loading} />

      <DailyQuote quote={dailyQuote} onSaveAsEntry={handleSaveQuote} />

      <QuickActions />
    </aside>
  );
};

const QuickActions = () => {
  const actions = [
    { icon: BookOpen, label: 'View All', to: '/entries' },
    { icon: Star, label: 'Favorites', to: '/favorites' },
    { icon: Download, label: 'Export', to: '/export' },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
      className="paper-texture"
    >
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '11px 14px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          backgroundColor: 'var(--active-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={15} style={{ color: 'var(--gold)' }} />
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-family-heading)',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Quick Actions
        </h3>
      </header>
      <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '12px' }}>
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="quick-action-link"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: '64px',
                backgroundColor: 'var(--paper-dark)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--ink-muted)',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--active-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={15} style={{ color: 'var(--gold)' }} />
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
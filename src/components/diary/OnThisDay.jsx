import { Clock } from 'lucide-react';
import { formatDate, getLocalDateString } from '../../utils/helpers';

export const OnThisDay = ({ entries = [], loading = false }) => {
  const today = new Date();
  const todayString = getLocalDateString();
  const monthDay = todayString.slice(5);
  const refDateDisplay = formatDate(`${todayString}T00:00:00`, 'SHORT');

  const pastEntries = entries.filter(entry => {
    const entryDate = new Date(entry.entryDate || entry.createdAt);
    return `${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}` === monthDay &&
      entryDate.getFullYear() < today.getFullYear();
  }).sort((a, b) => new Date(b.entryDate || b.createdAt) - new Date(a.entryDate || a.createdAt));

  const renderHeader = (subtitle) => (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 14px',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '9px',
        backgroundColor: 'rgba(223, 178, 100, 0.12)',
        border: '1px solid rgba(223, 178, 100, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Clock size={16} style={{ color: 'var(--gold)' }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-family-heading)',
          fontSize: '0.94rem',
          fontWeight: 600,
          margin: 0,
          color: 'var(--ink)',
          lineHeight: 1.2,
        }}>
          On This Day
        </h3>
        <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
          {subtitle}
        </p>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 6px 20px -4px rgba(0, 0, 0, 0.3)',
      }} className="paper-texture">
        {renderHeader(refDateDisplay)}
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '20px', height: '20px', margin: '0 auto', border: '2px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ margin: '10px 0 0', fontSize: '0.80rem', color: 'var(--ink-muted)' }}>Finding memories...</p>
        </div>
      </div>
    );
  }

  if (pastEntries.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 6px 20px -4px rgba(0, 0, 0, 0.3)',
      }} className="paper-texture">
        {renderHeader(refDateDisplay)}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '28px 18px',
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(223, 178, 100, 0.08)',
            border: '1px solid rgba(223, 178, 100, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <Clock size={19} style={{ color: 'var(--gold)', opacity: 0.9 }} />
          </div>
          <p style={{
            margin: '0 0 4px',
            fontFamily: 'var(--font-family-heading)',
            fontStyle: 'italic',
            fontSize: '1.02rem',
            lineHeight: 1.4,
            color: 'var(--ink)',
            maxWidth: '220px',
          }}>
            Nothing from this day yet.
          </p>
          <p style={{
            margin: 0,
            fontSize: '0.78rem',
            color: 'var(--ink-muted)',
            lineHeight: 1.45,
          }}>
            Maybe today is where your story begins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 6px 20px -4px rgba(0, 0, 0, 0.3)',
    }} className="paper-texture">
      {renderHeader(`${refDateDisplay} • ${pastEntries.length} memor${pastEntries.length === 1 ? 'y' : 'ies'}`)}

      <div style={{ padding: '10px' }}>
        {pastEntries.map((entry, index) => (
          <div key={entry._id} style={{
            padding: '10px',
            backgroundColor: index === 0 ? 'color-mix(in srgb, var(--gold) 10%, transparent)' : 'var(--paper-dark)',
            border: index === 0 ? '1px solid var(--gold)' : '1px solid var(--border)',
            borderRadius: '8px',
            marginBottom: index < pastEntries.length - 1 ? '6px' : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.66rem', fontWeight: 600, textTransform: 'uppercase',
                color: 'var(--gold)', backgroundColor: 'var(--active-bg)',
                padding: '2px 8px', borderRadius: '9999px',
              }}>
                {entry.type}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', fontWeight: 500 }}>
                {formatDate(entry.entryDate || entry.createdAt, 'SHORT')}
              </span>
            </div>
            {entry.title && (
              <h4 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 3px', color: 'var(--ink)' }}>
                {entry.title}
              </h4>
            )}
            <p style={{
              margin: 0, color: 'var(--ink-muted)', lineHeight: 1.45, fontSize: '0.88rem',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {entry.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
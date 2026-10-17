import { useState } from 'react';
import { Clock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

// ─── local date helpers ───────────────────────────────────────────────────────

/** Returns a local-midnight Date for today */
const getLocalToday = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};

/** "YYYY-MM-DD" from a local Date */
const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Entry's local midnight Date */
const entryDay = (entry) => {
  const d = new Date(entry.entryDate || entry.createdAt);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// ─── component ────────────────────────────────────────────────────────────────

export const OnThisDay = ({ entries = [], loading = false }) => {
  const [activeTab, setActiveTab] = useState('lastMonth');

  const today       = getLocalToday();
  const dd          = today.getDate();

  // Last month — same day number (handles short months via Date auto-correction)
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, dd);
  const lastMonthKey  = toDateKey(lastMonthDate);

  // Last year — same month + day
  const lastYearDate = new Date(today.getFullYear() - 1, today.getMonth(), dd);
  const lastYearKey  = toDateKey(lastYearDate);

  const byDate = (key) =>
    [...entries]
      .filter((e) => toDateKey(entryDay(e)) === key)
      .sort((a, b) => new Date(b.entryDate || b.createdAt) - new Date(a.entryDate || a.createdAt));

  const tabs = [
    {
      id: 'lastMonth',
      label: 'Last Month',
      subtitle: formatDate(`${lastMonthKey}T00:00:00`, 'SHORT'),
      data: byDate(lastMonthKey),
      emptyMsg: 'Nothing written a month ago today.',
      emptyHint: 'Keep writing — future you will thank you.',
    },
    {
      id: 'lastYear',
      label: 'Last Year',
      subtitle: formatDate(`${lastYearKey}T00:00:00`, 'SHORT'),
      data: byDate(lastYearKey),
      emptyMsg: 'Nothing written a year ago today.',
      emptyHint: 'This time last year was still waiting for your words.',
    },
  ];

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  // ── renders ───────────────────────────────────────────────────────────────

  const Header = () => (
    <header style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '9px',
        backgroundColor: 'rgba(223, 178, 100, 0.12)', border: '1px solid rgba(223, 178, 100, 0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Clock size={16} style={{ color: 'var(--gold)' }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '0.94rem', fontWeight: 600, margin: 0, color: 'var(--ink)', lineHeight: 1.2 }}>
          On This Day
        </h3>
        <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
          {active.subtitle}
          {active.data.length > 0 && (
            <span style={{ marginLeft: '4px' }}>
              • {active.data.length} {active.data.length === 1 ? 'memory' : 'memories'}
            </span>
          )}
        </p>
      </div>
    </header>
  );

  const Tabs = () => (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 10px', gap: '2px' }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 10px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--gold)' : 'var(--ink-muted)',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s ease',
              flexShrink: 0,
            }}
          >
            {tab.label}
            {tab.data.length > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '9999px',
                backgroundColor: isActive ? 'rgba(223, 178, 100, 0.18)' : 'var(--active-bg)',
                color: isActive ? 'var(--gold)' : 'var(--ink-muted)',
                fontSize: '0.62rem', fontWeight: 700,
              }}>
                {tab.data.length}
              </span>
            )}
            {isActive && (
              <span style={{
                position: 'absolute', bottom: '-1px', left: '10px', right: '10px',
                height: '2px', borderRadius: '2px 2px 0 0', backgroundColor: 'var(--gold)',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );

  const Empty = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px 18px' }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '50%',
        backgroundColor: 'rgba(223, 178, 100, 0.08)', border: '1px solid rgba(223, 178, 100, 0.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px',
      }}>
        <Clock size={17} style={{ color: 'var(--gold)', opacity: 0.9 }} />
      </div>
      <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-family-heading)', fontStyle: 'italic', fontSize: '0.97rem', lineHeight: 1.4, color: 'var(--ink)', maxWidth: '220px' }}>
        {active.emptyMsg}
      </p>
      <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--ink-muted)', lineHeight: 1.45, maxWidth: '210px' }}>
        {active.emptyHint}
      </p>
    </div>
  );

  const EntryList = () => (
    <div style={{ padding: '10px' }}>
      {active.data.map((entry, index) => (
        <div key={entry._id} style={{
          padding: '10px',
          backgroundColor: index === 0 ? 'color-mix(in srgb, var(--gold) 10%, transparent)' : 'var(--paper-dark)',
          border: index === 0 ? '1px solid var(--gold)' : '1px solid var(--border)',
          borderRadius: '8px',
          marginBottom: index < active.data.length - 1 ? '6px' : 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--gold)', backgroundColor: 'var(--active-bg)', padding: '2px 8px', borderRadius: '9999px' }}>
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
          <p style={{ margin: 0, color: 'var(--ink-muted)', lineHeight: 1.45, fontSize: '0.88rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {entry.content}
          </p>
        </div>
      ))}
    </div>
  );

  // ── shell ─────────────────────────────────────────────────────────────────
  const shell = (children) => (
    <div style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 6px 20px -4px rgba(0, 0, 0, 0.3)' }} className="paper-texture">
      {children}
    </div>
  );

  if (loading) {
    return shell(
      <>
        <Header />
        <Tabs />
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '20px', height: '20px', margin: '0 auto', border: '2px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ margin: '10px 0 0', fontSize: '0.80rem', color: 'var(--ink-muted)' }}>Finding memories...</p>
        </div>
      </>
    );
  }

  return shell(
    <>
      <Header />
      <Tabs />
      {active.data.length === 0 ? <Empty /> : <EntryList />}
    </>
  );
};
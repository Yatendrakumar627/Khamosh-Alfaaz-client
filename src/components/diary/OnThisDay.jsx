import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import {
  Clock,
  ChevronRight,
  Search,
  SearchX,
  X,
  Star,
  BookOpen,
  Lightbulb,
  Quote,
  Sparkles,
  FileText,
  Heart,
  Circle,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { Modal } from '../ui/Modal';
import { ENTRY_TYPES } from '../../constants';

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
  const d = new Date(entry.entryDate || entry.createdAt || entry.updatedAt || Date.now());
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/** Robust exact same day last month (capped to max days in previous month) */
const getLastMonthSameDay = (today) => {
  const targetYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const targetMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
  const daysInPrevMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(today.getDate(), daysInPrevMonth);
  return new Date(targetYear, targetMonth, targetDay);
};

/** Robust exact same day last year (handles Feb 29 leap-years) */
const getLastYearSameDay = (today) => {
  const targetYear = today.getFullYear() - 1;
  const targetMonth = today.getMonth();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(today.getDate(), daysInMonth);
  return new Date(targetYear, targetMonth, targetDay);
};

const matchesSearch = (entry, query) => {
  const haystack = [entry.title, entry.content, ...(entry.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
};

const TYPE_ICONS = {
  diary: BookOpen,
  thought: Lightbulb,
  quote: Quote,
  idea: Sparkles,
  note: FileText,
  personal: Heart,
  gratitude: Star,
  other: Circle,
};

const getTypeIcon = (type) => TYPE_ICONS[type] || FileText;

const getTypeLabel = (type) => {
  const found = ENTRY_TYPES.find(t => t.value === type);
  return found ? found.label : (type || 'Diary');
};

const ALL_KEY = 'all';

// ─── Component ────────────────────────────────────────────────────────────────

export const OnThisDay = ({ entries = [], loading = false }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState('lastMonth');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState(ALL_KEY);
  const [searchQuery, setSearchQuery] = useState('');

  const today = getLocalToday();

  // Last month — exact date 1 month ago
  const lastMonthDate = getLastMonthSameDay(today);
  const lastMonthKey  = toDateKey(lastMonthDate);

  // Last year — exact date 1 year ago
  const lastYearDate = getLastYearSameDay(today);
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

  const totalCount = tabs.reduce((acc, tab) => acc + tab.data.length, 0);
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  const openEntry = (entry) => {
    navigate(`/entries/${entry._id}`);
    setModalOpen(false);
  };

  const handleOpenModal = (tabId = ALL_KEY) => {
    setModalTab(tabId);
    setSearchQuery('');
    setModalOpen(true);
  };

  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow:
            '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 6px 20px -4px rgba(0, 0, 0, 0.3)',
        }}
        className="paper-texture"
      >
        {/* ── Header (Interactive Word Click, No Arrow) ── */}
        <header
          onClick={() => handleOpenModal(ALL_KEY)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenModal(ALL_KEY);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="View on this day memories"
          className="recent-mem-header"
        >
          <div className="recent-mem-header-iconbox">
            <Clock size={16} style={{ color: 'var(--gold)' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 className="recent-mem-title">
              On This Day
            </h3>
            <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
              {active.subtitle}
              {totalCount > 0 && (
                <span style={{ marginLeft: '4px' }}>
                  • {totalCount} {totalCount === 1 ? 'memory' : 'memories'}
                </span>
              )}
            </p>
          </div>
        </header>

        {/* ── Filter Buttons (Justified 2-Column Grid) ── */}
        <div style={{ padding: '12px 12px 8px' }}>
          <div className="recent-mem-grid">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`recent-mem-btn ${isActive ? 'recent-mem-btn-active' : ''}`}
                  aria-pressed={isActive}
                  aria-label={`View ${tab.label} memories (${tab.data.length})`}
                >
                  <span className="recent-mem-btn-label">{tab.label}</span>
                  <span className="recent-mem-btn-count">{tab.data.length}</span>
                </button>
              );
            })}
          </div>

          {/* ── Body ── */}
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  margin: '0 auto',
                  border: '2px solid var(--border)',
                  borderTopColor: 'var(--gold)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ margin: '10px 0 0', fontSize: '0.80rem', color: 'var(--ink-muted)' }}>
                Finding memories...
              </p>
            </div>
          ) : active.data.length === 0 ? (
            <div
              style={{
                padding: '16px 12px',
                textAlign: 'center',
                backgroundColor: 'var(--paper-dark)',
                border: '1px dashed var(--border)',
                borderRadius: '10px',
                margin: '2px 0 4px',
              }}
            >
              <p style={{ margin: '0 0 3px', fontSize: '0.82rem', fontWeight: 500, color: 'var(--ink)' }}>
                {active.emptyMsg}
              </p>
              <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
                {active.emptyHint}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {active.data.slice(0, 3).map((entry) => (
                <article
                  key={entry._id}
                  onClick={() => openEntry(entry)}
                  className="recent-mem-card"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openEntry(entry);
                    }
                  }}
                >
                  <div className="recent-mem-card-header">
                    <span className="recent-mem-card-tag">
                      {entry.type || 'DIARY'}
                    </span>
                    <span className="recent-mem-card-date">
                      {formatDate(entry.entryDate || entry.createdAt, 'SHORT')}
                    </span>
                  </div>

                  {entry.title && (
                    <h4 className="recent-mem-card-title">
                      {entry.title}
                    </h4>
                  )}

                  {entry.content && (
                    <p className="recent-mem-card-snippet">
                      {entry.content}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ── View All Bottom Action ── */}
        {totalCount > 0 && (
          <button
            type="button"
            onClick={() => handleOpenModal(activeTab)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              padding: '10px 14px',
              border: 'none',
              borderTop: '1px solid var(--border)',
              background: 'var(--paper-darker)',
              color: 'var(--gold)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--paper-darker)'; }}
          >
            <span>View on this day</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── Modal (Consistent with Recent Memories Modal) ── */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="On This Day"
        size={isMobile ? '100%' : 'xl'}
        centered={!isMobile}
        fullScreen={isMobile}
      >
        <OnThisDayContent
          activeTab={modalTab}
          onTabChange={setModalTab}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          tabs={tabs}
          totalCount={totalCount}
          onEntryClick={openEntry}
          isMobile={isMobile}
        />
      </Modal>
    </>
  );
};

const OnThisDayContent = ({
  activeTab,
  onTabChange,
  query,
  onQueryChange,
  tabs,
  totalCount,
  onEntryClick,
  isMobile = false,
}) => {
  const availableTabs = tabs.filter((t) => (t.data?.length || 0) > 0 || t.id === activeTab);
  const pills = [
    { id: ALL_KEY, label: 'All', count: totalCount },
    ...availableTabs.map((t) => ({ id: t.id, label: t.label, count: t.data.length })),
  ];

  const allEntries = tabs.flatMap((t) => t.data);
  const baseList = activeTab === ALL_KEY ? allEntries : (tabs.find((t) => t.id === activeTab)?.data || []);

  const trimmedQuery = query.trim();
  const visible = trimmedQuery
    ? baseList.filter((entry) => matchesSearch(entry, trimmedQuery))
    : baseList;

  const activeLabel = activeTab === ALL_KEY
    ? 'All periods'
    : (tabs.find((t) => t.id === activeTab)?.label || 'On This Day');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '100%',
        maxHeight: isMobile ? 'calc(100dvh - 130px)' : 'calc(100dvh - 190px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
        <div className="rm-pills-container">
          {pills.map((pill) => {
            const active = activeTab === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onTabChange(pill.id)}
                className={active ? 'rm-pill rm-pill-active' : 'rm-pill'}
                aria-pressed={active}
              >
                <span>{pill.label}</span>
                {pill.count > 0 && <span className="rm-pill-badge">{pill.count}</span>}
              </button>
            );
          })}
        </div>

        <span className="rm-count-label">
          {visible.length} {visible.length === 1 ? 'memory' : 'memories'}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '11px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--ink-muted)',
          }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Search ${activeLabel.toLowerCase()}...`}
          style={{
            width: '100%',
            padding: '10px 34px 10px 34px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--paper-dark)',
            color: 'var(--ink)',
            fontSize: '0.86rem',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="rm-list-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '2px' }}>
        {visible.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 20px',
              gap: '6px',
            }}
          >
            <div className="rm-iconbox" style={{ width: '44px', height: '44px', marginBottom: '4px' }}>
              {trimmedQuery ? <SearchX size={22} style={{ color: 'var(--gold)' }} /> : <Clock size={22} style={{ color: 'var(--gold)' }} />}
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-family-heading)',
                fontStyle: 'italic',
                fontSize: '1rem',
                color: 'var(--ink)',
              }}
            >
              {trimmedQuery ? `No memories match '${trimmedQuery}'.` : 'No memories on this day yet.'}
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ink-muted)', maxWidth: '280px', lineHeight: 1.5 }}>
              {trimmedQuery ? 'Try a different search term or tab.' : 'Entries written on this day in past months and years appear here.'}
            </p>
          </div>
        ) : (
          visible.map((entry) => {
            const TypeIcon = getTypeIcon(entry.type);
            const tags = Array.isArray(entry.tags) ? entry.tags.slice(0, 2) : [];
            return (
              <button
                key={entry._id}
                type="button"
                onClick={() => onEntryClick(entry)}
                className="rm-row"
                style={{ padding: isMobile ? '13px 14px' : '12px 14px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span className="rm-iconbox">
                    <TypeIcon size={15} style={{ color: 'var(--gold)' }} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--gold)',
                        letterSpacing: '0.04em',
                      }}>
                        {getTypeLabel(entry.type)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>•</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                        {formatDate(entry.entryDate || entry.createdAt, 'MEDIUM')}
                      </span>
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '0.66rem',
                            color: 'var(--ink-muted)',
                            background: 'var(--active-bg)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {entry.title && (
                      <h4
                        style={{
                          margin: '0 0 4px',
                          fontFamily: 'var(--font-family-heading)',
                          fontSize: '0.94rem',
                          fontWeight: 600,
                          color: 'var(--ink)',
                          lineHeight: 1.3,
                        }}
                      >
                        {entry.title}
                      </h4>
                    )}
                    {entry.content && (
                      <p
                        style={{
                          margin: 0,
                          color: 'var(--ink-muted)',
                          lineHeight: 1.45,
                          fontSize: '0.80rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {entry.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
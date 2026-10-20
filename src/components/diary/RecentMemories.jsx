import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import {
  CalendarClock,
  Search,
  SearchX,
  X,
  Star,
  Pin,
  BookOpen,
  Lightbulb,
  Quote,
  Sparkles,
  FileText,
  Heart,
  Circle,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { Modal } from '../ui/Modal';
import { ENTRY_TYPES } from '../../constants';

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const getMonday = (date) => {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
};

const BUCKETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'lastWeek', label: 'Last Week' },
  { key: 'last15Days', label: 'Last 15 Days' },
  { key: 'thisMonth', label: 'This Month' },
];

const ALL_KEY = 'all';

const entryDate = (entry) => new Date(entry.entryDate || entry.createdAt || entry.updatedAt || entry._id || Date.now());

const getBucketMap = (today) => {
  const todayStart = startOfDay(today);
  const tomorrowStart = addDays(todayStart, 1);
  const yesterdayStart = addDays(todayStart, -1);
  const thisWeekStart = getMonday(todayStart);
  const lastWeekStart = addDays(thisWeekStart, -7);
  const fifteenDaysStart = addDays(todayStart, -15);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    today: { start: todayStart, end: tomorrowStart },
    yesterday: { start: yesterdayStart, end: todayStart },
    thisWeek: { start: thisWeekStart, end: tomorrowStart },
    lastWeek: { start: lastWeekStart, end: thisWeekStart },
    last15Days: { start: fifteenDaysStart, end: tomorrowStart },
    thisMonth: { start: monthStart, end: tomorrowStart },
  };
};

const inRange = (date, { start, end }) => {
  const t = date.getTime();
  return t >= start.getTime() && t < end.getTime();
};

const getBucketEntries = (entry, map) => {
  const date = entryDate(entry);
  return BUCKETS.filter(bucket => inRange(date, map[bucket.key])).map(bucket => bucket.key);
};

const uniqueEntries = (items) => Array.from(new Map(items.map(entry => [entry._id, entry])).values());

const allEntries = (grouped) => uniqueEntries(
  BUCKETS.reduce((acc, bucket) => acc.concat(grouped[bucket.key]), []),
);

const matchesSearch = (entry, query) => {
  const haystack = [entry.title, entry.content, ...(entry.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
};

const sortNewest = (items) => [...items].sort((a, b) => entryDate(b) - entryDate(a));

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
  return found ? found.label : type || 'Note';
};

export const RecentMemories = ({ entries = [], loading = false }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767.98px)');
  const [open, setOpen] = useState(false);
  const [activeBucket, setActiveBucket] = useState(ALL_KEY);
  const [query, setQuery] = useState('');

  const openModal = (bucketKey = ALL_KEY) => {
    setActiveBucket(bucketKey);
    setQuery('');
    setOpen(true);
  };

  if (loading) {
    return null;
  }

  const today = new Date();
  const map = getBucketMap(today);

  const grouped = {};
  for (const bucket of BUCKETS) {
    grouped[bucket.key] = [];
  }

  for (const entry of entries) {
    const keys = getBucketEntries(entry, map);
    for (const key of keys) {
      grouped[key].push(entry);
    }
  }

  const totalCount = allEntries(grouped).length;
  const activeBuckets = BUCKETS.filter(bucket => grouped[bucket.key].length > 0);

  if (totalCount === 0) {
    return null;
  }

  const topEntries = sortNewest(allEntries(grouped)).slice(0, 3);

  const openEntry = (entry) => {
    navigate(`/entries/${entry._id}`);
    setOpen(false);
  };

  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 6px 20px -4px rgba(0, 0, 0, 0.3)',
        }}
        className="paper-texture"
      >
        <header
          onClick={() => openModal(ALL_KEY)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openModal(ALL_KEY);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="View all recent memories"
          className="recent-mem-header"
        >
          <div className="recent-mem-header-iconbox">
            <CalendarClock size={16} style={{ color: 'var(--gold)' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 className="recent-mem-title">
              Recent Memories
            </h3>
            <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
              {totalCount} {totalCount === 1 ? 'memory' : 'memories'} across time
            </p>
          </div>
        </header>

        <div style={{ padding: '12px 12px 8px' }}>
          {activeBuckets.length > 0 && (
            <div className="recent-mem-grid">
              {activeBuckets.map((bucket, index) => {
                const count = grouped[bucket.key].length;
                const isOddLast = activeBuckets.length % 2 === 1 && index === activeBuckets.length - 1;
                return (
                  <button
                    key={bucket.key}
                    type="button"
                    onClick={() => openModal(bucket.key)}
                    className={`recent-mem-btn ${isOddLast ? 'recent-mem-btn-span-full' : ''}`}
                    aria-label={`View ${bucket.label} memories (${count})`}
                  >
                    <span className="recent-mem-btn-label">{bucket.label}</span>
                    <span className="recent-mem-btn-count">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {topEntries.map(entry => (
              <div
                key={entry._id}
                onClick={() => navigate(`/entries/${entry._id}`)}
                style={{
                  padding: '9px 11px',
                  backgroundColor: 'var(--paper-dark)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(223, 178, 100, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase',
                    color: 'var(--gold)', backgroundColor: 'rgba(223, 178, 100, 0.14)',
                    padding: '1px 7px', borderRadius: '9999px',
                  }}>
                    {entry.type}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontWeight: 500, marginLeft: 'auto' }}>
                    {formatDate(entry.entryDate || entry.createdAt, 'SHORT')}
                  </span>
                </div>
                {entry.title && (
                  <h4 style={{
                    fontFamily: 'var(--font-family-heading)',
                    fontSize: '0.88rem', fontWeight: 600,
                    margin: '0 0 2px', color: 'var(--ink)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {entry.title}
                  </h4>
                )}
                {entry.content && (
                  <p style={{
                    margin: 0, color: 'var(--ink-muted)', lineHeight: 1.5, fontSize: '0.78rem',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {entry.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => openModal(ALL_KEY)}
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
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--paper-darker)'; }}
        >
          <span>View all memories</span>
          <ChevronRight size={14} />
        </button>
      </div>

<Modal
          opened={open}
          onClose={() => setOpen(false)}
          title="Recent Memories"
          size={isMobile ? '100%' : 'xl'}
        centered={!isMobile}
        fullScreen={isMobile}
      >
        <RecentMemoriesContent
          activeBucket={activeBucket}
          onBucketChange={setActiveBucket}
          query={query}
          onQueryChange={setQuery}
          grouped={grouped}
          totalCount={totalCount}
          onEntryClick={openEntry}
          isMobile={isMobile}
        />
      </Modal>
    </>
  );
};

const RecentMemoriesContent = ({
  activeBucket,
  onBucketChange,
  query,
  onQueryChange,
  grouped,
  totalCount,
  onEntryClick,
  isMobile = false,
}) => {
  const list = activeBucket === ALL_KEY
    ? allEntries(grouped)
    : (grouped[activeBucket] || []);

  const trimmedQuery = query.trim();
  const visible = sortNewest(
    trimmedQuery ? list.filter(entry => matchesSearch(entry, trimmedQuery)) : list,
  );

  const availableBuckets = BUCKETS.filter(b => (grouped[b.key]?.length || 0) > 0 || b.key === activeBucket);
  const pills = [{ key: ALL_KEY, label: 'All' }, ...availableBuckets];
  const activeLabel = activeBucket === ALL_KEY ? 'All periods' : (BUCKETS.find(b => b.key === activeBucket) || {}).label;

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
          {pills.map(pill => {
            const count = pill.key === ALL_KEY ? totalCount : (grouped[pill.key]?.length || 0);
            const active = activeBucket === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => onBucketChange(pill.key)}
                className={active ? 'rm-pill rm-pill-active' : 'rm-pill'}
                aria-pressed={active}
              >
                <span>{pill.label}</span>
                {count > 0 && <span className="rm-pill-badge">{count}</span>}
              </button>
            );
          })}
        </div>

        <span className="rm-count-label">
          {visible.length} {visible.length === 1 ? 'memory' : 'memories'}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
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
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 20px',
            gap: '6px',
          }}>
            <div className="rm-iconbox" style={{ width: '44px', height: '44px', marginBottom: '4px' }}>
              {trimmedQuery ? <SearchX size={22} style={{ color: 'var(--gold)' }} /> : <CalendarClock size={22} style={{ color: 'var(--gold)' }} />}
            </div>
            <p style={{
              margin: 0,
              fontFamily: 'var(--font-family-heading)',
              fontStyle: 'italic',
              fontSize: '1rem',
              color: 'var(--ink)',
            }}>
              {trimmedQuery ? `No memories match '${trimmedQuery}'.` : 'Nothing here yet.'}
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ink-muted)', maxWidth: '280px', lineHeight: 1.5 }}>
              {trimmedQuery ? 'Try a different search term or another period.' : 'Write an entry to see it appear here.'}
            </p>
          </div>
        ) : (
          visible.map(entry => {
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
                        fontSize: '0.66rem', fontWeight: 600, textTransform: 'uppercase',
                        color: 'var(--gold)', backgroundColor: 'var(--active-bg)',
                        padding: '2px 8px', borderRadius: '9999px',
                      }}>
                        {getTypeLabel(entry.type)}
                      </span>
                      {tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: '0.64rem', fontWeight: 500, color: 'var(--ink-muted)',
                          border: '1px solid var(--border)', padding: '1px 7px', borderRadius: '9999px',
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {entry.title && (
                      <h4 style={{
                        fontFamily: 'var(--font-family-heading)',
                        fontSize: '0.98rem',
                        fontWeight: 600,
                        margin: '0 0 3px',
                        color: 'var(--ink)',
                      }}>
                        {entry.title}
                      </h4>
                    )}
                    {entry.content && (
                      <p style={{
                        margin: 0,
                        color: 'var(--ink-muted)',
                        lineHeight: 1.45,
                        fontSize: '0.86rem',
                        display: '-webkit-box',
                        WebkitLineClamp: isMobile ? 2 : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {entry.content}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '7px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 500 }}>
                        {formatDate(entry.entryDate || entry.createdAt, 'SHORT')}
                      </span>
                      {entry.isFavorite && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--gold)' }} title="Favorite">
                          <Star size={13} fill="currentColor" />
                        </span>
                      )}
                      {entry.isPinned && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--ink-muted)' }} title="Pinned">
                          <Pin size={13} />
                        </span>
                      )}
                      <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--gold)', opacity: 0.7 }} />
                    </div>
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
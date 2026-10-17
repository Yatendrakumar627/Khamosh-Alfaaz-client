import { useState, useEffect, useMemo } from 'react';
import { useEntries, useCategories } from '../hooks/useEntries';
import {
  StatisticsCard,
  StatisticsGrid,
  StreakDisplay,
  ActivityHeatmap,
  WritingRhythm,
  CategoryBreakdown,
  MilestoneTracker,
} from '../components/diary';
import { LoadingState } from '../components/ui/LoadingState';
import {
  BookOpen, Star, Calendar, Flame, Award, Globe, Lock,
  Feather, Sparkles, TrendingUp, RefreshCw, Compass
} from 'lucide-react';
import { statisticsApi } from '../services/api';
import { formatDate, countWords } from '../utils/helpers';

export const Statistics = () => {
  const { entries, loading: entriesLoading, refresh } = useEntries({ limit: 1000 });
  const { categories: cats, loading: catsLoading } = useCategories();
  const [serverStats, setServerStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchServerStats = () => {
    return statisticsApi.get()
      .then((res) => {
        setServerStats(res.data.statistics || null);
      })
      .catch(() => {
        setServerStats(null);
      });
  };

  useEffect(() => {
    fetchServerStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refresh(), fetchServerStats()]);
    setIsRefreshing(false);
  };

  // ─── Heavy Mathematical & Logical Calculations ──────────────────────────────
  const computed = useMemo(() => {
    if (entriesLoading || catsLoading) return null;

    const totalEntries = entries.length;
    if (totalEntries === 0 && !serverStats) {
      return {
        totalEntries: 0,
        totalWords: 0,
        avgWords: 0,
        totalQuotes: 0,
        totalFavorites: 0,
        totalPinned: 0,
        publicEntries: 0,
        privateEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        wroteToday: false,
        entriesThisMonth: 0,
        entriesThisWeek: 0,
        timeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
        peakHourLabel: '—',
        dayOfWeek: { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 },
        peakDayLabel: '—',
        last30Days: [],
        categoryBreakdown: [],
        topCategory: '—',
        firstDate: null,
        journalDays: 0,
        readingTimeMinutes: 0,
      };
    }

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // 1. Word counts & reading times
    let totalWords = 0;
    entries.forEach((e) => {
      totalWords += countWords(e.content);
    });
    const avgWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
    const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

    // 2. Type & status counts
    const totalQuotes = entries.filter((e) => e.type === 'quote').length;
    const totalFavorites = serverStats?.favorites ?? entries.filter((e) => e.isFavorite).length;
    const totalPinned = serverStats?.pinned ?? entries.filter((e) => e.isPinned).length;
    const publicEntries = serverStats?.publicEntries ?? entries.filter((e) => e.visibility === 'public').length;
    const privateEntries = serverStats?.privateEntries ?? (totalEntries - publicEntries);

    // 3. Entries this month & this week
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let entriesThisMonth = 0;
    let entriesThisWeek = 0;

    entries.forEach((e) => {
      const d = new Date(e.entryDate || e.createdAt);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        entriesThisMonth++;
      }
      if (d >= oneWeekAgo) {
        entriesThisWeek++;
      }
    });

    // 4. Mathematical Streak Calculation (Consecutive calendar days)
    const toDateKey = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const dateKeysSet = new Set(
      entries.map((e) => toDateKey(new Date(e.entryDate || e.createdAt)))
    );
    const sortedDateKeys = Array.from(dateKeysSet).sort();

    const todayKey = toDateKey(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = toDateKey(yesterdayDate);

    const wroteToday = dateKeysSet.has(todayKey);
    const wroteYesterday = dateKeysSet.has(yesterdayKey);

    let currentStreak = 0;
    if (wroteToday || wroteYesterday) {
      let cursor = new Date(wroteToday ? now : yesterdayDate);
      while (true) {
        const key = toDateKey(cursor);
        if (dateKeysSet.has(key)) {
          currentStreak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    let prevDateObj = null;

    for (const key of sortedDateKeys) {
      const curDateObj = new Date(`${key}T00:00:00`);
      if (prevDateObj) {
        const diffMs = curDateObj.getTime() - prevDateObj.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevDateObj = curDateObj;
    }

    // Merge with server streak if server has a higher value
    if (serverStats?.longestStreak && serverStats.longestStreak > longestStreak) {
      longestStreak = serverStats.longestStreak;
    }
    if (serverStats?.currentStreak && serverStats.currentStreak > currentStreak) {
      currentStreak = serverStats.currentStreak;
    }

    // 5. Time of Day breakdown (Reflection hours)
    const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    entries.forEach((e) => {
      const d = new Date(e.createdAt || e.entryDate);
      const hour = d.getHours();
      if (hour >= 5 && hour < 12) timeOfDay.morning++;
      else if (hour >= 12 && hour < 17) timeOfDay.afternoon++;
      else if (hour >= 17 && hour < 21) timeOfDay.evening++;
      else timeOfDay.night++;
    });

    const timeBucketsSorted = [
      { key: 'morning', label: 'Morning Reflector', count: timeOfDay.morning },
      { key: 'afternoon', label: 'Afternoon Writer', count: timeOfDay.afternoon },
      { key: 'evening', label: 'Twilight Contemplator', count: timeOfDay.evening },
      { key: 'night', label: 'Night Owl', count: timeOfDay.night },
    ].sort((a, b) => b.count - a.count);

    const peakHourLabel = timeBucketsSorted[0]?.count > 0
      ? `Mostly ${timeBucketsSorted[0].label}`
      : 'Anytime';

    // 6. Day of Week frequency
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    entries.forEach((e) => {
      const d = new Date(e.entryDate || e.createdAt);
      const name = dayNames[d.getDay()];
      dayOfWeek[name] = (dayOfWeek[name] || 0) + 1;
    });

    const peakDayEntry = Object.entries(dayOfWeek).sort((a, b) => b[1] - a[1])[0];
    const peakDayLabel = peakDayEntry && peakDayEntry[1] > 0
      ? `Peak on ${peakDayEntry[0]}days`
      : 'Balanced';

    // 7. Last 30 Days activity heatmap
    const last30Days = [];
    const dateCounts = {};
    entries.forEach((e) => {
      const key = toDateKey(new Date(e.entryDate || e.createdAt));
      dateCounts[key] = (dateCounts[key] || 0) + 1;
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      last30Days.push({
        date: key,
        dayNumber: d.getDate(),
        count: dateCounts[key] || 0,
      });
    }

    // 8. Category / Type breakdown
    const categoryCounts = {};
    entries.forEach((e) => {
      const t = (e.type || 'diary').toLowerCase();
      categoryCounts[t] = (categoryCounts[t] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / totalEntries) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    const topCategory = categoryBreakdown[0]?.name || 'Diary';

    // 9. First entry & Journal age
    const firstDateRaw = serverStats?.firstEntry || (sortedDateKeys[0] ? `${sortedDateKeys[0]}T00:00:00` : null);
    const firstDate = firstDateRaw ? new Date(firstDateRaw) : null;
    const journalDays = firstDate
      ? Math.max(1, Math.round((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 1;

    return {
      totalEntries,
      totalWords,
      avgWords,
      totalQuotes,
      totalFavorites,
      totalPinned,
      publicEntries,
      privateEntries,
      currentStreak,
      longestStreak,
      wroteToday,
      entriesThisMonth,
      entriesThisWeek,
      timeOfDay,
      peakHourLabel,
      dayOfWeek,
      peakDayLabel,
      last30Days,
      categoryBreakdown,
      topCategory,
      firstDate,
      journalDays,
      readingTimeMinutes,
    };
  }, [entries, entriesLoading, catsLoading, serverStats]);

  if (entriesLoading || catsLoading || !computed) {
    return <LoadingState message="Measuring the depth of your pages..." />;
  }

  // Top metric overview cards
  const statCards = [
    {
      key: 'entries',
      title: 'Total Entries',
      value: computed.totalEntries,
      badge: `${computed.entriesThisMonth} this month`,
      icon: 'entries',
      color: 'gold',
      subtitle: `Across ${computed.journalDays} day${computed.journalDays === 1 ? '' : 's'} of journaling`,
    },
    {
      key: 'words',
      title: 'Total Words',
      value: computed.totalWords.toLocaleString(),
      badge: `~${computed.readingTimeMinutes} min read`,
      icon: 'words',
      color: 'gold',
      subtitle: `${computed.avgWords} avg words per reflection`,
    },
    {
      key: 'favorites',
      title: 'Starred & Resonant',
      value: computed.totalFavorites,
      badge: `${computed.totalQuotes} Quotes`,
      icon: 'favorites',
      color: 'gold',
      subtitle: `${computed.totalPinned} thoughts pinned to your journal`,
    },
    {
      key: 'privacy',
      title: 'Sanctuary Ratio',
      value: `${computed.totalEntries > 0 ? Math.round((computed.privateEntries / computed.totalEntries) * 100) : 100}%`,
      badge: `${computed.publicEntries} Public`,
      icon: 'privateEntries',
      color: 'gold',
      subtitle: `${computed.privateEntries} entries kept strictly private`,
    },
  ];

  return (
    <div
      style={{
        padding: 'clamp(14px, 3vw, 32px)',
        maxWidth: '1080px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        animation: 'fadeIn 0.4s var(--ease-out)',
      }}
    >
      {/* ── Editorial Header ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '18px',
        }}
      >
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--gold)',
            marginBottom: '4px',
          }}>
            <Compass size={14} /> Writing Analytics & Insights
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: 'clamp(1.6rem, 3.4vw, 2.2rem)',
              fontWeight: 600,
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Statistics & Reflections
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
            The rhythm, dedication, and cadence of your silent words.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--border)',
            color: 'var(--ink)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: isRefreshing ? 'default' : 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isRefreshing) e.currentTarget.style.borderColor = 'rgba(223, 178, 100, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <RefreshCw
            size={13}
            style={{
              color: 'var(--gold)',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}
          />
          {isRefreshing ? 'Recalculating...' : 'Refresh Stats'}
        </button>
      </header>

      {/* ── 1. Key Metrics 4-Column Grid ── */}
      <section>
        <StatisticsGrid stats={statCards} />
      </section>

      {/* ── 2. Habit Momentum / Streak Hero ── */}
      <section>
        <StreakDisplay
          currentStreak={computed.currentStreak}
          longestStreak={computed.longestStreak}
          wroteToday={computed.wroteToday}
        />
      </section>

      {/* ── 3. 30-Day Activity Heatmap Cadence ── */}
      <section>
        <ActivityHeatmap days={computed.last30Days} />
      </section>

      {/* ── 4. Reflection Hours & Weekly Cadence ── */}
      <section>
        <WritingRhythm
          timeOfDay={computed.timeOfDay}
          dayOfWeek={computed.dayOfWeek}
          peakHourLabel={computed.peakHourLabel}
          peakDayLabel={computed.peakDayLabel}
        />
      </section>

      {/* ── 5. Category Breakdown & Milestone Tracker (2 Columns) ── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '16px',
        }}
      >
        <CategoryBreakdown
          categories={computed.categoryBreakdown}
          totalEntries={computed.totalEntries}
        />
        <MilestoneTracker
          totalEntries={computed.totalEntries}
          totalWords={computed.totalWords}
          streak={computed.currentStreak}
        />
      </section>

      {/* ── 6. Poetic Narrative: "Your Story So Far" ── */}
      <section
        style={{
          backgroundColor: 'var(--paper)',
          border: '1px solid rgba(223, 178, 100, 0.3)',
          borderRadius: '16px',
          padding: '24px 28px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 18px -4px rgba(0, 0, 0, 0.12)',
        }}
        className="paper-texture"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Feather size={18} style={{ color: 'var(--gold)' }} />
          <h3
            style={{
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1.18rem',
              fontWeight: 600,
              margin: 0,
              color: 'var(--ink)',
            }}
          >
            Chronicle of Your Quiet Thoughts
          </h3>
        </div>

        <p
          style={{
            margin: 0,
            color: 'var(--ink-muted)',
            lineHeight: 1.65,
            fontSize: '0.94rem',
            fontFamily: 'var(--font-family-heading)',
            fontStyle: 'italic',
          }}
        >
          {computed.totalEntries === 0 ? (
            'Your journal lies open, pristine and waiting for its first brush of ink. Begin whenever you are ready.'
          ) : (
            <>
              Across <strong>{computed.journalDays} day{computed.journalDays === 1 ? '' : 's'}</strong> of contemplation, you have inscribed{' '}
              <strong>{computed.totalEntries} {computed.totalEntries === 1 ? 'page' : 'pages'}</strong> and{' '}
              <strong>{computed.totalWords.toLocaleString()} words</strong> into your sanctuary.
              {computed.firstDate && ` Your journey began on ${formatDate(computed.firstDate, 'DISPLAY')}.`}
              {computed.timeOfDay.night > computed.timeOfDay.morning && computed.timeOfDay.night > computed.timeOfDay.afternoon
                ? ' You seem to find your truest clarity during the quiet night hours.'
                : ' You prefer reflecting with the morning light and daytime calm.'}
              {` Most of your reflections center on `}
              <strong style={{ textTransform: 'capitalize' }}>{computed.topCategory}</strong>.
              {computed.totalFavorites > 0 && ` ${computed.totalFavorites} of these memories shine as your personal favorites.`}
              {computed.currentStreak > 1 && ` You are currently holding a ${computed.currentStreak}-day uninterrupted writing streak.`}
              {' '}Each entry proves that silent words have their own enduring strength.
            </>
          )}
        </p>
      </section>
    </div>
  );
};

export default Statistics;
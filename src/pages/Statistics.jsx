import { useState, useEffect } from 'react';
import { useEntries } from '../hooks/useEntries';
import { useCategories } from '../hooks/useEntries';
import { StatisticsGrid, StreakDisplay, CategoryBreakdown } from '../components/diary/StatisticsCard';
import { LoadingState } from '../components/ui/LoadingState';
import { BookOpen, Star, Calendar, Target, Flame, Award, TrendingUp } from 'lucide-react';
import { statisticsApi } from '../services/api';
import { formatDate } from '../utils/helpers';
import { classNames } from '../utils/helpers';

export const Statistics = () => {
  const { entries, loading: entriesLoading } = useEntries({ limit: 100 });
  const { categories: cats, loading: catsLoading } = useCategories();
  const [stats, setStats] = useState(null);
  const [serverStats, setServerStats] = useState(null);

  useEffect(() => {
    let active = true;
    statisticsApi.get()
      .then((response) => {
        if (active) setServerStats(response.data.statistics || null);
      })
      .catch(() => {
        if (active) setServerStats(null);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (entriesLoading || catsLoading) return;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const totalEntries = entries.length;
    const totalQuotes = entries.filter(e => e.type === 'quote').length;
    const totalFavorites = entries.filter(e => e.isFavorite).length;
    const entriesThisMonth = entries.filter(e => {
      const d = new Date(e.entryDate || e.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // Calculate streaks
    const dates = [...new Set(entries.map(e => (e.entryDate || e.createdAt).split('T')[0]))].sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = dates.length - 1; i >= 0; i--) {
      const date = new Date(dates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - (dates.length - 1 - i));
      
      if (date.toDateString() === expectedDate.toDateString()) {
        tempStreak++;
        if (i === dates.length - 1) currentStreak = tempStreak;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;

    // Category breakdown
    const categoryCounts = {};
    entries.forEach(e => {
      categoryCounts[e.type] = (categoryCounts[e.type] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count, percentage: ((count / totalEntries) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    const topCategory = categoryBreakdown[0]?.name || '—';

    setStats({
      totalEntries,
      totalQuotes,
      totalFavorites,
      currentStreak,
      longestStreak,
      entriesThisMonth,
      topCategory,
      categoryBreakdown,
      publicEntries: serverStats?.publicEntries ?? entries.filter(e => e.visibility === 'public').length,
      privateEntries: serverStats?.privateEntries ?? entries.filter(e => e.visibility !== 'public').length,
    });
  }, [entries, entriesLoading, cats, catsLoading, serverStats]);

  if (entriesLoading || catsLoading || !stats) {
    return <LoadingState message="Calculating your story..." />;
  }

  const statCards = [
    { key: 'entries', title: 'Total Entries', value: stats.totalEntries, icon: 'entries', color: 'brown', subtitle: 'Pages in your diary' },
    { key: 'quotes', title: 'Quotes Saved', value: stats.totalQuotes, icon: 'quotes', color: 'gold', subtitle: 'Words that resonated' },
    { key: 'favorites', title: 'Favorites', value: stats.totalFavorites, icon: 'favorites', color: 'gold', subtitle: 'Special thoughts' },
    { key: 'publicEntries', title: 'Public Entries', value: stats.publicEntries, icon: 'publicEntries', color: 'gold', subtitle: 'Shared in Explore' },
    { key: 'privateEntries', title: 'Private Entries', value: stats.privateEntries, icon: 'privateEntries', color: 'brown', subtitle: 'Visible only to you' },
    { key: 'month', title: 'This Month', value: stats.entriesThisMonth, icon: 'monthEntries', color: 'brown', subtitle: formatDate(new Date(), 'MMMM yyyy') },
    { key: 'streak', title: 'Current Streak', value: stats.currentStreak, icon: 'streak', color: 'gold', subtitle: `${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''} in a row` },
    { key: 'longest', title: 'Longest Streak', value: stats.longestStreak, icon: 'longestStreak', color: 'brown', subtitle: 'Your best run' },
  ];

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, color: 'var(--ink)', margin: '0 0 var(--spacing-xs)' }}>
          Statistics
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
          Your writing journey in numbers
        </p>
      </header>

      <StatisticsGrid stats={statCards} />

      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <StreakDisplay currentStreak={stats.currentStreak} longestStreak={stats.longestStreak} />
      </div>

      {stats.categoryBreakdown.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <CategoryBreakdown categories={stats.categoryBreakdown} />
        </div>
      )}

      <div style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-xl)', backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }} className="paper-texture diary-page">
        <h3 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 var(--spacing-lg)', color: 'var(--ink)' }}>
          Your Story So Far
        </h3>
        <p style={{ margin: 0, color: 'var(--ink-muted)', lineHeight: 1.5, fontSize: '1.05rem' }}>
          You&apos;ve written <strong>{stats.totalEntries}</strong> {stats.totalEntries === 1 ? 'entry' : 'entries'} in your diary.
          {stats.totalQuotes > 0 && ` ${stats.totalQuotes} of them are quotes you wanted to remember.`}
          {stats.totalFavorites > 0 && ` ${stats.totalFavorites} are marked as favorites.`}
          {stats.publicEntries > 0 && ` ${stats.publicEntries} ${stats.publicEntries === 1 ? 'entry is' : 'entries are'} shared publicly.`}
          {stats.privateEntries > 0 && ` ${stats.privateEntries} ${stats.privateEntries === 1 ? 'entry stays' : 'entries stay'} private.`}
          {stats.currentStreak > 0 && ` You&apos;re on a ${stats.currentStreak}-day writing streak!`}
          {stats.longestStreak > stats.currentStreak && ` Your longest streak was ${stats.longestStreak} days.`}
          {stats.entriesThisMonth > 0 && ` This month you&apos;ve written ${stats.entriesThisMonth} entries.`}
          <br /><br />
          The most used category is <strong>{stats.topCategory}</strong>.
          Keep writing — every entry adds a page to your story.
        </p>
      </div>
    </div>
  );
};
import { BookOpen, Star, Calendar, BarChart2, Target, Flame, Award, Globe, Lock } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const statIcons = { entries: BookOpen, quotes: Star, favorites: Star, streak: Flame, longestStreak: Award, monthEntries: Calendar, topCategory: Target, publicEntries: Globe, privateEntries: Lock };

export const StatisticsCard = ({ title, value, subtitle, icon, trend, color = 'brown' }) => {
  const Icon = statIcons[icon] || BookOpen;

  return (
    <div style={{
      backgroundColor: 'var(--paper)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-xl)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-md)',
    }} className="paper-texture diary-page fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </p>
          <p style={{ margin: 'var(--spacing-xs) 0 0', fontFamily: 'var(--font-family-ui)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>
            {value}
          </p>
        </div>
        <div style={{
          width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
          backgroundColor: `var(--${color})20`, color: `var(--${color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={24} />
        </div>
      </div>

      {subtitle && (
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}

      {trend && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)',
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          backgroundColor: trend.positive ? 'var(--success)20' : 'var(--error)20',
          color: trend.positive ? 'var(--success)' : 'var(--error)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem', fontWeight: 500, alignSelf: 'flex-start',
        }}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  );
};

export const StatisticsGrid = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }} className="paper-texture">
            <div style={{ height: '1rem', background: 'linear-gradient(90deg, var(--border) 25%, var(--paper-dark) 50%, var(--border) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px', marginBottom: 'var(--spacing-md)' }} />
            <div style={{ height: '2.5rem', background: 'linear-gradient(90deg, var(--border) 25%, var(--paper-dark) 50%, var(--border) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
      {stats.map((stat, index) => {
        const { key, ...rest } = stat;
        return (
          <StatisticsCard key={key} {...rest} style={{ animationDelay: `${index * 100}ms` }} />
        );
      })}
    </div>
  );
};

export const StreakDisplay = ({ currentStreak, longestStreak }) => (
  <div style={{
    background: 'linear-gradient(135deg, var(--paper) 0%, var(--paper-dark) 100%)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-xl)',
    textAlign: 'center',
  }} className="paper-texture diary-page">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        backgroundColor: 'var(--gold)', color: 'var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Flame size={32} />
      </div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
          Current Streak
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-family-ui)', fontSize: '3rem', fontWeight: 700, color: 'var(--ink)' }}>
          {currentStreak}
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
          day{currentStreak !== 1 ? 's' : ''} in a row
        </p>
      </div>
    </div>

    <div style={{
      paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
          Longest Streak
        </p>
        <p style={{ margin: 'var(--spacing-xs) 0 0', fontFamily: 'var(--font-family-ui)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)' }}>
          {longestStreak} days
        </p>
      </div>
    </div>
  </div>
);

export const CategoryBreakdown = ({ categories = [] }) => (
  <div style={{
    backgroundColor: 'var(--paper)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
  }} className="paper-texture diary-page">
    <h3 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 var(--spacing-lg)', color: 'var(--ink)' }}>
      Entries by Category
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {categories.map((cat, index) => (
        <div key={cat.name || index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <span style={{ width: '100px', fontSize: '0.9rem', color: 'var(--ink-muted)', textTransform: 'capitalize' }}>
            {cat.name}
          </span>
          <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${cat.percentage || 0}%`,
              height: '100%',
              backgroundColor: `var(--${cat.color || 'brown'})`,
              borderRadius: '4px',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ width: '50px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)' }}>
            {cat.count}
          </span>
        </div>
      ))}
    </div>
  </div>
);
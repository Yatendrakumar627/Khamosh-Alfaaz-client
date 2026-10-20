import { Badge as MantineBadge } from '@mantine/core';
import { Star, Pin, Lock, Globe } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export const Badge = ({ children, variant = 'subtle', color = 'brown', size = 'sm', className, ...props }) => {
  return (
    <MantineBadge
      variant={variant}
      color={color}
      size={size}
      className={classNames(className)}
      styles={(theme) => ({
        root: {
          fontWeight: 500,
          fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
          borderRadius: '9999px',
          padding: '4px 10px',
        },
      })}
      {...props}
    >
      {children}
    </MantineBadge>
  );
};

const TYPE_BADGE_STYLES = {
  diary: {
    bg: 'rgba(223, 178, 100, 0.12)',
    border: 'rgba(223, 178, 100, 0.28)',
    color: 'var(--gold)',
    label: 'Diary',
  },
  thought: {
    bg: 'rgba(104, 155, 176, 0.12)',
    border: 'rgba(104, 155, 176, 0.26)',
    color: 'var(--info)',
    label: 'Thought',
  },
  quote: {
    bg: 'rgba(223, 178, 100, 0.16)',
    border: 'rgba(223, 178, 100, 0.35)',
    color: 'var(--gold)',
    label: 'Quote',
  },
  idea: {
    bg: 'rgba(220, 166, 68, 0.14)',
    border: 'rgba(220, 166, 68, 0.28)',
    color: 'var(--warning)',
    label: 'Idea',
  },
  note: {
    bg: 'rgba(172, 161, 147, 0.12)',
    border: 'rgba(172, 161, 147, 0.22)',
    color: 'var(--ink-muted)',
    label: 'Note',
  },
  personal: {
    bg: 'rgba(199, 90, 70, 0.13)',
    border: 'rgba(199, 90, 70, 0.28)',
    color: 'var(--error)',
    label: 'Personal',
  },
  gratitude: {
    bg: 'rgba(223, 178, 100, 0.14)',
    border: 'rgba(223, 178, 100, 0.3)',
    color: 'var(--gold)',
    label: 'Gratitude',
  },
};

export const TypeBadge = ({ type }) => {
  const current = TYPE_BADGE_STYLES[type] || {
    bg: 'rgba(172, 161, 147, 0.12)',
    border: 'rgba(172, 161, 147, 0.22)',
    color: 'var(--ink-muted)',
    label: type || 'Diary',
  };

  return (
    <span
      className="entry-badge-type"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.67rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        color: current.color,
        fontFamily: 'inherit',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {current.label}
    </span>
  );
};

export const FavoriteBadge = ({ isFavorite, size = 'sm' }) => (
  <Badge variant={isFavorite ? 'filled' : 'subtle'} color="yellow" size={size}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Star size={13} fill={isFavorite ? 'currentColor' : 'none'} />
      {isFavorite ? 'Favorite' : 'Add Favorite'}
    </span>
  </Badge>
);

export const PinBadge = ({ isPinned, size = 'sm' }) => (
  <Badge variant={isPinned ? 'filled' : 'subtle'} color="blue" size={size}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Pin size={13} fill={isPinned ? 'currentColor' : 'none'} />
      {isPinned ? 'Pinned' : 'Pin'}
    </span>
  </Badge>
);

export const VisibilityBadge = ({ visibility = 'private' }) => {
  const isPublic = visibility === 'public';
  return (
    <span
      className={isPublic ? 'entry-badge-public' : 'entry-badge-private'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.67rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        backgroundColor: isPublic ? 'rgba(126, 168, 89, 0.14)' : 'rgba(255, 255, 255, 0.04)',
        border: isPublic ? '1px solid rgba(126, 168, 89, 0.3)' : '1px solid var(--border)',
        color: isPublic ? 'var(--success)' : 'var(--ink-light)',
        fontFamily: 'inherit',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transition: 'all 0.18s ease',
      }}
    >
      {isPublic ? <Globe size={11} strokeWidth={2.2} /> : <Lock size={11} strokeWidth={2.2} />}
      <span>{isPublic ? 'Public' : 'Private'}</span>
    </span>
  );
};
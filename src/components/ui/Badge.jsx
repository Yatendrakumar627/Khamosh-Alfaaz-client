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

export const TypeBadge = ({ type, theme = 'light' }) => {
  const colors = {
    light: {
      diary: 'brown',
      thought: 'blue',
      quote: 'yellow',
      idea: 'orange',
      note: 'gray',
      personal: 'red',
      gratitude: 'yellow',
      other: 'gray',
    },
    dark: {
      diary: 'brown',
      thought: 'blue',
      quote: 'yellow',
      idea: 'orange',
      note: 'gray',
      personal: 'red',
      gratitude: 'yellow',
      other: 'gray',
    },
  };

  const labels = {
    diary: 'Diary',
    thought: 'Thought',
    quote: 'Quote',
    idea: 'Idea',
    note: 'Note',
    personal: 'Personal',
    gratitude: 'Gratitude',
    other: 'Other',
  };

  return (
    <Badge color={colors[theme]?.[type] || 'gray'} variant="light">
      {labels[type] || type}
    </Badge>
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

export const VisibilityBadge = ({ visibility = 'private', size = 'sm' }) => (
  <Badge variant={visibility === 'public' ? 'filled' : 'subtle'} color={visibility === 'public' ? 'teal' : 'gray'} size={size}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {visibility === 'public' ? <Globe size={13} /> : <Lock size={13} />}
      {visibility === 'public' ? 'Public' : 'Private'}
    </span>
  </Badge>
);
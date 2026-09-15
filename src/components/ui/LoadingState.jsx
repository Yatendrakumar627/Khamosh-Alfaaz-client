import { Loader } from '@mantine/core';

export const LoadingState = ({ message = 'Loading...', size = 'md', centered = true }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: centered ? 'center' : 'flex-start',
    gap: 'var(--spacing-md)',
    minHeight: centered ? '200px' : 'auto',
    padding: 'var(--spacing-xl)',
    color: 'var(--ink-muted)',
  }}>
    <Loader size={size} color="brown" />
    {message && <span style={{ fontSize: '0.9rem' }}>{message}</span>}
  </div>
);

export const InlineLoader = ({ size = 'sm', color = 'brown' }) => (
  <Loader size={size} color={color} />
);

export const PageLoader = ({ message = 'Opening your diary...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    backgroundColor: 'var(--background)',
    color: 'var(--ink-muted)',
  }}>
    <Loader size="lg" color="brown" />
    <p style={{ marginTop: 'var(--spacing-lg)', fontSize: '1.1rem' }}>{message}</p>
  </div>
);

export const Skeleton = ({ width = '100%', height = '1rem', borderRadius = '4px' }) => (
  <div style={{
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, var(--border) 25%, var(--paper-dark) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }} />
);

export const EntryCardSkeleton = () => (
  <div style={{ padding: 'var(--spacing-lg)' }}>
    <Skeleton width="60%" height="1.5rem" marginBottom="var(--spacing-md)" />
    <Skeleton width="100%" height="1rem" marginBottom="var(--spacing-sm)" />
    <Skeleton width="80%" height="1rem" marginBottom="var(--spacing-sm)" />
    <Skeleton width="40%" height="1rem" />
  </div>
);
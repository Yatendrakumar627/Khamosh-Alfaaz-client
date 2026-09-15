import { Link } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { formatDate, getEntryTypeLabel, truncate } from '../../utils/helpers';

export const PublicEntryCard = ({ entry }) => {
  const typeLabel = getEntryTypeLabel(entry.type);

  return (
    <Link
      to={`/explore/${entry._id}`}
      className="public-card"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="paper-texture"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          height: '100%',
          padding: '20px 22px',
          backgroundColor: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <div className="public-card-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
            }}
          >
            <Feather size={13} style={{ color: 'var(--gold)' }} />
            {typeLabel}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
            {formatDate(entry.entryDate, 'SHORT')}
          </span>
        </div>

        {entry.title && (
          <h3
            style={{
              margin: 0,
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1.15rem',
              fontWeight: 500,
              color: 'var(--ink)',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {entry.title}
          </h3>
        )}

        <p
          style={{
            margin: 0,
            fontSize: '0.92rem',
            color: 'var(--ink-muted)',
            lineHeight: 1.7,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontStyle: entry.type === 'quote' ? 'italic' : 'normal',
            fontFamily: entry.type === 'quote' ? 'var(--font-family-heading)' : 'var(--font-family-body)',
          }}
        >
          {truncate(entry.content, 220)}
        </p>

        {entry.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
            {entry.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink-muted)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: 'var(--gold)',
          }}
        >
          Read quietly
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
};

export default PublicEntryCard;
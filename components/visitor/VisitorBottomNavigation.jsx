import { NavLink } from 'react-router-dom';
import { getNavIcon } from '../../constants/navIcons';
import { classNames } from '../../utils/helpers';

export const VisitorBottomNavigation = ({ onMore, moreActive }) => {
  const items = [
    { path: '/', label: 'Home', icon: 'home', end: true },
    { path: '/explore', label: 'Explore', icon: 'explore' },
    { path: '/login', label: 'Write', icon: 'write' },
    { path: '/quotes', label: 'Quotes', icon: 'quotes' },
    { path: null, label: 'More', icon: 'more' },
  ];

  return (
    <nav aria-label="Bottom navigation" className="bottom-nav">
      {items.map(item => {
        const Icon = getNavIcon(item.icon);

        if (!item.path) {
          return (
            <button
              key={item.icon}
              type="button"
              onClick={onMore}
              className={classNames('bottom-nav-item', moreActive && 'active')}
              style={{
                background: 'transparent',
                border: 'none',
                textDecoration: 'none',
                fontSize: '0.58rem',
                fontWeight: 500,
                padding: '5px 0 3px',
                fontFamily: 'var(--font-family-ui)',
              }}
              aria-label="More options"
            >
              <Icon size={18} strokeWidth={moreActive ? 2.2 : 1.8} />
              <span style={{ color: moreActive ? 'var(--gold)' : 'var(--ink-light)' }}>{item.label}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={item.icon}
            to={item.path}
            end={item.end}
            className={({ isActive }) => classNames('bottom-nav-item', isActive && 'active')}
            style={{
              textDecoration: 'none',
              fontSize: '0.58rem',
              fontWeight: 500,
              padding: '5px 0 3px',
            }}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ color: isActive ? 'var(--gold)' : 'var(--ink-light)' }}>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default VisitorBottomNavigation;
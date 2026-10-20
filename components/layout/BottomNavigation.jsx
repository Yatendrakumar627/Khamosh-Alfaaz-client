import { NavLink, useLocation } from 'react-router-dom';
import { MOBILE_NAV_ITEMS } from '../../routes';
import { getNavIcon } from '../../constants/navIcons';
import { useSidebar } from '../../context/SidebarContext';
import { classNames } from '../../utils/helpers';

export const BottomNavigation = () => {
  const { open } = useSidebar();
  const { pathname } = useLocation();

  const isPrimaryActive = MOBILE_NAV_ITEMS.some(
    item => item.path && (pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path)))
  );

  return (
    <nav
      aria-label="Bottom navigation"
      className="bottom-nav"
    >
      {MOBILE_NAV_ITEMS.map(item => {
        const Icon = getNavIcon(item.icon);

        if (!item.path) {
          const active = !isPrimaryActive;
          return (
            <button
              key={item.icon || item.label}
              type="button"
              onClick={open}
              className={classNames('bottom-nav-item', active && 'active')}
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
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ color: active ? 'var(--gold)' : 'var(--ink-light)' }}>{item.label}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={item.icon || item.path}
            to={item.path}
            className={({ isActive }) => classNames('bottom-nav-item', isActive && !item.noActive && 'active')}
            style={{
              textDecoration: 'none',
              fontSize: '0.58rem',
              fontWeight: 500,
              padding: '5px 0 3px',
            }}
          >
            {({ isActive }) => {
              const active = isActive && !item.noActive;
              return (
                <>
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span style={{ color: active ? 'var(--gold)' : 'var(--ink-light)' }}>{item.label}</span>
                </>
              );
            }}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
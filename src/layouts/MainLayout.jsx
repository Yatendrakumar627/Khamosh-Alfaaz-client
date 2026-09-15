import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { RightPanel } from '../components/layout/RightPanel';
import { MobileNavigation } from '../components/layout/MobileNavigation';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { Toaster } from '../components/ui/Toast';
import { useSidebar } from '../context/SidebarContext';

export const MainLayout = () => {
  const { expanded } = useSidebar();

  return (
    <div className="layout-shell" style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex' }}>
      <Sidebar />

      <div
        className="layout-body"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: expanded ? '260px' : '60px',
          transition: 'padding-left 0.3s ease',
        }}
      >
        <Navbar />

        <div className="layout-main-row" style={{ flex: 1, display: 'flex', gap: '20px', padding: '0 20px', overflow: 'hidden' }}>
          <main
            className="dashboard-main"
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: 'auto',
              padding: '26px 0 40px',
            }}
          >
            <Outlet />
          </main>

          <RightPanel />
        </div>
      </div>

      <MobileNavigation />
      <BottomNavigation />
      <Toaster />
    </div>
  );
};
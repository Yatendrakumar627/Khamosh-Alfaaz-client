import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { createAppTheme } from './utils/theme';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FontProvider, useFont } from './context/FontContext';
import { SessionProvider } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider } from './context/SidebarContext';
import { DateFilterProvider } from './context/DateFilterContext';
import App from './App';

// ── Styles ─────────────────────────────────────────────────────────
// Foundation first (design tokens, themes, base, shared utilities),
// then name-wise stylesheets in src/styles/ (mirroring src/ structure),
// ordered by their original position in the former monolithic global.css.
import './assets/global.css';
import './styles/components/layout/Navbar.css';
import './styles/components/layout/RightPanel.css';
import './styles/layouts/MainLayout.css';
import './styles/pages/EntryDetail.css';
import './styles/pages/PublicEntry.css';
import './styles/components/layout/MobileNavigation.css';
import './styles/components/diary/SearchAndFilter.css';
import './styles/components/layout/Sidebar.css';
import './styles/components/diary/DashboardEntryCard.css';
import './styles/components/diary/EntryCard.css';
import './styles/pages/Entries.css';
import './styles/components/ui/Textarea.css';
import './styles/components/diary/EntryEditor.css';
import './styles/components/diary/WriteCard.css';
import './styles/components/ui/DatePicker.css';
import './styles/components/diary/Calendar.css';
import './styles/pages/Calendar.css';
import './styles/pages/Dashboard.css';
import './styles/pages/About.css';
import './styles/components/ui/Toast.css';
import './styles/components/diary/VoiceWritingToolbar.css';
import './styles/pages/VisitorHome.css';
import './styles/pages/PublicQuotes.css';
import './styles/layouts/VisitorLayout.css';
import './styles/components/diary/RecentMemories.css';
import './styles/pages/Categories.css';
import './styles/components/ui/CategoryHero.css';
import './styles/pages/Quotes.css';
import './styles/pages/CategorySection.css';
import './styles/pages/Favorites.css';
import './styles/pages/EditEntry.css';
import './styles/components/diary/VoiceRecorderCard.css';
// ───────────────────────────────────────────────────────────────────

const ThemedApp = () => {
  const { resolvedTheme } = useTheme();
  const { fontScheme } = useFont();

  return (
    <MantineProvider theme={createAppTheme(resolvedTheme, fontScheme)}>
      <SessionProvider>
        <ToastProvider>
          <SidebarProvider>
            <DateFilterProvider>
              <App />
            </DateFilterProvider>
          </SidebarProvider>
        </ToastProvider>
      </SessionProvider>
    </MantineProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <FontProvider>
        <ThemedApp />
      </FontProvider>
    </ThemeProvider>
  </React.StrictMode>
);
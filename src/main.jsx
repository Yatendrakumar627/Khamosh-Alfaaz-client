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
import './assets/global.css';

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
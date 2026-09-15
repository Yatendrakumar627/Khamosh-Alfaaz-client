import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { createAppTheme } from './utils/theme';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SessionProvider } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider } from './context/SidebarContext';
import { DateFilterProvider } from './context/DateFilterContext';
import App from './App';
import './assets/global.css';

const ThemedApp = () => {
  const { resolvedTheme } = useTheme();

  return (
    <MantineProvider theme={createAppTheme(resolvedTheme)}>
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
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>
);
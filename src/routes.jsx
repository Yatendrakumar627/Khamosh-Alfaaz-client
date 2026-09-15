import { lazy, Suspense } from 'react';
import { LoadingState } from './components/ui/LoadingState';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Entries = lazy(() => import('./pages/Entries').then(m => ({ default: m.Entries })));
const EntryDetail = lazy(() => import('./pages/EntryDetail').then(m => ({ default: m.EntryDetail })));
const EditEntry = lazy(() => import('./pages/EditEntry').then(m => ({ default: m.EditEntry })));
const Quotes = lazy(() => import('./pages/Quotes').then(m => ({ default: m.Quotes })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const Statistics = lazy(() => import('./pages/Statistics').then(m => ({ default: m.Statistics })));
const Export = lazy(() => import('./pages/Export').then(m => ({ default: m.Export })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

const PageWrapper = ({ children }) => (
  <Suspense fallback={<LoadingState message="Loading page..." />}>
    {children}
  </Suspense>
);

export const routes = [
  { path: 'dashboard', element: <PageWrapper><Dashboard /></PageWrapper> },
  { path: 'entries', element: <PageWrapper><Entries /></PageWrapper> },
  { path: 'entries/:id', element: <PageWrapper><EntryDetail /></PageWrapper> },
  { path: 'entries/:id/edit', element: <PageWrapper><EditEntry /></PageWrapper> },
  { path: 'quotes', element: <PageWrapper><Quotes /></PageWrapper> },
  { path: 'favorites', element: <PageWrapper><Favorites /></PageWrapper> },
  { path: 'calendar', element: <PageWrapper><Calendar /></PageWrapper> },
  { path: 'categories', element: <PageWrapper><Categories /></PageWrapper> },
  { path: 'statistics', element: <PageWrapper><Statistics /></PageWrapper> },
  { path: 'export', element: <PageWrapper><Export /></PageWrapper> },
  { path: 'settings', element: <PageWrapper><Settings /></PageWrapper> },
];

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: 'home' },
  { path: '/entries', label: 'Entries', icon: 'bookOpen' },
  { path: '/quotes', label: 'Quotes', icon: 'quote' },
  { path: '/favorites', label: 'Favorites', icon: 'star' },
  { path: '/calendar', label: 'Calendar', icon: 'calendar' },
  { path: '/categories', label: 'Categories', icon: 'tag' },
  { path: '/statistics', label: 'Statistics', icon: 'barChart' },
  { path: '/export', label: 'Export', icon: 'download' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

export const MOBILE_NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: 'home' },
  { path: '/entries', label: 'Entries', icon: 'bookOpen' },
  { path: '/quotes', label: 'Quotes', icon: 'quote' },
  { path: '/favorites', label: 'Favorites', icon: 'star' },
  { path: null, label: 'More', icon: 'more' },
];
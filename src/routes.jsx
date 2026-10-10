import { lazy, Suspense } from 'react';
import { LoadingState } from './components/ui/LoadingState';
import { CATEGORY_SECTIONS } from './constants/categorySections';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Entries = lazy(() => import('./pages/Entries').then(m => ({ default: m.Entries })));
const EntryDetail = lazy(() => import('./pages/EntryDetail').then(m => ({ default: m.EntryDetail })));
const EditEntry = lazy(() => import('./pages/EditEntry').then(m => ({ default: m.EditEntry })));
const Quotes = lazy(() => import('./pages/Quotes').then(m => ({ default: m.Quotes })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const CategorySection = lazy(() => import('./pages/CategorySection').then(m => ({ default: m.CategorySection })));
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
  // Dedicated Category Sections
  { path: 'diary', element: <PageWrapper><CategorySection key="diary" type="diary" /></PageWrapper> },
  { path: 'thoughts', element: <PageWrapper><CategorySection key="thoughts" type="thought" /></PageWrapper> },
  { path: 'quotes', element: <PageWrapper><CategorySection key="quotes" type="quote" /></PageWrapper> },
  { path: 'ideas', element: <PageWrapper><CategorySection key="ideas" type="idea" /></PageWrapper> },
  { path: 'notes', element: <PageWrapper><CategorySection key="notes" type="note" /></PageWrapper> },
  { path: 'personal', element: <PageWrapper><CategorySection key="personal" type="personal" /></PageWrapper> },
  { path: 'gratitude', element: <PageWrapper><CategorySection key="gratitude" type="gratitude" /></PageWrapper> },
  { path: 'category/:type', element: <PageWrapper><CategorySection /></PageWrapper> },
  // Other app pages
  { path: 'favorites', element: <PageWrapper><Favorites /></PageWrapper> },
  { path: 'calendar', element: <PageWrapper><Calendar /></PageWrapper> },
  { path: 'categories', element: <PageWrapper><Categories /></PageWrapper> },
  { path: 'statistics', element: <PageWrapper><Statistics /></PageWrapper> },
  { path: 'export', element: <PageWrapper><Export /></PageWrapper> },
  { path: 'settings', element: <PageWrapper><Settings /></PageWrapper> },
];

export const MAIN_NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: 'home' },
  { path: '/entries', label: 'All Entries', icon: 'bookOpen' },
  { path: '/favorites', label: 'Favorites', icon: 'star' },
  { path: '/calendar', label: 'Calendar', icon: 'calendar' },
];

const CATEGORY_ICON_MAP = {
  diary: 'bookOpen',
  thought: 'lightbulb',
  quote: 'quote',
  idea: 'sparkles',
  note: 'fileText',
  personal: 'heart',
  gratitude: 'star',
};

export const CATEGORY_NAV_ITEMS = CATEGORY_SECTIONS
  .filter(c => c.type !== 'other')
  .map(c => ({
    path: c.path,
    label: c.label,
    icon: CATEGORY_ICON_MAP[c.type] || 'circle',
    type: c.type,
  }));

export const TOOL_NAV_ITEMS = [
  { path: '/categories', label: 'Categories Hub', icon: 'tag' },
  { path: '/statistics', label: 'Statistics', icon: 'barChart' },
  { path: '/export', label: 'Export', icon: 'download' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

// Flat list for any consumers that expect NAV_ITEMS
export const NAV_ITEMS = [
  ...MAIN_NAV_ITEMS,
  ...CATEGORY_NAV_ITEMS,
  ...TOOL_NAV_ITEMS,
];

export const MOBILE_NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: 'home' },
  { path: '/entries', label: 'Entries', icon: 'bookOpen' },
  { path: '/thoughts', label: 'Thoughts', icon: 'lightbulb' },
  { path: '/quotes', label: 'Quotes', icon: 'quote' },
  { path: null, label: 'More', icon: 'more' },
];
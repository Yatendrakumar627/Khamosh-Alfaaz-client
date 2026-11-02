import { lazy } from 'react';
import { CATEGORY_SECTIONS } from './constants/categorySections';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard || m.default })));
const Entries = lazy(() => import('./pages/Entries').then(m => ({ default: m.Entries || m.default })));
const EntryDetail = lazy(() => import('./pages/EntryDetail').then(m => ({ default: m.EntryDetail || m.default })));
const EditEntry = lazy(() => import('./pages/EditEntry').then(m => ({ default: m.EditEntry || m.default })));
const Quotes = lazy(() => import('./pages/Quotes').then(m => ({ default: m.Quotes || m.default })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites || m.default })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar || m.default })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories || m.default })));
const CategorySection = lazy(() => import('./pages/CategorySection').then(m => ({ default: m.CategorySection || m.default })));
const Statistics = lazy(() => import('./pages/Statistics').then(m => ({ default: m.Statistics || m.default })));
const Export = lazy(() => import('./pages/Export').then(m => ({ default: m.Export || m.default })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings || m.default })));
const Explore = lazy(() => import('./pages/Explore').then(m => ({ default: m.Explore || m.default })));
const PublicEntry = lazy(() => import('./pages/PublicEntry').then(m => ({ default: m.PublicEntry || m.default })));

export const routes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'entries', element: <Entries /> },
  { path: 'entries/:id', element: <EntryDetail /> },
  { path: 'entries/:id/edit', element: <EditEntry /> },
  { path: 'explore', element: <Explore /> },
  { path: 'explore/:id', element: <PublicEntry /> },
  // Dedicated Category Sections
  { path: 'diary', element: <CategorySection key="diary" type="diary" /> },
  { path: 'thoughts', element: <CategorySection key="thoughts" type="thought" /> },
  { path: 'quotes', element: <CategorySection key="quotes" type="quote" /> },
  { path: 'ideas', element: <CategorySection key="ideas" type="idea" /> },
  { path: 'notes', element: <CategorySection key="notes" type="note" /> },
  { path: 'personal', element: <CategorySection key="personal" type="personal" /> },
  { path: 'gratitude', element: <CategorySection key="gratitude" type="gratitude" /> },
  { path: 'category/:type', element: <CategorySection /> },
  // Other app pages
  { path: 'favorites', element: <Favorites /> },
  { path: 'calendar', element: <Calendar /> },
  { path: 'categories', element: <Categories /> },
  { path: 'statistics', element: <Statistics /> },
  { path: 'export', element: <Export /> },
  { path: 'settings', element: <Settings /> },
];

export const MAIN_NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: 'home' },
  { path: '/entries', label: 'All Entries', icon: 'bookOpen' },
  { path: '/explore', label: 'Explore', icon: 'explore' },
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
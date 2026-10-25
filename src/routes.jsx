import { CATEGORY_SECTIONS } from './constants/categorySections';
import { Dashboard } from './pages/Dashboard';
import { Entries } from './pages/Entries';
import { EntryDetail } from './pages/EntryDetail';
import { EditEntry } from './pages/EditEntry';
import { Quotes } from './pages/Quotes';
import { Favorites } from './pages/Favorites';
import { Calendar } from './pages/Calendar';
import { Categories } from './pages/Categories';
import { CategorySection } from './pages/CategorySection';
import { Statistics } from './pages/Statistics';
import { Export } from './pages/Export';
import { Settings } from './pages/Settings';
import { Explore } from './pages/Explore';
import { PublicEntry } from './pages/PublicEntry';

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
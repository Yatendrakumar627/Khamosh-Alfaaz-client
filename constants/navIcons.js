import {
  Home,
  BookOpen,
  Quote,
  Star,
  Calendar,
  CalendarDays,
  Tag,
  BarChart3,
  ChartNoAxesColumn,
  Download,
  Settings,
  Lightbulb,
  Sparkles,
  FileText,
  Heart,
  Circle,
  MoreHorizontal,
  PenLine,
  Compass,
  Info,
} from 'lucide-react';

export const NAV_ICONS = {
  // Navigation keys
  home: Home,
  bookOpen: BookOpen,
  quote: Quote,
  quotes: Quote,
  star: Star,
  calendar: Calendar,
  calendarDays: CalendarDays,
  tag: Tag,
  barChart: BarChart3,
  chartColumn: ChartNoAxesColumn,
  download: Download,
  settings: Settings,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  fileText: FileText,
  heart: Heart,
  circle: Circle,
  more: MoreHorizontal,
  pen: PenLine,
  write: PenLine,
  explore: Compass,
  compass: Compass,
  info: Info,

  // Entry type aliases
  diary: BookOpen,
  thought: Lightbulb,
  idea: Sparkles,
  note: FileText,
  personal: Heart,
  gratitude: Star,
  other: Circle,
};

export const getNavIcon = (iconName, Fallback = BookOpen) => {
  return NAV_ICONS[iconName] || Fallback;
};

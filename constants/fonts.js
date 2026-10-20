// Font schemes — role-based typography.
// heading: titles, entry names, quotes (decorative serifs)
// body:    long-form writing — diary entries, paragraphs (readable book serifs)
// ui:      navigation, buttons, form labels, dates, statistics, settings (clean sans)

export const DEFAULT_FONT_SCHEME = 'literary';

export const FONT_SCHEMES = [
  {
    id: 'literary',
    name: 'Literary',
    tagline: 'Elegant & emotional',
    description: 'Cormorant Garamond titles · Lora writing · DM Sans interface',
    heading: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    body: '"Lora", "Cormorant Garamond", Georgia, serif',
    ui: '"DM Sans", "Inter", system-ui, sans-serif',
    handwriting: '"Dancing Script", "Great Vibes", cursive',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    tagline: 'Dramatic & premium',
    description: 'Playfair Display titles · Lora writing · DM Sans interface',
    heading: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
    body: '"Lora", "Cormorant Garamond", Georgia, serif',
    ui: '"DM Sans", "Inter", system-ui, sans-serif',
    handwriting: '"Dancing Script", "Great Vibes", cursive',
  },
  {
    id: 'classic',
    name: 'Classic',
    tagline: 'Old-book Garamond',
    description: 'EB Garamond throughout · DM Sans interface',
    heading: '"EB Garamond", "Cormorant Garamond", Georgia, serif',
    body: '"EB Garamond", "Cormorant Garamond", Georgia, serif',
    ui: '"DM Sans", "Inter", system-ui, sans-serif',
    handwriting: '"Dancing Script", "Great Vibes", cursive',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    tagline: 'Fully Cormorant',
    description: 'Cormorant Garamond throughout · DM Sans interface',
    heading: '"Cormorant Garamond", Georgia, serif',
    body: '"Cormorant Garamond", "Lora", Georgia, serif',
    ui: '"DM Sans", "Inter", system-ui, sans-serif',
    handwriting: '"Dancing Script", "Great Vibes", cursive',
  },
  {
    id: 'modern',
    name: 'Modern',
    tagline: 'Clean & minimal',
    description: 'DM Sans throughout',
    heading: '"DM Sans", "Inter", system-ui, sans-serif',
    body: '"DM Sans", "Inter", system-ui, sans-serif',
    ui: '"DM Sans", "Inter", system-ui, sans-serif',
    handwriting: '"Dancing Script", "Great Vibes", cursive',
  },
];

export const isValidFontScheme = (value) =>
  FONT_SCHEMES.some((scheme) => scheme.id === value);

export const getFontScheme = (schemeId = DEFAULT_FONT_SCHEME) =>
  FONT_SCHEMES.find((scheme) => scheme.id === schemeId) || FONT_SCHEMES[0];

export const getFontStacks = (schemeId = DEFAULT_FONT_SCHEME) => {
  const scheme = getFontScheme(schemeId);
  return {
    heading: scheme.heading,
    body: scheme.body,
    ui: scheme.ui,
    handwriting: scheme.handwriting,
  };
};

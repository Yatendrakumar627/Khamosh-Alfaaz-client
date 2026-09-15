import { createTheme, MantineProvider } from '@mantine/core';
import { colors, spacing, borderRadius, typography, transitions } from '../constants/colors';

const getTheme = (resolvedTheme) => {
  const isDark = resolvedTheme === 'dark';
  const c = colors[isDark ? 'dark' : 'light'];

  return createTheme({
    primaryColor: 'brown',
    primaryShade: { light: 5, dark: 5 },
    defaultRadius: 'sm',
    fontFamily: typography.fontFamily.body,
    fontFamilyMonospace: 'monospace',
    headings: {
      fontFamily: typography.fontFamily.heading,
      fontWeight: '600',
      sizes: {
        h1: { fontSize: typography.fontSize.display, lineHeight: typography.lineHeight.tight },
        h2: { fontSize: typography.fontSize.xxxl, lineHeight: typography.lineHeight.tight },
        h3: { fontSize: typography.fontSize.xxl, lineHeight: typography.lineHeight.normal },
        h4: { fontSize: typography.fontSize.xl, lineHeight: typography.lineHeight.normal },
        h5: { fontSize: typography.fontSize.lg, lineHeight: typography.lineHeight.normal },
        h6: { fontSize: typography.fontSize.md, lineHeight: typography.lineHeight.normal },
      },
    },
    colors: {
      brown: [
        c.paper,
        c.paperDark,
        c.paperDarker,
        c.border,
        c.borderDark,
        c.brown,
        c.brownDark,
        c.brownLight,
        c.accent,
        c.accentHover,
      ],
      gold: [
        c.paper,
        c.goldLight,
        c.goldLight,
        c.gold,
        c.gold,
        c.gold,
        c.goldDark,
        c.goldDark,
        c.goldDark,
        c.goldDark,
      ],
      ink: [
        c.background,
        c.backgroundAlt,
        c.paperDark,
        c.border,
        c.borderDark,
        c.inkLight,
        c.inkMuted,
        c.inkMuted,
        c.ink,
        c.ink,
      ],
    },
    spacing: {
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
      xl: spacing.xl,
      xxl: spacing.xxl,
    },
    radius: {
      xs: borderRadius.sm,
      sm: borderRadius.md,
      md: borderRadius.lg,
      lg: borderRadius.xl,
      xl: borderRadius.xl,
    },
    shadows: {
      xs: c.shadowSm,
      sm: c.shadowMd,
      md: c.shadowLg,
      lg: c.shadowXl,
      xl: c.shadowXl,
    },
    transitionTimingFunction: transitions.normal,
    cursorType: 'pointer',
    respectReducedMotion: true,
    focusRing: `0 0 0 2px ${c.focus}59`,
    components: {
      Button: {
        defaultProps: {
          radius: 'sm',
          size: 'md',
        },
        styles: (theme) => ({
          root: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: 500,
            letterSpacing: '0.02em',
            transition: 'background-color 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
          },
        }),
      },
      TextInput: {
        defaultProps: {
          radius: 'sm',
          size: 'md',
        },
        styles: (theme) => ({
          input: {
            fontFamily: typography.fontFamily.body,
            backgroundColor: c.inputBg,
            border: `1px solid ${c.inputBorder}`,
            color: c.ink,
            boxShadow: 'none',
            '&::placeholder': {
              color: c.inkLight,
            },
            '&:focus': {
              borderColor: c.inputFocusBorder,
              boxShadow: `0 0 0 1px ${c.focus}66`,
            },
          },
          label: {
            color: c.inkMuted,
            fontWeight: 500,
          },
        }),
      },
      Textarea: {
        defaultProps: {
          radius: 'sm',
          size: 'md',
        },
        styles: (theme) => ({
          input: {
            fontFamily: typography.fontFamily.body,
            fontSize: '1.05rem',
            lineHeight: 1.9,
            letterSpacing: '0.01em',
            backgroundColor: c.inputBg,
            border: `1px solid ${c.inputBorder}`,
            color: c.ink,
            boxShadow: isDark ? 'inset 0 1px 4px rgba(0, 0, 0, 0.25)' : 'inset 0 1px 3px rgba(122, 92, 52, 0.08)',
            transition: 'border-color 200ms ease, box-shadow 200ms ease',
            '&::placeholder': {
              color: c.inkLight,
            },
            '&:focus': {
              borderColor: c.inputFocusBorder,
              boxShadow: `inset 0 -2px 0 ${c.focus}`,
            },
          },
        }),
      },
      Card: {
        defaultProps: {
          radius: 'sm',
          shadow: 'xs',
          withBorder: true,
        },
        styles: (theme) => ({
          root: {
            backgroundColor: c.cardBg,
            borderColor: c.border,
            transition: 'transform 200ms ease, box-shadow 200ms ease',
          },
        }),
      },
      Paper: {
        defaultProps: {
          radius: 'sm',
          shadow: 'xs',
          withBorder: true,
        },
        styles: (theme) => ({
          root: {
            backgroundColor: c.paper,
            borderColor: c.border,
          },
        }),
      },
      Modal: {
        defaultProps: {
          radius: 'sm',
          overlayProps: { color: isDark ? '#050302' : '#2c2118', opacity: isDark ? 0.8 : 0.5, blur: 1 },
          shadow: 'lg',
          centered: true,
        },
        styles: (theme) => ({
          content: {
            backgroundColor: c.paper,
            border: `1px solid ${c.border}`,
            boxShadow: c.shadowXl,
          },
          header: {
            borderBottom: `1px solid ${c.border}`,
            padding: `${spacing.sm} ${spacing.md}`,
          },
        }),
      },
      Select: {
        defaultProps: {
          radius: 'sm',
          size: 'md',
        },
        styles: (theme) => ({
          input: {
            fontFamily: typography.fontFamily.body,
            backgroundColor: c.inputBg,
            border: `1px solid ${c.inputBorder}`,
            color: c.ink,
            boxShadow: 'none',
            '&:focus': {
              borderColor: c.inputFocusBorder,
              boxShadow: `0 0 0 1px ${c.focus}66`,
            },
          },
          dropdown: {
            backgroundColor: c.paper,
            border: `1px solid ${c.border}`,
            boxShadow: c.shadowLg,
          },
          item: {
            fontFamily: typography.fontFamily.body,
            color: c.ink,
            '&:hover': {
              backgroundColor: c.hoverBg,
            },
            '&[data-selected]': {
              color: c.accent,
              backgroundColor: c.activeBg,
            },
          },
        }),
      },
      Tabs: {
        styles: (theme) => ({
          tab: {
            fontFamily: typography.fontFamily.heading,
            fontSize: '0.95rem',
            color: c.inkMuted,
            fontWeight: 500,
            '&:hover': {
              color: c.ink,
            },
            '&[data-active]': {
              color: c.accent,
            },
          },
          indicator: {
            backgroundColor: c.accent,
          },
        }),
      },
      Badge: {
        styles: (theme) => ({
          root: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: 500,
            letterSpacing: '0.02em',
            border: `1px solid ${c.border}`,
          },
        }),
      },
      Alert: {
        styles: (theme) => ({
          root: {
            borderRadius: borderRadius.md,
            border: `1px solid ${c.border}`,
            backgroundColor: c.cardBg,
            boxShadow: 'none',
          },
          title: {
            fontFamily: typography.fontFamily.heading,
            fontWeight: 600,
          },
        }),
      },
      Tooltip: {
        defaultProps: {
          radius: 'sm',
        },
        styles: (theme) => ({
          tooltip: {
            backgroundColor: c.brown,
            color: isDark ? '#221a0f' : '#faf3e3',
            fontSize: '0.8rem',
          },
          arrow: {
            backgroundColor: c.brown,
          },
        }),
      },
      Divider: {
        defaultProps: {
          color: c.border,
        },
      },
      Loader: {
        defaultProps: {
          color: 'gold',
        },
      },
      Progress: {
        defaultProps: {
          color: 'gold',
        },
      },
    },
  });
};

export const createAppTheme = (resolvedTheme) => getTheme(resolvedTheme);

export { MantineProvider };
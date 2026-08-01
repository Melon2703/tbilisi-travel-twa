/**
 * Tbilisi Travel TWA Design System Tokens
 * Single Source of Truth for colors, typography, 8px grid spacing, and component dimensions.
 */

export const COLORS = {
  // Base Warm Georgian Travel Journal Palette
  terracotta: '#E07A5F',
  terracottaAccent: '#C4572A',
  tbilisiSlate: '#1F2421',
  warmStone: '#FAFAF7',
  neutralBorder: '#E5E5E0',

  // Canvas & Surface Tokens
  canvasBg: '#FAF7F2',
  cardBg: '#FFF8F3',
  tipBoxBg: '#FFF8F3',
  tipBoxBorder: 'rgba(196, 87, 42, 0.18)',
  successAccent: '#228255',
  textPrimary: '#1C1008',
  textSecondary: '#7A6552',

  // Additional Component & Badge Tokens
  badgeBg: '#FAF3E8',
  badgeText: '#8C4A27',
  badgeBorder: '#E8D5C4',
  dishBg: '#FFF8EE',
  dishText: '#4A3828',
  dishBorder: '#E8DCCB',
  actionBorder: '#E8EAF0',
  iconMuted: '#5C4D42',

  // High-Contrast Outdoor Theme Tokens
  outdoor: {
    textPrimary: '#1C1008',
    terracotta: '#C4572A',
    success: '#228255',
    badgeBg: '#1C1008',
    badgeText: '#FFFFFF',
    borderContrast: 'rgba(28, 16, 8, 0.22)',
  },

  // Brand / Third-Party Map Colors
  brand: {
    googleMaps: '#EA4335',
    yandexMaps: '#FC3F1D',
    instagram: '#E4405F',
  },
} as const;

export const TYPOGRAPHY = {
  fonts: {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    display: 'var(--font-display)',
    mono: 'var(--font-mono)',
  },
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  tracking: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    badge: '0.14em',
    cta: '0.18em',
  },
} as const;

/**
 * 8px Grid System Spacing Tokens
 * Base multiplier = 8px
 */
export const SPACING = {
  gridBase: 8,
  steps: {
    0: '0px',
    0.5: '4px',
    1: '8px',
    1.5: '12px',
    2: '16px',
    2.5: '20px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    8: '64px',
  },
} as const;

export const COMPONENT_TOKENS = {
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  cardPadding: '1rem',
  ctaButtonMinHeight: '48px',
  shadows: {
    card: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cardHighlight: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cta: '0 6px 24px rgba(196, 87, 42, 0.35)',
  },
} as const;

export type ColorTokens = typeof COLORS;
export type TypographyTokens = typeof TYPOGRAPHY;
export type SpacingTokens = typeof SPACING;
export type ComponentTokens = typeof COMPONENT_TOKENS;

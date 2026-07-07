/**
 * Typography tokens ported from frontend/shared-ui/tokens/typography.js
 *
 * Sizes are plain numbers (React Native uses unitless dp values).
 * Font family uses system defaults (SF Pro on iOS, Roboto on Android).
 */
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  sizes: {
    display: 48,
    hero: 36,
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    bodySmall: 14,
    caption: 13,
    tiny: 11,
  },

  lineHeights: {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.5,
  },

  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

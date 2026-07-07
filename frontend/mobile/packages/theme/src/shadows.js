import { Platform } from 'react-native';

/**
 * Shadow tokens ported from frontend/shared-ui/tokens/shadows.js
 *
 * React Native uses platform-specific shadow props:
 * - iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * - Android: elevation
 */
export const shadows = {
  soft: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
    },
    android: {
      elevation: 4,
    },
  }),

  softer: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.03,
      shadowRadius: 15,
    },
    android: {
      elevation: 2,
    },
  }),

  floating: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
    },
    android: {
      elevation: 8,
    },
  }),

  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

/**
 * Create an accent shadow using the app's brand color.
 * @param {string} brandColor — hex color
 */
export const createAccentShadow = (brandColor) =>
  Platform.select({
    ios: {
      shadowColor: brandColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
  });

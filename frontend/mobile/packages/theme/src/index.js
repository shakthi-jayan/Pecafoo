import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows, createAccentShadow } from './shadows';

/**
 * Create a complete theme object for an app, branded with a specific color.
 *
 * @param {'customer' | 'restaurant' | 'delivery' | 'admin'} appRole
 * @returns Complete theme object
 */
export const createTheme = (appRole) => {
  const brandColor = colors.brand[appRole];

  return {
    colors: {
      ...colors,
      primary: brandColor,
      primaryLight: `${brandColor}20`, // 12% opacity
      primaryMedium: `${brandColor}40`, // 25% opacity
    },
    typography,
    spacing,
    radius,
    shadows: {
      ...shadows,
      accent: createAccentShadow(brandColor),
    },
  };
};

export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { radius } from './radius';
export { shadows, createAccentShadow } from './shadows';

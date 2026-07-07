const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.' + (process.env.APP_ENV || 'development')) });

module.exports = {
  expo: {
    name: 'Pecafoo Restaurant',
    slug: 'pecafoo-restaurant',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'pecafoo-restaurant',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#F97316' },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pecafoo.restaurant',
      infoPlist: {
        NSCameraUsageDescription: 'Pecafoo Restaurant needs access to your camera for menu items.',
        NSPhotoLibraryUsageDescription: 'Pecafoo Restaurant needs access to your photos for menu items.'
      }
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#F97316' },
      package: 'com.pecafoo.restaurant',
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE']
    },
    plugins: [
      'expo-image-picker',
      'expo-notifications',
      ['@sentry/react-native/expo', { url: 'https://sentry.io/', project: 'pecafoo-restaurant', organization: 'pecafoo' }]
    ],
    updates: { url: 'https://u.expo.dev/YOUR_EAS_PROJECT_ID' },
    runtimeVersion: { policy: 'appVersion' },
    extra: { eas: { projectId: 'YOUR_EAS_PROJECT_ID' } }
  }
};

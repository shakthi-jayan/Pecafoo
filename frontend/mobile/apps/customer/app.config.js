const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.' + (process.env.APP_ENV || 'development')) });

module.exports = {
  expo: {
    name: 'Pecafoo',
    slug: 'pecafoo-customer',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'pecafoo',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#D946EF' },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pecafoo.customer',
      config: { googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY },
      infoPlist: {
        NSCameraUsageDescription: 'Pecafoo needs access to your camera for profile photos.',
        NSPhotoLibraryUsageDescription: 'Pecafoo needs access to your photos for profile pictures.',
        NSLocationWhenInUseUsageDescription: 'Pecafoo needs your location to find restaurants near you.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'Pecafoo needs your location to find restaurants near you.'
      }
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#D946EF' },
      package: 'com.pecafoo.customer',
      config: { googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY } },
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION']
    },
    plugins: [
      'expo-location',
      'expo-notifications',
      ['@sentry/react-native/expo', { url: 'https://sentry.io/', project: 'pecafoo-customer', organization: 'pecafoo' }]
    ],
    updates: {
      url: 'https://u.expo.dev/YOUR_EAS_PROJECT_ID'
    },
    runtimeVersion: { policy: 'appVersion' },
    extra: { eas: { projectId: 'YOUR_EAS_PROJECT_ID' } }
  }
};

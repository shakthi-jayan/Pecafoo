const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.' + (process.env.APP_ENV || 'development')) });

module.exports = {
  expo: {
    name: 'Pecafoo Admin',
    slug: 'pecafoo-admin',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'pecafoo-admin',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#0EA5E9' },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pecafoo.admin'
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#0EA5E9' },
      package: 'com.pecafoo.admin',
      permissions: []
    },
    plugins: [
      'expo-notifications',
      ['@sentry/react-native/expo', { url: 'https://sentry.io/', project: 'pecafoo-admin', organization: 'pecafoo' }]
    ],
    updates: { url: 'https://u.expo.dev/YOUR_EAS_PROJECT_ID' },
    runtimeVersion: { policy: 'appVersion' },
    extra: { eas: { projectId: 'YOUR_EAS_PROJECT_ID' } }
  }
};

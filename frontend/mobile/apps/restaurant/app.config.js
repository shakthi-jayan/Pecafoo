require('dotenv').config({ path: `.env.${process.env.APP_ENV || 'development'}` });

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
    extra: {
      eas: {
        projectId: "f1f2aad6-924b-4972-8839-a681227c7cbf"
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pecafoo.restaurant',
      infoPlist: {
        NSCameraUsageDescription: 'Pecafoo Restaurant needs access to your camera for menu items.',
        NSPhotoLibraryUsageDescription: 'Pecafoo Restaurant needs access to your photo gallery for menu items.'
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_IOS
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#F97316' },
      package: 'com.pecafoo.restaurant',
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'RECEIVE_BOOT_COMPLETED'],
      googleServicesFile: process.env.GOOGLE_SERVICES_ANDROID
    },
    plugins: [
      'expo-image-picker',
      'expo-notifications',
      ['@sentry/react-native/expo', { url: 'https://sentry.io/', project: 'pecafoo-restaurant', organization: 'pecafoo' }]
    ],
    runtimeVersion: '1.0.0'
  }
};

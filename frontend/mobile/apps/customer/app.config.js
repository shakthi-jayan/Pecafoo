require('dotenv').config({ path: `.env.${process.env.APP_ENV || 'development'}` });

module.exports = {
  expo: {
    name: 'Pecafoo Customer',
    slug: 'pecafoo-customer',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'pecafoo',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#D946EF' },
    extra: {
  eas: {
    projectId: "db7a2d0a-7121-4040-9a25-c949853d2e92"
  }
},
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pecafoo.customer',
      config: { googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY },
      infoPlist: {
        NSCameraUsageDescription: 'Pecafoo needs access to your camera for profile photos.',
        NSPhotoLibraryUsageDescription: 'Pecafoo needs access to your photo gallery for profile pictures.',
        NSLocationWhenInUseUsageDescription: 'Pecafoo needs your location to find restaurants near you.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'Pecafoo needs your location to find restaurants near you.'
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_IOS
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#D946EF' },
      package: 'com.pecafoo.customer',
      config: { googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY } },
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'RECEIVE_BOOT_COMPLETED'],
      googleServicesFile: process.env.GOOGLE_SERVICES_ANDROID
    },
    plugins: [
      'expo-location',
      'expo-notifications',
      ['@sentry/react-native/expo', { url: 'https://sentry.io/', project: 'pecafoo-customer', organization: 'pecafoo' }]
    ],
    runtimeVersion: '1.0.0'
  }
};

require('dotenv').config({ path: `.env.${process.env.APP_ENV || 'development'}` });

module.exports = {
  expo: {
    name: 'Pecafoo Delivery',
    slug: 'pecafoo-delivery',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'pecafoo-delivery',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#22C55E' },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.pecafoo.delivery',
      config: { googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY },
      infoPlist: {
        NSLocationAlwaysAndWhenInUseUsageDescription: 'Pecafoo needs your location to navigate deliveries.',
        NSLocationWhenInUseUsageDescription: 'Pecafoo needs your location for delivery navigation.',
        UIBackgroundModes: ['location', 'fetch', 'remote-notification']
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_IOS || './GoogleService-Info.plist'
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#22C55E' },
      package: 'com.pecafoo.delivery',
      config: { googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY } },
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION', 'FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_LOCATION', 'RECEIVE_BOOT_COMPLETED'],
      googleServicesFile: process.env.GOOGLE_SERVICES_ANDROID || './google-services.json'
    },
    plugins: [
      ['expo-location', { locationAlwaysAndWhenInUsePermission: 'Pecafoo needs your location to navigate deliveries.' }],
      'expo-notifications',
      ['@sentry/react-native/expo', { url: 'https://sentry.io/', project: 'pecafoo-delivery', organization: 'pecafoo' }]
    ],
    updates: {
      url: 'https://u.expo.dev/YOUR_DELIVERY_PROJECT_ID'
    },
    runtimeVersion: '1.0.0',
    extra: {
      eas: { projectId: 'YOUR_DELIVERY_PROJECT_ID' }
    }
  }
};

# Environment Management

The Pecafoo mobile monorepo centralizes environment variables to prevent duplication across the four apps.

## The `.env` Files

We maintain three primary environment files at the root of `frontend/mobile/`:
- `.env.development`: Used for local development (points to local IP).
- `.env.staging`: Used for the `preview` and `staging` build profiles.
- `.env.production`: Used for the `production` build profile.

## Dynamic App Config

The `app.config.js` in each app uses `dotenv` to load the appropriate environment file based on the `APP_ENV` variable provided by EAS build profiles in `eas.json`.

```javascript
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../.env.' + (process.env.APP_ENV || 'development')) 
});
```

## Required Variables

- `EXPO_PUBLIC_API_URL`: The base URL for the Django backend.
- `EXPO_PUBLIC_GOOGLE_MAPS_KEY`: API key for Google Maps SDK.
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`: OAuth client ID for Expo Auth Session.
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`: Used for push notifications.
- `EXPO_PUBLIC_SENTRY_DSN`: The Sentry Data Source Name for crash reporting.

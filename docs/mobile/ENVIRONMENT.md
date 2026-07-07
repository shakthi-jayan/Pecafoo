# Pecafoo Mobile - Environment Management

Each of the four applications manages its own environment variables independently. 

## Expected Variables
Every app must have the following variables defined in their `.env.*` files:
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_GOOGLE_MAPS_KEY`
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_SENTRY_DSN`

## Dynamic Loading
The `app.config.js` in each app looks for the current environment using:
```javascript
require('dotenv').config({ path: `.env.${process.env.APP_ENV || 'development'}` });
```
When EAS builds the app with the `preview` profile, it automatically sets `APP_ENV=preview`, forcing the app to load `.env.preview`.

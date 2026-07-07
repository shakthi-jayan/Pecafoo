# Pecafoo Mobile - OTA Updates

Over-The-Air (OTA) updates are powered by `expo-updates`. This allows us to push critical JavaScript and asset bugfixes directly to users without App Store review.

## Architecture
Every app uses an independent `runtimeVersion` (e.g., `1.0.0`) and has its own `update` URL configured in `app.config.js`.
The `eas.json` ties build profiles to specific update **channels**:
- `development` -> development channel
- `preview` -> preview channel
- `production` -> production channel

## Pushing an Update
To send an update to production users of the Customer app:
```bash
cd frontend/mobile/apps/customer
eas update --branch production --message "Fix checkout crash"
```
Users will download the update seamlessly upon next launch.

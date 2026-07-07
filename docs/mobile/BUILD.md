# Pecafoo Mobile - Build Guide

We use EAS (Expo Application Services) to handle cloud builds for the 4 applications.

## Initializing Projects
Before building an app for the first time, you must link it to an Expo project:
```bash
cd frontend/mobile/apps/customer
eas init
```
This generates a `projectId` which must be placed inside `app.config.js`.

## Build Profiles
Each app's `eas.json` contains three build profiles:
- `development`: Used for debugging with custom native code.
- `preview`: Internal testing distribution.
- `production`: AAB/APK and IPA builds for Google Play and App Store.

## Manual Build
To manually trigger a build:
```bash
cd apps/customer
eas build --platform android --profile production
```

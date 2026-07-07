# Deployment & Release

We use Expo Application Services (EAS) and GitHub Actions for continuous integration and deployment.

## Build Profiles

Our `eas.json` defines four build profiles:
1. `development`: Used for local development clients.
2. `preview`: Points to the staging backend, distributed internally via Expo.
3. `staging`: Points to the staging backend, built for App Store / Play Store test tracks.
4. `production`: Points to the production backend (`https://api.pecafoo.com`), built for final release.

## CI/CD Pipeline

Builds are automated via GitHub Actions (`.github/workflows/mobile-build.yml`). 
When code is merged to the `main` branch, the pipeline will:
1. Install dependencies.
2. Authenticate with EAS using the `EXPO_TOKEN` secret.
3. Run `eas build --platform all --profile production` for all 4 apps.

## OTA Updates (Over-The-Air)

We use `expo-updates` to push JavaScript and asset updates without requiring a new App Store review. 
To publish an OTA update to production:
```bash
eas update --branch production --message "Fix login bug"
```

## Crash Reporting

`@sentry/react-native` is configured in all production apps. Crashes and unhandled promise rejections are automatically uploaded to the Sentry dashboard, mapped to the correct source code using sourcemaps generated during the EAS build process.

# Pecafoo Mobile - Deployment Guide

The deployment pipeline relies on 4 independent GitHub Actions workflows.

## Workflows
- `.github/workflows/customer-build.yml`
- `.github/workflows/restaurant-build.yml`
- `.github/workflows/delivery-build.yml`
- `.github/workflows/admin-build.yml`

## Triggers
These workflows trigger whenever a push to `main` occurs that modifies code inside:
- `frontend/mobile/packages/**` (Shared code)
- `frontend/mobile/apps/<app-name>/**` (App specific code)

## Process
The GitHub action performs the following checks:
1. `npm ci --legacy-peer-deps`
2. `npx expo doctor`
3. Type Check & Lint
4. Cloud Build (`eas build --profile production`)

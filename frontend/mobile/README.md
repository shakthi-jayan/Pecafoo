# Pecafoo Mobile Monorepo

Welcome to the Pecafoo React Native Mobile Monorepo. This workspace contains the four mobile applications corresponding to the different user roles on the Pecafoo platform, built with React Native and Expo.

## Workspace Structure

The project uses npm workspaces to share core logic and UI components across all applications:

- `packages/` - Shared business logic, UI components, themes, API clients, and auth providers.
- `apps/` - The four standalone Expo applications (Customer, Restaurant, Delivery, Admin).

## Documentation Index

Please refer to the following documentation files for detailed information:

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Learn about the monorepo structure and shared packages.
- [SETUP.md](./SETUP.md) - Instructions for setting up the local development environment.
- [ENVIRONMENT.md](./ENVIRONMENT.md) - Details on how `.env` files are used and configured.
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guides on building and releasing via EAS and GitHub Actions.
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guidelines for contributing code to the mobile workspace.

## Quick Start

1. Install dependencies: `npm install`
2. Configure `.env.development` (see `ENVIRONMENT.md`).
3. Start the Customer app: `npm --workspace apps/customer run start`

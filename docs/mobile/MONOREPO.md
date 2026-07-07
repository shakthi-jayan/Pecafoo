# Pecafoo Mobile - Monorepo Design

The mobile workspace is structured to balance shared logic with strict app independence.

## Independent Apps
Each app in `apps/` is a completely isolated Expo project. This ensures:
- App-specific versioning (`eas.json`).
- Isolated Apple/Google bundle identifiers.
- Specific permissions (e.g., only the Delivery app asks for Background Location).

## Shared Packages
The `packages/` directory uses `npm workspaces`. Code here is resolved via symlinks.
- `packages/api`: Django Axios client.
- `packages/auth`: Auth logic and JWT management.
- `packages/ui`: Branded components.
- `packages/theme`: Tokens.
- `packages/storage`: AsyncStorage wrapper.
- `packages/utils`: Shared constants and helpers.

**Rule:** Never duplicate code across `apps/`. If it is used by more than one app, extract it to `packages/`.

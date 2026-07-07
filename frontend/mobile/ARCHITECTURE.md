# Mobile Architecture

The Pecafoo mobile ecosystem uses an npm workspace monorepo. This allows us to maintain four distinct React Native applications while sharing 90% of the underlying infrastructure.

## Shared Packages (`packages/`)

1. **`@pecafoo/api`**: Configures the Axios client with JWT interceptors. Handles seamless token refresh and `multipart/form-data` uploads.
2. **`@pecafoo/auth`**: A React Context provider that mirrors the web Auth flow. Manages login state, roles, and deep integrates with Expo Auth Session (Google OAuth).
3. **`@pecafoo/theme`**: Contains numeric design tokens for colors, typography, spacing, radius, and shadows.
4. **`@pecafoo/ui`**: A library of presentational React Native components (Button, Card, Input) styled purely with `@pecafoo/theme`.
5. **`@pecafoo/storage`**: An abstraction over `AsyncStorage` used by auth and API packages.
6. **`@pecafoo/utils`**: Formatting and validation helpers.

## Apps (`apps/`)

Each app imports the shared packages and only contains routing, screens, and app-specific services:

- **Customer** (`apps/customer`): Browse restaurants, order food. (Brand: `#D946EF`)
- **Restaurant** (`apps/restaurant`): Manage menus, accept orders. (Brand: `#F97316`)
- **Delivery** (`apps/delivery`): Accept deliveries, route navigation. (Brand: `#22C55E`)
- **Admin** (`apps/admin`): System monitoring, verifications. (Brand: `#0EA5E9`)

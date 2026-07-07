# Contributing to Pecafoo Mobile

We welcome contributions to the Pecafoo mobile applications! Please read these guidelines before making changes.

## Development Workflow

1. Create a feature branch from `main`: `git checkout -b feature/your-feature-name`
2. **Shared Packages First**: If your feature involves a new UI component, API endpoint, or utility function, build it in the appropriate `@pecafoo/*` package under `packages/` rather than directly in the app.
3. Test your changes locally (see `SETUP.md`).
4. Commit using standard conventional commits (e.g., `feat(customer): add wishlist screen`).
5. Open a Pull Request for review.

## Code Style

- Use Prettier and ESLint (configured at the workspace root).
- Ensure all new components are styled using `@pecafoo/theme` tokens (never hardcode hex colors or spacing values).
- Follow the React Navigation layered architecture (AuthStack -> RoleStack -> MainTabs).

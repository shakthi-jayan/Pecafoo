# Pecafoo — Production Readiness Audit & Plan

> Last updated: 2026-03-30
> Scope: Backend (Django) + 4 Frontend Apps (Customer, Restaurant, Admin, Delivery)

---

## Executive Summary

The Pecafoo platform has a solid foundation: Django REST backend with JWT auth, PostgreSQL, Redis/Celery, WebSocket order tracking, Cloudinary media storage, and four React (Vite) frontends. However, multiple critical gaps still prevent it from functioning as a deployable SaaS product.

This document captures the current production-readiness audit and the phased execution plan so it lives inside the project repository and can be tracked alongside the codebase.

---

## Scoring Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done / Production-ready |
| ⚠️ | Partially done / Needs improvement |
| ❌ | Missing / Broken / Blocking |

---

## 1. Backend Architecture

| Area | Status | Detail |
|------|--------|--------|
| Controller layer (Views) | ✅ | All apps have proper DRF views |
| Service layer | ⚠️ | Only `orders`, `delivery`, and `locations` have `services.py`; `accounts`, `restaurants`, `customers` have logic in views |
| Repository/Data access layer | ❌ | No dedicated repository pattern; queries are scattered in views/services |
| Request validation | ⚠️ | Serializers exist but not all endpoints have tight validation |
| Centralized error handling | ⚠️ | `api_exception_handler.py` only catches `OperationalError`; broader exception handling is still needed |
| API Standards (versioning) | ❌ | No API versioning (`/api/v1/`) |
| Rate limiting | ✅ | Throttle classes configured |
| API documentation | ✅ | DRF Spectacular with Swagger/ReDoc |

### Action Items

1. Extract service layers for `accounts`, `restaurants`, and `customers`.
2. Add API versioning with `/api/v1/`.
3. Expand exception handling for `ValidationError`, `NotFound`, `PermissionDenied`, and generic unhandled exceptions.
4. Add `/api/health/` endpoint and keep it wired to deployment health checks.

> CAUTION
> The Docker health check depends on `/api/health/`. If that endpoint is missing or broken, orchestration will treat the backend as unhealthy.

---

## 2. Database & Caching

| Area | Status | Detail |
|------|--------|--------|
| PostgreSQL connection | ✅ | Properly configured with env vars |
| DB indexes | ✅ | Composite indexes exist on `Order` |
| Migrations management | ✅ | Django migrations are in place |
| CACHES config conflict | ❌ | Active settings need one clear cache strategy |
| Redis cache usage in views | ❌ | Hot endpoints are not actually cached |
| Cache invalidation | ❌ | No invalidation logic yet |
| Connection pooling | ⚠️ | Production tuning still required |
| Query optimization | ⚠️ | `select_related` and `prefetch_related` are inconsistent |

### Action Items

1. Keep one cache config with explicit Redis and a fallback strategy.
2. Add caching to hot endpoints:
   - `GET /api/restaurants/`
   - `GET /api/restaurants/<slug>/`
   - `GET /api/analytics/dashboard/`
   - `GET /api/notifications/unread-count/`
3. Set `CONN_MAX_AGE=600` for production.
4. Standardize queryset optimization across all list/detail views.

---

## 3. Authentication & Security

| Area | Status | Detail |
|------|--------|--------|
| JWT access + refresh tokens | ✅ | SimpleJWT configured |
| Secure password hashing | ✅ | Django defaults |
| Role-based authorization | ✅ | Role permissions exist |
| CORS | ⚠️ | Production origins need env-based configuration |
| Input sanitization | ⚠️ | Serializer validation exists, but stronger sanitization is still needed |
| CSRF protection | ⚠️ | Needs clarity for JWT-driven APIs |
| Security headers | ❌ | Production security middleware settings need completion |
| Admin registration open | ❌ | Must be restricted |
| Secrets exposure | ⚠️ | Cleanup and rotation still required |
| Token in WebSocket URL | ⚠️ | Query-param JWT should be replaced |

### Action Items

1. Block open admin registration and require invite/admin-controlled creation.
2. Add production security headers in settings.
3. Add env-based CORS production origins.
4. Remove machine-specific secret files from version control.
5. Replace query-param WebSocket auth with ticket-based auth.

> CAUTION
> Admin self-registration is a critical security issue and should be treated as a blocking production fix.

---

## 4. Frontend Production Standards

### 4A. Customer App

| Area | Status | Detail |
|------|--------|--------|
| Loading states | ⚠️ | Inconsistent across pages |
| Error states | ❌ | Silent failures still exist |
| Retry handling | ⚠️ | Partial |
| Protected routes | ✅ | In place |
| Environment config | ✅ | `VITE_API_BASE_URL` supported |
| Token refresh | ✅ | Interceptor exists |
| Hardcoded promo content | ❌ | Should come from backend |
| Hardcoded categories | ❌ | Should come from backend |
| Cart persistence | ✅ | Implemented |
| WebSocket tracking | ✅ | Implemented |
| Notifications page | ⚠️ | Needs verification and polish |

### 4B. Restaurant App

| Area | Status | Detail |
|------|--------|--------|
| Dashboard | ⚠️ | Needs richer live data |
| Orders management | ⚠️ | Functional but still minimal |
| Menu CRUD | ✅ | Implemented |
| Settings page | ✅ | Implemented |
| WebSocket for new orders | ✅ | Present |
| Loading/error states | ⚠️ | Inconsistent |
| Real-time order alerts | ⚠️ | Needs verification and hardening |

### 4C. Admin App

| Area | Status | Detail |
|------|--------|--------|
| Dashboard stats | ❌ | Needs live analytics wiring |
| Users management | ✅ | Present |
| Restaurants list | ✅ | Present |
| Verifications | ✅ | Present |
| Pricing panel | ✅ | Present |
| Orders management | ✅ | Present |
| Analytics charts | ❌ | Missing |
| Audit logging | ❌ | Missing |
| User detail view | ❌ | Missing |
| Restaurant detail view | ❌ | Missing |

### 4D. Delivery App

| Area | Status | Detail |
|------|--------|--------|
| Home page | ✅ | Present |
| Deliveries page | ✅ | Present |
| Earnings page | ⚠️ | Functional but needs polish |
| Profile page | ✅ | Present |
| Order accept/decline | ✅ | Present |
| Real-time location | ⚠️ | Background tracking still missing |
| No WebSocket for incoming orders | ❌ | Polling still used |
| Map navigation | ⚠️ | Basic integration only |

---

## 5. Performance

| Area | Status | Detail |
|------|--------|--------|
| Lazy loading / code splitting | ❌ | Needs `React.lazy()` and `Suspense` |
| API response caching | ❌ | No frontend query cache layer |
| Bundle optimization | ❌ | Bundle analysis and dependency trimming needed |
| Image optimization | ⚠️ | Storage exists, delivery optimization needs improvement |
| Pagination | ⚠️ | Backend pagination exists; frontend UX incomplete |
| WebSocket reconnection | ❌ | Auto-reconnect missing |

### Action Items

1. Add lazy loading for routes and heavy pages.
2. Introduce React Query or SWR.
3. Add pagination or infinite scroll UI where needed.
4. Implement WebSocket reconnect with backoff.
5. Reduce bundle size and tighten icon imports.
6. Add native image lazy loading and optimize delivery formats.

---

## 6. Logging & Monitoring

| Area | Status | Detail |
|------|--------|--------|
| Structured logging | ❌ | Missing in active settings |
| Log files | ⚠️ | Directories exist, configuration needs to drive them |
| Request logging | ❌ | Middleware not present |
| Error tracking | ❌ | No Sentry or equivalent |
| Frontend error boundaries | ❌ | Missing |
| Metrics/APM | ❌ | Missing |

### Action Items

1. Add `LOGGING` config to active settings.
2. Add request logging middleware with duration/status.
3. Add React error boundaries to all four frontend apps.
4. Add Sentry for backend and frontend.
5. Add startup health logs for DB, Redis, and Celery.

---

## 7. DevOps & Deployment

| Area | Status | Detail |
|------|--------|--------|
| Docker backend | ✅ | Present |
| docker-compose | ✅ | Present |
| Frontend Dockerfiles | ❌ | Missing |
| Frontend in docker-compose | ❌ | Missing |
| Production build scripts | ❌ | Missing |
| Environment separation | ❌ | Missing |
| CI/CD pipeline | ❌ | Missing |
| Nginx/reverse proxy | ❌ | Missing |
| `.gitignore` hygiene | ⚠️ | Needs verification across apps |
| Static file serving | ❌ | Needs production solution |

### Action Items

1. Add Dockerfiles for all frontend apps.
2. Add Nginx reverse proxy for SSL/static/API/websocket routing.
3. Create development, staging, and production env templates.
4. Add CI/CD pipeline.
5. Add frontend containers to compose or deployment config.
6. Add `whitenoise` or another static strategy for Django admin/static assets.

---

## 8. Code Quality & Cleanup

| Area | Status | Detail |
|------|--------|--------|
| Dead files | ❌ | Machine-specific duplicate artifacts exist |
| Fix scripts in root | ❌ | Temporary root scripts still present |
| Test files | ❌ | Near-zero automated coverage |
| Type checking | ❌ | No strong frontend type layer |
| Linting | ❌ | Missing standard lint/format setup |
| Clean folder structure | ⚠️ | Mostly good, but inconsistent service layering |
| Unused imports/code | ⚠️ | Needs cleanup pass |

### Cleanup Targets

- Root fix scripts:
  - `fix_deliv.py`
  - `fix_eye.py`
  - `fix_motion.py`
  - `fix_sticky.py`
  - `fix_tabs.py`
- Machine-specific duplicate files with `-DESKTOP-41NPRMU`

> CAUTION
> These duplicate files create confusion and increase the chance of stale code being edited or deployed by mistake.

---

## 9. Payment Integration

| Area | Status | Detail |
|------|--------|--------|
| Razorpay config | ⚠️ | Config exists but flow is incomplete |
| Stripe config | ⚠️ | Config exists but flow is incomplete |
| Payment flow | ❌ | Initiation, verification, and webhooks are missing |
| Refund handling | ❌ | Missing |
| Wallet system | ❌ | Declared in model choices but not implemented |

### Action Items

1. Implement full Razorpay flow.
2. Add Stripe webhook handling if Stripe remains supported.
3. Create payment initiation, verification, and refund views.
4. Implement or remove wallet support.
5. Add payment SDKs to requirements and deployment docs.

---

## 10. Real-time Features

| Area | Status | Detail |
|------|--------|--------|
| Order tracking WebSocket | ✅ | Present |
| Delivery location broadcast | ✅ | Present |
| Restaurant new order push | ⚠️ | Needs restaurant-wide group support |
| Delivery new order push | ❌ | Needs zone-based push instead of polling |
| Notification push (Firebase) | ⚠️ | Needs verification and completion |
| Chat support | ❌ | Missing |

### Action Items

1. Add restaurant-wide new order WebSocket groups.
2. Add delivery-zone push for nearby order opportunities.
3. Verify FCM push end to end.
4. Add WebSocket auto-reconnect across apps.

---

## 11. Testing

| Area | Status | Detail |
|------|--------|--------|
| Backend unit tests | ❌ | Missing |
| Backend integration tests | ❌ | Missing |
| API endpoint tests | ❌ | Missing |
| Frontend unit tests | ❌ | Missing |
| E2E tests | ❌ | Missing |
| Load testing | ❌ | Missing |

### Action Items

1. Add backend API tests for auth, order creation, and status flows.
2. Add model tests for order number generation, OTP generation, and earnings logic.
3. Add permission tests.
4. Add frontend tests for critical auth/cart flows.
5. Add `pytest` and `pytest-django`.

---

## 12. Missing Feature Gaps Per App

### Customer App

- Promotions/coupons system
- Dynamic categories API
- Order cancellation
- Quick reorder/repeat order
- Forgot password
- Email/phone verification
- 404 route
- Payment method selection in checkout
- Delivery tracking map hardening
- Push notifications

### Restaurant App

- Dashboard with real stats
- Order history filters
- Revenue analytics
- Operating hours management improvements
- Inventory/stock tooling
- Reviews management

### Admin App

- Dashboard connected to analytics API
- Analytics charts
- User detail and management tools
- Restaurant detail CRUD
- Promotion management
- Support/ticketing
- Global system settings
- Audit logging

### Delivery App

- Background location tracking
- Push notifications for new orders
- Better navigation integration
- Goal/incentive progress UX
- Support/help page
- Document re-upload flow

---

## Priority Execution Order

### Phase 1: Critical Fixes (Week 1-2)

1. Create `/api/health/`
2. Fix cache configuration conflicts
3. Block open admin registration
4. Wire admin dashboard to live data
5. Add active logging config
6. Delete machine-specific duplicate files
7. Add React error boundaries
8. Add 404 routes to all apps
9. Add forgot password flow

### Phase 2: Production Hardening (Week 3-4)

10. Add Redis caching to hot endpoints
11. Add route-level lazy loading
12. Add payment integration
13. Add production security headers
14. Add frontend Dockerfiles and Nginx config
15. Add WebSocket reconnect
16. Add `.env.production` templates
17. Add request/response logging middleware

### Phase 3: Feature Completion (Week 5-6)

18. Promotions/coupons system
19. Dynamic categories API
20. Order cancellation
21. Restaurant dashboard with real stats
22. Admin analytics with charts
23. Delivery push notifications
24. Delivery new-order WebSocket push

### Phase 4: Quality & Polish (Week 7-8)

25. Backend API tests
26. Frontend error/retry UI pass
27. Image lazy loading and WebP optimization
28. ESLint/Prettier configs
29. Frontend query/data caching
30. CI/CD pipeline
31. Load testing

---

## Current Pain Points

### App-Breaking Issues

1. Docker health check failure risk
2. Admin dashboard not fully wired
3. Payment flow incomplete
4. Admin registration security gap

### User Experience Gaps

5. Silent API failure states
6. Full-bundle app loading on mobile
7. WebSocket drops without reconnect
8. Missing forgot password flow
9. Delivery partners still rely on polling

### Technical Debt

10. Duplicate machine-specific files
11. Missing automated test coverage
12. Missing active logging strategy
13. Weak environment separation
14. Temporary root fix scripts still present

---

## Implementation Notes

- This file is a roadmap and audit baseline, not proof that all items are implemented.
- Work should be tracked against these phases incrementally and checked off in follow-up updates.
- Any production rollout should start with Phase 1 before broader feature work continues.

# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  React Frontend (Vite + TypeScript)                             │
│  C:\Users\rais7\IdeaProjects\splitbliz-react-web               │
│  localhost:5173                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / Bearer JWT
                         │ X-Request-Id (UUID), Idempotency-Key (POST)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Spring Boot 4 Backend (Java 21 + Gradle)                       │
│  C:\Users\rais7\Downloads\splitbliz\splitbliz\splitbliz-backend │
│  localhost:8080/v1                                               │
│                                                                  │
│  Filters (ordered):                                              │
│    RequestIdFilter → RateLimitFilter → JwtAuthFilter            │
│                                                                  │
│  BFF Layer (api/bff/):                                           │
│    HomeController  ─── HomeAggregatorService                    │
│    GroupDetailController ── GroupDetailAggregatorService        │
└────────┬──────────────────────────────────────────┬────────────┘
         │ JDBC / JdbcTemplate                       │ Redis
         ▼                                           ▼
┌─────────────────────┐                  ┌──────────────────────┐
│  MySQL (splitbliz)  │                  │  Redis (cache)        │
│  Liquibase managed  │                  │  Group snapshots      │
└─────────────────────┘                  └──────────────────────┘
         │
         │  Also integrates:
         ├─ Firebase Admin (push notifications)
         ├─ MinIO (receipt file storage)
         ├─ MQTT broker (real-time hints to frontend)
         └─ External AI API (ai.back4app.xyz)
```

## Frontend → Backend Communication

- Base URL: `VITE_API_BASE_URL` (default `http://localhost:8080/v1`)
- Axios client: `src/services/apiClient.ts`
- Every request gets `Authorization: Bearer <jwt>` from `sessionStorage['sb_access_token']`
- Every request gets `X-Request-Id: <uuid>`
- POST /expenses and POST /settlements require `Idempotency-Key` header (use `generateIdempotencyKey()`)
- 401 response → clear token + redirect to `/login`
- Error shape from backend: `{ error: { code, message, action, details } }`
- MQTT subscription via `VITE_MQTT_URL` (wss) for real-time group hint events

## Backend Layer Structure (per domain module)

Each domain under `com.splitbliz.<domain>/` follows the same vertical slice:

```
presentation/          ← @RestController, request mapping, auth extraction
  dto/                 ← Record-based request/response DTOs
application/           ← @Service, business logic, orchestration
domain/                ← Plain Java objects/records, Repository interfaces
infra/                 ← Repository implementations (JdbcTemplate), adapters
```

Domain modules: `identity`, `group`, `ledger`, `treasury`, `engagement`,
`notification`, `activity`, `ai`, `aiinsights`, `worker`

Cross-cutting: `api/` (BFF controllers, filters, security config, global exception handler),
`core/` (ports: `CacheInvalidator`, `MqttPublisher`; `AppError` enum)

## Database Schema (Liquibase, MySQL)

Migrations in `src/main/resources/db/changelog/<domain>/`, applied in this order:

| Domain     | Key Tables                                                        |
|------------|-------------------------------------------------------------------|
| identity   | users, auth_providers, refresh_tokens, refresh_token_blocklist, system_config |
| group      | groups, group_members, group_invites                              |
| ledger     | expenses, expense_payments, expense_splits, balance_snapshots     |
| treasury   | settlements                                                       |
| engagement | messages, whiteboard entries                                      |
| notification | notifications                                                   |
| ai/aiinsights | ai_insights                                                    |
| activity   | activity events                                                   |
| outbox     | outbox (transactional outbox pattern)                             |

## Authentication & Authorization Flow

1. Client POSTs `/v1/auth/login` (or `/auth/register`, `/auth/google`) → receives `{ accessToken, refreshToken }`
2. Frontend stores `accessToken` in `sessionStorage['sb_access_token']`
3. `JwtAuthFilter` (Order 2) validates Bearer token on every protected request
4. JWT claims include: `sub` (userId), `planTier`, `status`
5. Suspended / PENDING_DELETE accounts are rejected with 403 even with a valid token
6. `AuthenticatedUser(userId, planTier, status)` is set as `request.getAttribute("authenticatedUser")`
7. Access token expiry: 3600s; refresh token expiry: 30 days
8. Public endpoints (no auth): `/system/config`, `/auth/*`, `/actuator/health`, `/actuator/prometheus`

## Key Integrations

| Service   | Config key(s)                       | Purpose                           |
|-----------|-------------------------------------|-----------------------------------|
| Firebase  | `VITE_FIREBASE_*` (frontend)        | Remote config gate, push notifications (backend: Firebase Admin) |
| MinIO     | `MINIO_*`                           | Receipt image storage             |
| MQTT      | `MQTT_*` / `VITE_MQTT_URL`          | Real-time group hint events       |
| Redis     | `REDIS_HOST/PORT/PASSWORD`          | Group snapshot cache invalidation |
| AI        | `AI_BASE_URL`, `AI_API_KEY`         | Group expense AI insights         |
| Google OAuth | `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` | Social login               |

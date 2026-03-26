# Conventions

## Backend (Java / Spring Boot)

### Package Naming
`com.splitbliz.<domain>.<layer>` — e.g. `com.splitbliz.ledger.application`

### Spring Boot Patterns
- Controllers use constructor injection (no `@Autowired`)
- `AuthenticatedUser` is extracted from `request.getAttribute("authenticatedUser")` — never from Spring Security principal directly
- `@ConditionalOnProperty` guards optional features (e.g. email-password auth)
- `@RestController` + `@RequestMapping` at class level; HTTP method annotations on methods
- Update operations use `@PatchMapping`, not `@PutMapping`
- Successful create → `ResponseEntity.status(HttpStatus.CREATED).body(...)`
- Successful delete → `ResponseEntity.ok(Map.of("success", true))`

### DTO vs Domain
- DTOs are Java `record` types in `presentation/dto/`
- Domain objects are plain Java classes/records in `domain/`
- No JPA/Hibernate — all DB access via Spring `JdbcTemplate` in `infra/`
- Repository interfaces in `domain/`, JDBC implementations in `infra/`

### API Endpoint Naming
- Nested resource pattern: `/groups/{groupId}/expenses/{expenseId}`
- Verb-like actions as sub-paths: `/auth/checkEmail`, `/auth/refresh`
- All IDs are strings (UUIDs)
- Pagination uses cursor-based pattern: `?cursor=<value>&limit=<n>`

### Error Handling
- All errors go through `GlobalExceptionHandler` in `api/`
- Error response: `{ error: { code, message, action, details } }`
- Error codes defined in `AppError` enum in `core/`

### After Mutating State (expenses, settlements)
Always call both after writes:
```java
cacheInvalidator.invalidateGroupSnapshot(groupId);
mqttPublisher.publishHint("splitbliz/groups/" + groupId + "/hints", HintUtil.hint(...));
```

### Database
- Monetary amounts stored as `DECIMAL` — never `FLOAT`/`DOUBLE`
- All primary keys are UUID strings
- Liquibase migrations: one file per table, named `NNN-create-<domain>-<table>.yaml`
- Add new migrations in the appropriate `db/changelog/<domain>/` subfolder

## Frontend (React / TypeScript)

### Component Conventions
- Feature components in `src/features/<domain>/`
- Large page components are split into sub-components in `src/features/<domain>/components/`
- Shared primitives (shadcn/ui) in `src/components/ui/`
- Global shared components in `src/components/`

### Styling
- Tailwind CSS v4 utility classes — no inline styles, no CSS modules
- Colors from `src/constants/colors.ts` only — never hardcode hex/rgb values
- `cn()` from `src/utils/cn.ts` for conditional class merging
- `cva()` (class-variance-authority) for component variants
- Dark mode: use Tailwind `dark:` prefix; theme class set on `<html>` by `ThemeProvider`

### Data & Types
- All monetary values are `string` type — never `number`
- Domain types and enums live in `src/types/index.ts` — add new types there
- Path alias `@/` maps to `src/`

### API Calls
- Never import `axios` directly in components or hooks — use service functions from `src/services/`
- Use `extractApiError()` from `apiClient.ts` in catch blocks
- Idempotency key required on expense and settlement POSTs — use `generateIdempotencyKey()`

### State
- No global state library — local hook state + service calls in `useEffect`
- Custom hooks in `src/hooks/` encapsulate all data fetching logic

### Forms
- React Hook Form for all form state and validation

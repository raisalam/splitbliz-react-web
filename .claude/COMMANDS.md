# Commands

## Frontend (splitbliz-react-web)

```bash
pnpm install          # Install dependencies
pnpm dev              # Start Vite dev server (localhost:5173)
pnpm build            # Production build → dist/
```

No test or lint scripts configured in package.json.

## Backend (splitbliz-backend)

The backend uses **Gradle** (Kotlin DSL), not Maven. `.env` is auto-loaded into `bootRun`.

```bash
# From: C:\Users\rais7\Downloads\splitbliz\splitbliz\splitbliz-backend

./gradlew bootRun                  # Start Spring Boot (reads .env automatically)
./gradlew build                    # Compile + test + package JAR
./gradlew test                     # Run all tests (JUnit 5 + ArchUnit)
./gradlew jar                      # Build JAR only (skip tests)

# Windows (if gradlew fails):
gradlew.bat bootRun
gradlew.bat build
```

Backend runs on `http://localhost:8080`, context path `/v1`.

## Database Migrations (Liquibase)

Migrations run automatically on `bootRun`/`bootJar`. To run manually:

```bash
./gradlew update          # Apply pending migrations
./gradlew rollback        # Roll back last migration
```

Migration files: `src/main/resources/db/changelog/<domain>/`

## Monitoring (when running)

```
GET http://localhost:8080/actuator/health      # App health
GET http://localhost:8080/actuator/prometheus  # Prometheus metrics
```

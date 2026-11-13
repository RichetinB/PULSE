# PULSE API

The API is an optional online service foundation. Desktop replay import and
analysis remain local and do not require this API.

## Local development

Requires Node.js 22+, pnpm 9.15.5, and Docker Compose.

From `apps/api`:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace the sample password with a local random password made
of URL-safe characters. Use that same value in `POSTGRES_PASSWORD` and
`DATABASE_URL`; `.env` is ignored by Git.

To run both services in containers:

```powershell
corepack pnpm install
docker compose up --build
```

The API is available at `http://localhost:3000/api/health`. PostgreSQL is
published only on `127.0.0.1:54329`; it is not exposed on a public interface.
The named database volume is retained by `docker compose down`.

To run NestJS on the host while keeping PostgreSQL in Docker:

```powershell
docker compose up -d postgres
corepack pnpm install
corepack pnpm start:dev
```

## Checks

```powershell
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm build
```

`GET /api/health` runs `SELECT 1` through the TypeORM PostgreSQL connection. A
database failure returns HTTP 503 with a non-sensitive unavailable status.
Database schema changes are intentionally not synchronized automatically;
entities and versioned migrations should be added with the first persisted
domain feature.

Future clients will use versioned HTTP/JSON endpoints. A browser client must
call the API from an origin listed in `CORS_ORIGINS`; a desktop client may use
the API only for explicitly online features. Local replay parsing and analysis
must remain available without an account or API connection. No account,
replay-upload, or synchronization endpoints exist yet.

## Structure

- `src/config`: environment validation and exact-origin CORS parsing.
- `src/database`: PostgreSQL connection setup through TypeORM.
- `src/health`: health endpoint and database readiness check.
- `test`: HTTP-level tests using a mocked database connection.
- `compose.yaml`: local API and PostgreSQL services.

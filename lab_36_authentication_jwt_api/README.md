# JWT Authentication Lab

A minimal but complete example of JWT-based authentication: an Express/TypeScript API backed by
Postgres, and a React client that logs in, refreshes tokens, and visualizes the whole auth
lifecycle. Full architecture/design rationale lives in [`docs/PLAN.md`](docs/PLAN.md).

## Stack
- API: Node.js, TypeScript, Express, Zod (validation), jsonwebtoken, bcryptjs
- DB: PostgreSQL (via Docker Compose, schema/seed SQL auto-loaded on first start)
- Client: React + TypeScript (Vite)
- Tests: Mocha + Supertest (integration tests for the auth endpoints)

## Prerequisites
- Node.js 18+
- Docker + Docker Compose

## 1. Start Postgres

```bash
docker compose up -d
```

This starts a Postgres container and automatically runs `db/init/001_schema.sql` (creates
`users` and `refresh_tokens` tables) and `db/init/002_seed.sql` (inserts a demo user) on first
boot, via Postgres's `docker-entrypoint-initdb.d` mechanism.

## 2. Start the API server

```bash
cp .env.example .env   # adjust if needed — defaults match docker-compose.yml
npm install
npm run dev
```

The API listens on `http://localhost:4000`.

## 3. Start the React client

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and talks to the API at `http://localhost:4000`.

## 4. Log in with the dummy user

A demo account is seeded automatically:

- **Email:** `demo@example.com`
- **Password:** `Demo1234!`

The login page pre-fills these credentials — just click "Log in". You can also use "Sign up" to
create a new account (new accounts are not auto-logged-in; you're sent to `/login` afterward).

## Running tests

```bash
npm run test
```

Runs Mocha/Supertest integration tests against the auth endpoints (signup validation, duplicate
email, login success/failure, protected-route access with/without a token). Requires Postgres to
be running (`docker compose up -d`).

## Understanding the JWT flow (what to watch in the UI)

Once logged in, the dashboard page (`/`) is a protected route that renders dummy data plus three
panels that make the whole token lifecycle visible:

1. **JWT Inspector** — decodes your current access token in the browser and shows its claims
   (`sub`, `role`, `iat`, `exp`) with a live countdown to expiration. The access token is short-lived
   (15 minutes by default — see `JWT_ACCESS_TTL`).
2. **Auth Event Timeline** — a client-side log of what's happened: login, refresh attempts,
   expiry, logout.
3. **Server Log Viewer** — polls a dev-only `GET /auth/debug/logs` endpoint so you can see the
   *server's* view of the same events (login attempts, token issuance, refresh, revocation)
   side-by-side with the client's view.

Click **"Force refresh token"** on the dashboard to manually trigger `/auth/refresh` and watch a
new access token get issued (the old refresh token is revoked and a new one is rotated in). If a
refresh ever fails (e.g. the refresh token was revoked or expired), a modal explains the session
expired and you're redirected to `/login`.

Every async action (signup, login, refresh, loading dashboard data) shows a loading indicator
while in flight and a success/error message or modal when it settles — nothing fails silently.

## Environment variables (`.env`)

See `.env.example` for the full list: server port, Postgres connection details, JWT secrets/TTLs
for access and refresh tokens, and the allowed client origin for CORS.

## Project layout

```
lab_36_authentication_jwt_api/
├── docs/PLAN.md          # architecture plan and design rationale
├── src/                  # Express API (config, db, auth module, middleware)
├── test/                 # Mocha + Supertest integration tests
├── db/init/               # SQL run automatically by the Postgres container
├── client/                # React + TypeScript client
└── docker-compose.yml
```

# JWT Authentication — Architecture Plan

## 1. Goal

Provide a stateless authentication mechanism for the Express/TypeScript API using JSON Web Tokens (JWT), covering signup, login, protected routes, token refresh, and logout.

## 2. JWT Mechanism Overview

- **Access Token**: short-lived (e.g. 15 min), signed JWT sent to the client after login, included in `Authorization: Bearer <token>` header on subsequent requests.
- **Refresh Token**: long-lived (e.g. 7 days), used to obtain a new access token without re-authenticating. Stored server-side (DB) so it can be revoked, and delivered to the client as an `httpOnly`, `Secure`, `SameSite=Strict` cookie.
- **Signing**: HMAC (HS256) with a secret from environment config, or RS256 with a key pair if multiple services must verify tokens independently.
- **Claims**: `sub` (user id), `role`, `iat`, `exp`, `jti` (token id, used for refresh-token revocation lookups).

## 3. Request Flow

### Signup

1. Client `POST /auth/signup` with email/password.
2. Zod schema validates payload.
3. Password hashed with `bcrypt` (or `argon2`).
4. User row inserted (Postgres).
5. Response: 201, no token (force explicit login) — or auto-login, per product decision.

### Login

1. Client `POST /auth/login` with email/password.
2. Zod validates payload shape.
3. Look up user, compare password hash.
4. On success: issue access token (JWT, signed, short TTL) + refresh token (random opaque or JWT, long TTL).
5. Persist refresh token record (`user_id`, `token_hash`, `expires_at`, `revoked_at`) in DB (MySQL or Postgres table `refresh_tokens`).
6. Return access token in JSON body; set refresh token as `httpOnly` cookie.

### Authenticated Request

1. Client sends `Authorization: Bearer <accessToken>`.
2. `authenticate` middleware verifies signature + expiry using the JWT secret/public key.
3. On success, attaches `req.user = { id, role }` and calls `next()`.
4. On failure (expired/invalid), returns 401.

### Token Refresh

1. Client `POST /auth/refresh` with the refresh-token cookie.
2. Server looks up the stored refresh token by hash, checks `revoked_at`/`expires_at`.
3. If valid: issue a new access token (and optionally rotate the refresh token — invalidate old, issue new, mitigates replay).
4. If invalid/expired/reused: 401, force re-login.

### Logout

1. Client `POST /auth/logout`.
2. Server marks the refresh token row `revoked_at = now()`, clears the cookie.

## 4. Component Architecture

```
lab_36_authentication_jwt_api/
├── src/
│   ├── config/
│   │   └── env.ts                # loads/validates env vars (JWT secrets, TTLs) via Zod
│   ├── db/
│   │   ├── connection.ts         # Postgres/MySQL pool
│   │   └── migrations/           # users, refresh_tokens tables
│   ├── modules/auth/
│   │   ├── auth.schemas.ts       # Zod schemas: signup, login, refresh
│   │   ├── auth.service.ts       # hashing, token issuance/verification, refresh rotation
│   │   ├── auth.controller.ts    # route handlers, calls service, maps to HTTP responses
│   │   └── auth.routes.ts        # POST /auth/signup, /login, /refresh, /logout
│   ├── middleware/
│   │   ├── authenticate.ts       # verifies access token, populates req.user
│   │   ├── authorize.ts          # role/permission checks
│   │   └── validate.ts           # generic Zod-body/query validation middleware
│   ├── users/
│   │   ├── user.repository.ts
│   │   └── user.types.ts
│   └── app.ts / server.ts
├── test/
│   └── auth.integration.test.ts  # Mocha + Supertest integration tests for the endpoints
├── .env.example
└── package.json
```

## 5. Security Considerations

- Passwords hashed with bcrypt/argon2, never stored/logged in plaintext.
- Access token kept out of storage (memory only) on the client to reduce XSS exposure; refresh token in `httpOnly` cookie to reduce theft via JS.
- Refresh token rotation + revocation table to detect reuse (possible token theft).
- Rate limiting on `/auth/login` and `/auth/refresh` to slow brute force.
- All secrets/config loaded from environment variables and validated at startup with Zod (fail fast on misconfiguration).
- CORS restricted to known origins; cookies flagged `Secure` in production.

## 6. Testing Strategy

- Mocha + Supertest integration tests per endpoint: signup validation errors, duplicate email, login success/failure, protected route with/without valid token, refresh rotation, logout revocation.
- Unit tests for token signing/verification helpers and password hashing.

## 7. Decisions

- Store the secret in environment variable
- Refresh token will be stored in postgres db
- No auto login, after sign up move the user to the login page

## 8. Client Application (React)

A separate React + TypeScript single-page app that consumes the auth API.

### Pages / Routes

- `/signup` — signup form (email, password, confirm password), Zod-validated client-side, posts to `/auth/signup`, redirects to `/login` on success.
- `/login` — login form, posts to `/auth/login`, stores access token in memory (React state/context, not localStorage), redirects to `/`.
- `/` (protected main page) — accessible only when authenticated; renders **dummy data** (e.g. a static list/table of items) to simulate a real authenticated dashboard.
- Route guard component (`RequireAuth`) redirects unauthenticated users to `/login`.

### Client Architecture ( project structure )

```
client/
├── src/
│   ├── api/
│   │   └── authClient.ts        # axios/fetch wrapper, attaches Authorization header, handles 401 → refresh
│   ├── context/
│   │   └── AuthContext.tsx      # holds access token + user in memory, exposes login/signup/logout
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── DashboardPage.tsx    # protected main page with dummy data
│   ├── components/
│   │   ├── RequireAuth.tsx
│   │   ├── JwtInspectorPanel.tsx    # decodes & displays the current JWT (header/payload/exp countdown)
│   │   └── AuthEventLog.tsx         # client-side timeline of auth events (login, refresh, expiry, logout)
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

### UX Feedback — Modals, Messages & Loaders

Every async operation in the client (signup, login, refresh, logout, dummy-data fetch) must give clear, immediate feedback:

- **Loading indicators**: a spinner/disabled-state on the triggering button (and a skeleton/loader on the dashboard while dummy data or auth state is resolving) for the duration of every API call — no silent waits.
- **Success feedback**: a toast/message on success (e.g. "Account created — please log in", "Login successful").
- **Error feedback**: a modal or inline error message on failure, with the server's error text (e.g. invalid credentials, validation errors from Zod, duplicate email, expired/invalid refresh token) — never a raw unhandled exception.
- **Session/expiry modal**: when the access token expires and silent refresh fails, show a modal explaining the session expired, then redirect to `/login`.
- Centralize this behavior (e.g. a `useAsync`/`useApiCall` hook or shared `AsyncButton` component wrapping loading/error/success state) so every API call — not just auth — consistently gets a loader and a message/modal without duplicating logic per component.

### "Explain the auth" UI (educational layer)

Since this lab is about understanding JWT auth, the protected dashboard page includes a visible panel, not just the dummy data:

- **JWT Inspector**: decodes the current access token client-side (header + payload, without verifying signature) and displays claims (`sub`, `role`, `iat`, `exp`) with a live countdown to expiration.
- **Auth Event Timeline**: a running log in the UI of what's happening — "Login successful, access token issued (expires in 15m)", "Access token expired, refreshing…", "Refresh succeeded, new access token issued", "Refresh token invalid, logging out".
- **Server Log Viewer** (optional, dev-only): a panel that polls a `GET /auth/debug/logs` dev-only endpoint on the server, showing recent server-side auth events (login attempts, token issuance, refresh, revocation) with timestamps — makes the full client↔server token lifecycle visible in one place.

## 9. Local Infrastructure — Docker Compose + Postgres

### `docker-compose.yml` (at project root)

- Single service: `postgres` (official `postgres` image), with:
  - Env vars for `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
  - Volume mount for data persistence.
  - Volume mount of `./db/init` into `/docker-entrypoint-initdb.d` so SQL scripts run automatically on first container start.
  - Exposed port (e.g. `5432:5432`).

### `db/init/001_schema.sql`

- Creates `users` table (`id`, `email` unique, `password_hash`, `role`, `created_at`).
- Creates `refresh_tokens` table (`id`, `user_id` FK, `token_hash`, `expires_at`, `revoked_at`, `created_at`).

### `db/init/002_seed.sql`

- Inserts one dummy user with a pre-hashed known password (e.g. `demo@example.com` / `Demo1234!`) so the README can document a ready-to-use login without requiring signup first.

## 10. README.md (project root)

Documents:

- Project overview and architecture diagram (link back to this plan).
- Prerequisites (Node version, Docker).
- **Run steps**: `docker compose up -d` (starts Postgres + auto-loads schema/seed SQL), `npm install && npm run dev` (server), `cd client && npm install && npm run dev` (React client).
- **Dummy login credentials**: the seeded demo user's email/password, so a reviewer can log in immediately without signing up.
- How to run tests (`npm run test`).
- Explanation of the JWT flow with a short walkthrough of what to observe in the UI (JWT Inspector, Auth Event Timeline) when logging in, waiting for expiry, and refreshing.
- Environment variables reference (`.env.example` contents explained).

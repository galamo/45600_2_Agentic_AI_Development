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

## 11. Password Reset Flow

### 11.1 Goal

Let a user who forgot their password regain access without an admin, using a short-lived, single-use reset token — following the same "hash-and-store, opaque-token-to-client" pattern already used for refresh tokens.

### 11.2 Mechanism

- **Reset token**: random opaque token (`crypto.randomBytes(32).toString("hex")`), never a JWT — it must be invalidated after one use, which opaque server-side lookups handle more simply than stateless JWTs.
- Only the SHA-256 hash of the token is stored (`hashToken`, already defined in `auth.service.ts` — reuse it).
- TTL: short, e.g. 30 minutes.
- Single-use: marked `used_at` on consumption; a second attempt with the same token is rejected.
- No real mailer exists in this project. Following the existing dev-only pattern (`GET /auth/debug/logs`), the reset link/token is written via `logAuthEvent` (so it shows up in `AuthEventLog`/`ServerLogViewer` in the client) instead of actually emailing anything. This is a deliberate lab trade-off, not a production pattern — call it out in the README.

### 11.3 DB Schema — `db/init/003_password_reset.sql`

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```

New migration file (not edits to `001_schema.sql`) since Postgres only re-runs `/docker-entrypoint-initdb.d` on a fresh volume — mirrors how `002_seed.sql` was added as its own file.

### 11.4 Request Flow

**Forgot password**
1. Client `POST /auth/forgot-password` with `{ email }`.
2. Zod validates shape (`forgotPasswordSchema`).
3. Service looks up the user. Whether or not the user exists, respond `202` with the same generic message ("If that email exists, a reset link was sent") — prevents user enumeration via response differences.
4. If the user exists: generate token, persist hash + `expires_at`, log the raw token/link via `logAuthEvent("password_reset_requested", ...)`.

**Reset password**
1. Client `POST /auth/reset-password` with `{ token, newPassword }`.
2. Zod validates shape (`resetPasswordSchema`, same password rules as signup — min 8 chars).
3. Service hashes the token, looks up the row; rejects (400) if missing, expired, or already `used_at`.
4. On success: `bcrypt.hash` the new password, update `users.password_hash`, mark the token row `used_at = now()`.
5. Revoke all existing refresh tokens for that user (`UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`) so a stolen session can't survive a password reset.
6. Log `password_reset_success`.

### 11.5 Component Changes

```
src/
├── db/init/003_password_reset.sql        # new
├── modules/auth/
│   ├── auth.schemas.ts     # + forgotPasswordSchema, resetPasswordSchema
│   ├── auth.service.ts     # + requestPasswordReset(email), resetPassword(token, newPassword)
│   ├── auth.controller.ts  # + forgotPasswordHandler, resetPasswordHandler
│   └── auth.routes.ts      # + POST /forgot-password, POST /reset-password
└── users/
    └── user.repository.ts  # + updateUserPassword(userId, passwordHash)
```

Client:

```
client/src/
├── api/authClient.ts       # + apiForgotPassword(email), apiResetPassword(token, newPassword)
└── pages/
    ├── ForgotPasswordPage.tsx  # email form, posts /auth/forgot-password, generic success message
    └── ResetPasswordPage.tsx   # reads ?token= from URL, new-password form, posts /auth/reset-password, redirects to /login
```

Add `/forgot-password` and `/reset-password` routes in `App.tsx`, and a "Forgot password?" link on `LoginPage.tsx`. Both pages follow the existing loading/success/error UX pattern (`useAsync`, toasts/inline errors) already used by `LoginPage`/`SignupPage`.

### 11.6 Security Considerations

- Generic response on `forgot-password` regardless of account existence (enumeration protection) — the dev-only event log is the one intentional leak, scoped to local dev.
- Token hashed at rest, single-use, short TTL, scoped to one user.
- New password re-hashed with bcrypt (cost 10, matching `signup`).
- All refresh tokens revoked on successful reset to kill existing sessions.
- Consider rate-limiting `/auth/forgot-password` alongside the existing login/refresh rate-limiting item in §5.

### 11.7 Testing Strategy

Mocha + Supertest additions to `test/auth.integration.test.ts` (or a new `test/password-reset.integration.test.ts`):
- `forgot-password` returns 202 for both existing and non-existing email (no enumeration).
- `reset-password` rejects invalid/expired/already-used token (400).
- `reset-password` with a valid token updates the password, and the old password no longer works on `/auth/login`.
- Login with the new password succeeds after reset.
- Existing refresh token is rejected after a password reset.

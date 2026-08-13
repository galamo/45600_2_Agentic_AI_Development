# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A JWT authentication lab: an Express/TypeScript API backed by Postgres, plus a React (Vite) client
that exercises the full auth lifecycle (signup, login, protected routes, refresh rotation, logout,
password reset) and visualizes it in the UI. Design rationale and full request-flow spec live in
`docs/PLAN.md` — read it before implementing new auth-related behavior; it documents decisions
(e.g. why refresh tokens are DB-stored opaque values, why access tokens live in memory only, why
password reset uses an opaque token instead of a JWT) that aren't obvious from the code alone.

## Commands

Server (run from repo root):
- `npm run dev` — run the API in dev mode (`ts-node-dev`, auto-restart), listens on port 4000
- `npm run build` — compile TypeScript to `dist/`
- `npm run start` — run the compiled server (`dist/server.js`)
- `npm run test` — run Mocha/Supertest integration tests (`test/**/*.test.ts`); **requires Postgres
  running** (`docker compose up -d`)
- `npx mocha -r ts-node/register test/auth.integration.test.ts --timeout 20000` — run a single test file
- `docker compose up -d` — start Postgres; auto-runs `db/init/001_schema.sql` and
  `db/init/002_seed.sql` via `docker-entrypoint-initdb.d` **on first container start only** (new SQL
  files added later need a fresh volume or manual `psql` run to take effect on an existing DB)

Client (run from `client/`):
- `npm run dev` — Vite dev server on port 5173, talks to the API at `http://localhost:4000`

## Environment

Copy `.env.example` to `.env` before running the server; values there match `docker-compose.yml`
defaults. Env vars are loaded and validated with Zod at startup in `src/config/env.ts` (fails fast
on misconfiguration) — add new env vars there, not by reading `process.env` directly elsewhere.

## Architecture

**Request flow**: `src/server.ts` → `src/app.ts` (Express app, middleware wiring) →
`src/modules/auth/auth.routes.ts` → `validateBody` (Zod, `src/middleware/validate.ts`) →
`auth.controller.ts` (HTTP mapping) → `auth.service.ts` (business logic: hashing, token
issuance/verification, refresh rotation) → `src/users/user.repository.ts` (Postgres queries).

**Module layout convention** (`src/modules/auth/`): each feature module splits into
`*.schemas.ts` (Zod), `*.service.ts` (logic), `*.controller.ts` (route handlers), `*.routes.ts`
(wiring) — follow this split for any new module rather than putting logic in controllers.

**Two-token model**:
- Access token: short-lived signed JWT (`JWT_ACCESS_SECRET`, TTL `JWT_ACCESS_TTL`), sent in
  `Authorization: Bearer` header, verified per-request by `src/middleware/authenticate.ts` which
  populates `req.user`. Client keeps it in memory only (React context, never localStorage) to
  limit XSS exposure.
- Refresh token: opaque random value (not a JWT), long-lived (`JWT_REFRESH_TTL_DAYS`), delivered as
  an `httpOnly` cookie, stored **hashed** in the `refresh_tokens` Postgres table so it can be
  revoked. `/auth/refresh` rotates it (old row revoked, new one issued) to mitigate replay.
- Password reset follows the same opaque-token-hashed-in-DB pattern (`password_reset_tokens` table)
  rather than a JWT, since it must be invalidated after single use.

**DB schema lives in `db/init/*.sql`**, not `src/db/migrations` (that directory is currently
empty/unused). New schema changes go in a new numbered file under `db/init/` (mirroring how
`002_seed.sql` was added alongside `001_schema.sql`), since Postgres only replays
`docker-entrypoint-initdb.d` on a fresh volume.

**Dev-only debug endpoint**: `GET /auth/debug/logs` exposes recent server-side auth events
(login attempts, token issuance, refresh, revocation) purely so the client's `ServerLogViewer`
component can display them side-by-side with the client-side `AuthEventLog` — this is an
intentional lab-only transparency feature, not something to replicate in production code.

**Client structure** (`client/src/`): `api/authClient.ts` wraps fetch calls and handles 401 →
refresh; `context/AuthContext.tsx` holds the access token/user in memory and exposes
login/signup/logout; `components/RequireAuth.tsx` guards protected routes; every async action
(signup, login, refresh, dashboard load) goes through the shared `useAsync` hook so loading/error/
success UI stays consistent instead of being reimplemented per component.

## Rules (from project-level CLAUDE.md, apply here too)

- TypeScript everywhere, never `any`.
- Zod for all input validation.
- Every new Express endpoint needs a Mocha integration test in `test/`.

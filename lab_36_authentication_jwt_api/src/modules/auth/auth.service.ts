import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { pool } from "../../db/connection";
import { createUser, findUserByEmail, findUserById } from "../../users/user.repository";
import { PublicUser, User, toPublicUser } from "../../users/user.types";

export interface AuthEvent {
  type: string;
  message: string;
  at: string;
}

const authEvents: AuthEvent[] = [];

export function logAuthEvent(type: string, message: string): void {
  const event: AuthEvent = { type, message, at: new Date().toISOString() };
  authEvents.unshift(event);
  authEvents.length = Math.min(authEvents.length, 50);
  // eslint-disable-next-line no-console
  console.log(`[auth] ${event.at} ${type}: ${message}`);
}

export function getRecentAuthEvents(): AuthEvent[] {
  return authEvents;
}

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

export function signAccessToken(user: User): string {
  return jwt.sign({ sub: user.id, role: user.role } as AccessTokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function persistRefreshToken(userId: string, rawToken: string): Promise<void> {
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, hashToken(rawToken), expiresAt]
  );
}

function issueRawRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export async function signup(email: string, password: string): Promise<PublicUser> {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(email, passwordHash);
  logAuthEvent("signup", `New account created for ${email}`);
  return toPublicUser(user);
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await findUserByEmail(email);
  if (!user) {
    logAuthEvent("login_failed", `Login failed for ${email}: no such user`);
    throw new Error("INVALID_CREDENTIALS");
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    logAuthEvent("login_failed", `Login failed for ${email}: bad password`);
    throw new Error("INVALID_CREDENTIALS");
  }
  const accessToken = signAccessToken(user);
  const refreshToken = issueRawRefreshToken();
  await persistRefreshToken(user.id, refreshToken);
  logAuthEvent("login_success", `${email} logged in, access token issued (ttl ${env.JWT_ACCESS_TTL})`);
  return { accessToken, refreshToken, user: toPublicUser(user) };
}

export async function refresh(rawToken: string): Promise<LoginResult> {
  const tokenHash = hashToken(rawToken);
  const result = await pool.query<{
    id: string;
    user_id: string;
    expires_at: Date;
    revoked_at: Date | null;
  }>(
    `SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash]
  );
  const row = result.rows[0];
  if (!row || row.revoked_at || row.expires_at < new Date()) {
    logAuthEvent("refresh_failed", "Refresh token invalid, expired, or revoked");
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [row.id]);

  const user = await findUserById(row.user_id);
  if (!user) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const accessToken = signAccessToken(user);
  const newRefreshToken = issueRawRefreshToken();
  await persistRefreshToken(user.id, newRefreshToken);
  logAuthEvent("refresh_success", `Access token refreshed for ${user.email} (rotated refresh token)`);
  return { accessToken, refreshToken: newRefreshToken, user: toPublicUser(user) };
}

export async function logout(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1`, [tokenHash]);
  logAuthEvent("logout", "Refresh token revoked, user logged out");
}

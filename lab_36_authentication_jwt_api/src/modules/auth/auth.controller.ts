import { Request, Response } from "express";
import { env } from "../../config/env";
import * as authService from "./auth.service";
import { LoginInput, SignupInput } from "./auth.schemas";

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function signupHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as SignupInput;
  try {
    const user = await authService.signup(email, password);
    res.status(201).json({ user });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    res.status(500).json({ error: "Signup failed" });
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;
  try {
    const result = await authService.login(email, password);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ accessToken: result.accessToken, user: result.user });
  } catch {
    res.status(401).json({ error: "Invalid email or password" });
  }
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    res.status(401).json({ error: "No refresh token" });
    return;
  }
  try {
    const result = await authService.refresh(token);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ accessToken: result.accessToken, user: result.user });
  } catch {
    res.clearCookie(REFRESH_COOKIE);
    res.status(401).json({ error: "Refresh token invalid or expired" });
  }
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await authService.logout(token);
  }
  res.clearCookie(REFRESH_COOKIE);
  res.status(204).send();
}

export function debugLogsHandler(_req: Request, res: Response): void {
  res.status(200).json({ events: authService.getRecentAuthEvents() });
}

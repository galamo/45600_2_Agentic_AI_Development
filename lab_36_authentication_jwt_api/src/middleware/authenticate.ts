import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../modules/auth/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired access token" });
  }
}

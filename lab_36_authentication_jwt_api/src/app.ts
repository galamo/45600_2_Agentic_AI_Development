import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express, Response } from "express";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { authenticate, AuthenticatedRequest } from "./middleware/authenticate";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res: Response) => res.status(200).json({ status: "ok" }));

  app.use("/auth", authRouter);

  app.get("/api/dashboard", authenticate, (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({
      message: `Welcome, user ${req.user?.id}`,
      items: [
        { id: 1, name: "Dummy widget A" },
        { id: 2, name: "Dummy widget B" },
        { id: 3, name: "Dummy widget C" },
      ],
    });
  });

  return app;
}

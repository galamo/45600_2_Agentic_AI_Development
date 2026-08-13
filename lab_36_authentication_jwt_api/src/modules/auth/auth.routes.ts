import { Router } from "express";
import { validateBody } from "../../middleware/validate";
import { loginSchema, signupSchema } from "./auth.schemas";
import {
  debugLogsHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  signupHandler,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), signupHandler);
authRouter.post("/login", validateBody(loginSchema), loginHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/logout", logoutHandler);
authRouter.get("/debug/logs", debugLogsHandler);

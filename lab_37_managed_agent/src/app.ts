import express, { Express, Request, Response } from "express";
import { askInputSchema } from "./validation";
import { askAgent as defaultAskAgent } from "./services/agentService";

export type AskAgentFn = (message: string) => Promise<string>;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Agent request failed";
}

/**
 * Builds the Express app. `askAgentFn` is injectable so tests can stub the
 * Managed Agent call instead of making real network requests.
 */
export function createApp(askAgentFn: AskAgentFn = defaultAskAgent): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/ask", async (req: Request, res: Response) => {
    const parsed = askInputSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      return;
    }

    try {
      const answer = await askAgentFn(parsed.data.message);
      res.status(200).json({ answer });
    } catch (err) {
      res.status(502).json({ error: errorMessage(err) });
    }
  });

  app.post("/ask", async (req: Request, res: Response) => {
    const parsed = askInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues.map((issue) => issue.message).join(", ") });
      return;
    }

    try {
      const answer = await askAgentFn(parsed.data.message);
      res.status(200).json({ answer });
    } catch (err) {
      res.status(502).json({ error: errorMessage(err) });
    }
  });

  return app;
}

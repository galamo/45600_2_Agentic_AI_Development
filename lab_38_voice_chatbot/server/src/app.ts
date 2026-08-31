import cors from "cors";
import express, { Express, Request, Response } from "express";
import { runChatVoiceGraph, type ChatVoiceResult } from "./graph/chat-voice-graph";
import { chatInputSchema } from "./validation";
import { logger } from "./lib/logger";

export type ChatHandlerFn = (message: string) => Promise<ChatVoiceResult>;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Chat request failed";
}

export function createApp(chatHandler: ChatHandlerFn = runChatVoiceGraph): Express {
  const app = express();

  app.use(cors({ origin: "http://localhost:5173" }));
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.post("/api/chat", async (req: Request, res: Response) => {
    const parsed = chatInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues.map((issue) => issue.message).join(", "),
      });
      return;
    }

    try {
      logger.info("POST /api/chat", { messageLength: parsed.data.message.length });
      const result = await chatHandler(parsed.data.message);
      res.status(200).json(result);
    } catch (err) {
      logger.error("POST /api/chat failed", { error: errorMessage(err) });
      res.status(502).json({ error: errorMessage(err) });
    }
  });

  return app;
}

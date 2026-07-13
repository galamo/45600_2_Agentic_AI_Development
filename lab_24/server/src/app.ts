import cors from "cors";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import meetingsRoutes from "./routes/meetings.routes.js";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: "http://localhost:5173" }));
  app.use(express.json());
  app.use("/api", meetingsRoutes);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  });

  return app;
}

import express, { type Express } from "express";

export function createApp(): Express {
  const app = express();

  app.get("/", (_req, res) => {
    res.json({ message: "Hello, World!" });
  });

  return app;
}

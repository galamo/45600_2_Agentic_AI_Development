import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/", (_req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.get("/styles.css", (_req, res) => {
  res.type("text/css");
  res.sendFile(path.join(rootDir, "styles.css"));
});

app.use((_req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  logger.info("Login page server started", { port: PORT, url: `http://localhost:${PORT}` });
});

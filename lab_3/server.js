import "dotenv/config";
import express from "express";
import { runStoryTeller, validateStoryRequest } from "./storyTeller.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "32kb" }));

app.get("/healthcheck", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/story", async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY?.trim()) {
    res.status(503).json({ error: "Missing API KEY - OPENROUTER_API_KEY" });
    return;
  }

  let input;
  try {
    input = validateStoryRequest(req.body);
  } catch (err) {
    res.status(400).json({ error: err?.message || String(err) });
    return;
  }

  try {
    const result = await runStoryTeller(input);
    res.json(result);
  } catch (err) {
    const message = err?.message || String(err);
    res.status(500).json({ error: message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`Story teller API listening on http://localhost:${port}`);
  console.log(`POST /api/story — launch the kids story agent`);
});

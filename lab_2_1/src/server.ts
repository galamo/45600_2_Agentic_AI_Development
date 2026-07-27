import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import { logger } from "./lib/logger.js";
import { runKidsStory } from "./story-agent.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());
app.use(
  "/generated-images",
  express.static(path.join(process.cwd(), "generated-images"))
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Kids Story Agent API is running" });
});

app.post("/api/story", async (req, res) => {
  try {
    const { subject, generateImage, systemPrompt } = req.body ?? {};

    if (typeof subject !== "string" || !subject.trim()) {
      res.status(400).json({
        success: false,
        error: "subject is required (string, max 80 characters)",
      });
      return;
    }

    logger.info("Story request received", {
      subjectLength: subject.trim().length,
      generateImage: Boolean(generateImage),
    });

    const { story, imagePath, modelId } = await runKidsStory({
      subject,
      generateImage: Boolean(generateImage),
      systemPrompt: typeof systemPrompt === "string" ? systemPrompt : "",
    });

    const imageUrl = imagePath ? `/${imagePath}` : null;

    logger.info("Story generated", {
      modelId,
      hasImage: Boolean(imagePath),
    });

    res.json({
      success: true,
      story,
      imagePath,
      imageUrl,
      modelId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Story request failed", { error: message });

    const status = message.includes("too long") || message.includes("provide a story")
      ? 400
      : 500;

    res.status(status).json({
      success: false,
      error: message,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  logger.info("Kids Story Agent API started", {
    port: PORT,
    health: `http://localhost:${PORT}/api/health`,
    story: `http://localhost:${PORT}/api/story`,
  });
});

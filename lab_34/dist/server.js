// Code SDK EXAMPLE - Claude, Anthropic
import "dotenv/config";
import express from "express";
import { askWebAgent } from "./agent.js";
import { logger } from "./lib/logger.js";
const app = express();
const PORT = Number(process.env.PORT) || 3400;
app.use(express.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "lab-34-web-agent" });
});
/**
 * POST /ask
 * body: { "question": "What is the weather in Tel Aviv today?" }
 */
app.post("/ask", async (req, res) => {
    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
    if (!question) {
        res.status(400).json({ error: 'Missing "question" string in JSON body' });
        return;
    }
    try {
        const answer = await askWebAgent(question);
        console.log("agent answer is:");
        console.log(answer);
        res.json({ question, answer });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Ask endpoint failed", { error: message, question });
        res.status(500).json({ error: message });
    }
});
app.listen(PORT, () => {
    logger.info("Web agent API started", {
        port: PORT,
        url: `http://localhost:${PORT}`,
        endpoints: ["GET /health", "POST /ask"],
    });
});

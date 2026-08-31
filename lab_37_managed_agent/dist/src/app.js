"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const validation_1 = require("./validation");
const agentService_1 = require("./services/agentService");
function errorMessage(err) {
    return err instanceof Error ? err.message : "Agent request failed";
}
/**
 * Builds the Express app. `askAgentFn` is injectable so tests can stub the
 * Managed Agent call instead of making real network requests.
 */
function createApp(askAgentFn = agentService_1.askAgent) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });
    app.get("/ask", async (req, res) => {
        const parsed = validation_1.askInputSchema.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues.map((issue) => issue.message).join(", ") });
            return;
        }
        try {
            const answer = await askAgentFn(parsed.data.message);
            res.status(200).json({ answer });
        }
        catch (err) {
            res.status(502).json({ error: errorMessage(err) });
        }
    });
    app.post("/ask", async (req, res) => {
        const parsed = validation_1.askInputSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues.map((issue) => issue.message).join(", ") });
            return;
        }
        try {
            const answer = await askAgentFn(parsed.data.message);
            res.status(200).json({ answer });
        }
        catch (err) {
            res.status(502).json({ error: errorMessage(err) });
        }
    });
    return app;
}

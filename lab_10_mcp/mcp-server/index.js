/**
 * Lab 10 Quiz MCP server — Streamable HTTP transport.
 * Exposes quiz tools (list_topics, get_question, check_answer) and a start_quiz prompt.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createQuizMcpServer } from "./create-quiz-server.js";

const app = express();
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,DELETE,OPTIONS",
    exposedHeaders: ["mcp-session-id", "last-event-id", "mcp-protocol-version"],
  })
);
app.use(express.json());

const transports = new Map();

app.post("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"];

    if (sessionId && transports.has(sessionId)) {
      const transport = transports.get(sessionId);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    if (sessionId) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Invalid or unknown session ID" },
        id: req.body?.id ?? null,
      });
      return;
    }

    const server = createQuizMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports.set(sid, transport);
      },
    });

    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid) transports.delete(sid);
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP POST error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: err.message || "Internal server error" },
        id: req.body?.id ?? null,
      });
    }
  }
});

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Missing or invalid session ID" },
      id: null,
    });
    return;
  }
  await transports.get(sessionId).handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || !transports.has(sessionId)) {
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Missing or invalid session ID" },
      id: null,
    });
    return;
  }
  await transports.get(sessionId).handleRequest(req, res);
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "quiz-mcp" }));

const PORT = Number(process.env.MCP_PORT) || 3100;
app.listen(PORT, () => {
  console.log(`Lab 10 Quiz MCP server on http://localhost:${PORT}/mcp`);
});
